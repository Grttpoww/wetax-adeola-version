# Kantonale Extensions Architektur - Belege & Scans

## Übersicht

Dieses Dokument beschreibt die Architektur für die modulare Einbindung kantonale Extensions, insbesondere für die Einreichung von Belegen und Scans (z.B. Lohnausweise) im eCH-0119 Format.

## Aktuelle Situation

### ✅ Was bereits existiert:

1. **Lohnausweis-Scanning:**
   - Scan-Endpoint: `/api/scan` (POST)
   - Scan-Typen: `Lohnausweis`, `Bankkonto`, `TaxDocument`
   - Daten werden in `TaxReturnData.geldVerdient.data[]` gespeichert
   - Flag `uploadedLohnausweis: boolean` markiert gescannte Lohnausweise

2. **eCH-0119 Struktur:**
   - `AttachmentType` im Header bereits definiert
   - `CantonExtensionType` für kantonale Erweiterungen vorhanden
   - Mapper-Funktionen in `src/ech0119/mappers.ts`

3. **Dokumentenverarbeitung:**
   - AWS Textract + Azure OpenAI Pipeline
   - Base64-Encoding für Uploads
   - Temporäre Verarbeitung (keine dauerhafte Speicherung)

### ❌ Was fehlt:

1. **Dauerhafte Dokumentenspeicherung:**
   - Aktuell werden Dokumente nur temporär verarbeitet
   - Keine persistente Speicherung der Original-Dateien

2. **Attachment-Mapping:**
   - `AttachmentType[]` im Header wird nicht befüllt
   - Keine Zuordnung von gescannten Dokumenten zu eCH-0119 Attachments

3. **Kantonale Modularität:**
   - Nur Zürich hardcoded (`canton: 'ZH'`)
   - Keine modulare Struktur für weitere Kantone

4. **Beleg-Verwaltung:**
   - Keine Verwaltung welche Belege für welchen Kanton erforderlich sind
   - Keine Zuordnung von Belegen zu spezifischen Steuerpositionen

---

## Architektur-Vorschlag

### 1. Dokumentenspeicherung

#### 1.1 Datenbank-Schema Erweiterung

**Neue Collection: `documents`**

```typescript
export type Document = {
  _id: ObjectId
  taxReturnId: ObjectId
  userId: ObjectId
  year: number
  
  // Dokument-Metadaten
  documentType: 'lohnausweis' | 'bankkonto' | 'tax_document' | 'other'
  originalFileName: string
  mimeType: string
  fileSize: number
  
  // Speicherort
  storageType: 's3' | 'mongodb_gridfs' | 'local' // Empfehlung: S3
  storagePath: string // S3 Key oder GridFS ID
  
  // Scan-Ergebnisse
  extractedData?: LohnausweisScanT | BankkontoScanT | any
  scanStatus: 'pending' | 'processing' | 'completed' | 'failed'
  scanError?: string
  
  // eCH-0119 Zuordnung
  ech0119AttachmentId?: string // Referenz zum Attachment im eCH-0119 XML
  documentCanton?: string // "ZH", "BS", etc.
  documentCategory?: string // z.B. "Lohnausweis pro Arbeitgeber"
  
  // Metadaten
  uploadedAt: Date
  scannedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### 1.2 Storage-Strategie

**Option A: AWS S3 (Empfohlen)**
- Skalierbar, kostengünstig
- Direkte Integration mit Textract möglich
- Lifecycle-Policies für Archivierung

**Option B: MongoDB GridFS**
- Einfache Integration (bereits MongoDB vorhanden)
- Keine zusätzliche Infrastruktur
- Begrenzt durch MongoDB-Datenbankgröße

**Option C: Lokales Dateisystem**
- Nur für Entwicklung/Testing
- Nicht für Produktion empfohlen

**Implementierung:**

```typescript
// src/storage/document-storage.ts
export interface DocumentStorage {
  upload(buffer: Buffer, metadata: DocumentMetadata): Promise<string> // returns storagePath
  download(storagePath: string): Promise<Buffer>
  delete(storagePath: string): Promise<void>
  getUrl(storagePath: string, expiresIn?: number): Promise<string> // Signed URL
}

// Implementierung für S3
export class S3DocumentStorage implements DocumentStorage {
  // ...
}
```

### 2. Attachment-Mapping für eCH-0119

#### 2.1 Erweiterte Mapper-Funktion

```typescript
// src/ech0119/mappers.ts

/**
 * Maps documents to eCH-0119 AttachmentType[]
 */
export function mapAttachments(
  taxReturn: TaxReturn,
  documents: Document[],
  canton: string = 'ZH'
): AttachmentType[] {
  const attachments: AttachmentType[] = []
  
  // Lohnausweise gruppieren nach Arbeitgeber
  const lohnausweiseByArbeitgeber = groupLohnausweiseByArbeitgeber(documents)
  
  for (const [arbeitgeber, docs] of Object.entries(lohnausweiseByArbeitgeber)) {
    attachments.push({
      title: `Lohnausweis(e) ${arbeitgeber}`,
      documentFormat: 'application/pdf', // oder 'image/jpeg'
      documentIdentification: {
        documentCanton: canton,
        documentType: getDocumentTypeForCanton('lohnausweis', canton),
      },
      file: docs.map((doc, index) => ({
        pathFileName: doc.storagePath, // S3 Key oder relative Path
        internalSortOrder: index + 1,
      })),
      cantonExtension: canton === 'ZH' ? getZurichExtension(docs) : undefined,
    })
  }
  
  // Weitere Beleg-Typen...
  
  return attachments
}

/**
 * Kanton-spezifische Document-Type Mapping
 */
function getDocumentTypeForCanton(
  documentCategory: string,
  canton: string
): string {
  const mappings: Record<string, Record<string, string>> = {
    ZH: {
      lohnausweis: 'Lohnausweis(e) pro Arbeitgeber',
      bankkonto: 'Bankauszüge',
      // ... weitere ZH-spezifische Typen
    },
    BS: {
      lohnausweis: 'BS_Lohnausweis', // Basel-Stadt spezifisch
      // ...
    },
    // ... weitere Kantone
  }
  
  return mappings[canton]?.[documentCategory] || documentCategory
}
```

#### 2.2 Header-Erweiterung

```typescript
// src/ech0119/mappers.ts - mapHeader erweitern

export async function mapHeader(
  taxReturn: TaxReturn,
  user: User,
  documents?: Document[]
): Promise<ECH0119Header> {
  const header: ECH0119Header = {
    taxPeriod: taxReturn.year.toString(),
    source: 0,
    canton: getCantonFromTaxReturn(taxReturn), // Dynamisch statt hardcoded
    transactionDate: new Date().toISOString(),
    sourceDescription: 'WETAX Mobile App',
  }
  
  // Attachments hinzufügen, falls vorhanden
  if (documents && documents.length > 0) {
    header.attachment = mapAttachments(taxReturn, documents, header.canton || 'ZH')
  }
  
  // Kantonale Extension im Header
  if (header.canton) {
    header.cantonExtension = getCantonExtension(header.canton, taxReturn)
  }
  
  return header
}
```

### 3. Modulare Kanton-Architektur

#### 3.1 Kanton-Registry Pattern

```typescript
// src/cantons/types.ts

export interface CantonConfig {
  code: string // "ZH", "BS", "BE", etc.
  name: string // "Zürich", "Basel-Stadt", etc.
  
  // eCH-0119 spezifisch
  ech0119Namespace?: string
  ech0119SchemaVersion?: string
  
  // Dokument-Typen für diesen Kanton
  requiredDocuments?: DocumentRequirement[]
  optionalDocuments?: DocumentRequirement[]
  
  // Extension-Handler
  extensionHandler?: CantonExtensionHandler
}

export interface DocumentRequirement {
  category: string
  documentType: string // eCH-0119 documentType
  description: string
  required: boolean
  maxFiles?: number
}

export interface CantonExtensionHandler {
  // Erweitert Header mit kanton-spezifischen Daten
  extendHeader?(header: ECH0119Header, taxReturn: TaxReturn): ECH0119Header
  
  // Erweitert MainForm mit kanton-spezifischen Feldern
  extendMainForm?(mainForm: MainFormType, data: TaxReturnData): MainFormType
  
  // Validiert kanton-spezifische Regeln
  validate?(taxReturn: TaxReturn, data: TaxReturnData): ValidationResult[]
  
  // Mappt kanton-spezifische Dokument-Typen
  mapDocumentType?(category: string): string
}

// src/cantons/registry.ts

export class CantonRegistry {
  private static registry: Map<string, CantonConfig> = new Map()
  
  static register(canton: CantonConfig): void {
    this.registry.set(canton.code, canton)
  }
  
  static get(cantonCode: string): CantonConfig | undefined {
    return this.registry.get(cantonCode)
  }
  
  static getAll(): CantonConfig[] {
    return Array.from(this.registry.values())
  }
}

// src/cantons/zurich.ts
export const zurichConfig: CantonConfig = {
  code: 'ZH',
  name: 'Zürich',
  ech0119Namespace: 'http://www.ech.ch/xmlns/eCH-0119/4',
  requiredDocuments: [
    {
      category: 'lohnausweis',
      documentType: 'Lohnausweis(e) pro Arbeitgeber',
      description: 'Lohnausweis(e) für alle Arbeitgeber im Steuerjahr',
      required: true,
    },
    // ... weitere
  ],
  extensionHandler: {
    mapDocumentType: (category: string) => {
      const mapping: Record<string, string> = {
        lohnausweis: 'Lohnausweis(e) pro Arbeitgeber',
        bankkonto: 'Bankauszüge',
        // ...
      }
      return mapping[category] || category
    },
    extendHeader: (header, taxReturn) => {
      // ZH-spezifische Header-Erweiterungen
      return header
    },
  },
}

// src/cantons/index.ts - Registry initialisieren
CantonRegistry.register(zurichConfig)
// Weitere Kantone...
```

#### 3.2 Kanton-Detection

```typescript
// src/cantons/detection.ts

export function getCantonFromTaxReturn(taxReturn: TaxReturn): string {
  // Option 1: Aus personData.taxMunicipality ableiten
  const taxMunicipality = taxReturn.data.personData?.data?.taxMunicipality
  if (taxMunicipality) {
    return getCantonFromBfsNumber(parseInt(taxMunicipality))
  }
  
  // Option 2: Aus gemeindeBfsNumber ableiten
  const gemeindeBfs = taxReturn.data.personData?.data?.gemeindeBfsNumber
  if (gemeindeBfs) {
    return getCantonFromBfsNumber(gemeindeBfs)
  }
  
  // Option 3: Aus stadt/plz ableiten (Fallback)
  const stadt = taxReturn.data.personData?.data?.stadt
  if (stadt) {
    return getCantonFromCity(stadt)
  }
  
  // Default: Zürich (für Backward Compatibility)
  return 'ZH'
}

function getCantonFromBfsNumber(bfsNumber: number): string {
  // BFS-Nummern: Erste 2 Ziffern = Kanton
  // z.B. 261 = Zürich, 1201 = Bern
  const kantonCode = Math.floor(bfsNumber / 10000)
  const kantonMapping: Record<number, string> = {
    1: 'ZH', 2: 'BE', 3: 'LU', 4: 'UR', 5: 'SZ',
    6: 'OW', 7: 'NW', 8: 'GL', 9: 'ZG', 10: 'FR',
    11: 'SO', 12: 'BS', 13: 'BL', 14: 'SH', 15: 'AR',
    16: 'AI', 17: 'SG', 18: 'GR', 19: 'AG', 20: 'TG',
    21: 'TI', 22: 'VD', 23: 'VS', 24: 'NE', 25: 'GE', 26: 'JU',
  }
  return kantonMapping[kantonCode] || 'ZH'
}
```

### 4. Lohnausweis-Einreichung Workflow

#### 4.1 Erweiterter Scan-Endpoint

```typescript
// src/api/api.service.ts - scan() erweitern

export const scan = async (body: ScanBody): Promise<ScanResponse> => {
  // 1. Dokument verarbeiten (wie bisher)
  const extractedData = await processDocument(body.data, body.mimeType, body.type)
  
  // 2. Dokument in Storage speichern
  const documentBuffer = Buffer.from(body.data, 'base64')
  const storage = getDocumentStorage() // S3 oder GridFS
  const storagePath = await storage.upload(documentBuffer, {
    taxReturnId: body.taxReturnId, // Neu: TaxReturn-Referenz
    documentType: body.type,
    mimeType: body.mimeType,
  })
  
  // 3. Document-Metadaten in DB speichern
  const document = await db.collection('documents').insertOne({
    taxReturnId: new ObjectId(body.taxReturnId),
    userId: new ObjectId(body.userId), // Aus Request extrahieren
    year: body.year || new Date().getFullYear(),
    documentType: body.type,
    originalFileName: body.fileName || 'scan.pdf',
    mimeType: body.mimeType,
    fileSize: documentBuffer.length,
    storageType: 's3', // oder 'mongodb_gridfs'
    storagePath,
    extractedData,
    scanStatus: 'completed',
    uploadedAt: new Date(),
    scannedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  
  // 4. TaxReturnData aktualisieren (wie bisher)
  if (body.type === ScanType.Lohnausweis) {
    await updateTaxReturnWithLohnausweis(body.taxReturnId, extractedData)
  }
  
  return {
    success: true,
    extractedData,
    documentId: document.insertedId.toString(),
  }
}
```

#### 4.2 TaxReturnData-Update mit Dokument-Referenz

```typescript
// src/api/api.service.ts

async function updateTaxReturnWithLohnausweis(
  taxReturnId: string,
  lohnausweisData: LohnausweisScanT
): Promise<void> {
  // Bestehende Logik erweitern:
  // - Lohnausweis-Daten in geldVerdient.data[] einfügen
  // - uploadedLohnausweis: true setzen
  // - documentId-Referenz hinzufügen (neu)
  
  const taxReturn = await getTaxReturn(taxReturnId)
  const geldVerdientData = taxReturn.data.geldVerdient?.data || []
  
  // Prüfen ob bereits ein Eintrag für diesen Arbeitgeber existiert
  const existingIndex = geldVerdientData.findIndex(
    (entry) => entry.arbeitgeber === lohnausweisData.lohn.arbeitgeber
  )
  
  const lohnausweisEntry = {
    von: lohnausweisData.lohn.von,
    bis: lohnausweisData.lohn.bis,
    arbeitgeber: lohnausweisData.lohn.arbeitgeber,
    arbeitsort: lohnausweisData.lohn.arbeitsort,
    nettolohn: lohnausweisData.lohn.nettolohn,
    uploadedLohnausweis: true,
    documentId: documentId, // Neu: Referenz zum Document
  }
  
  if (existingIndex >= 0) {
    geldVerdientData[existingIndex] = { ...geldVerdientData[existingIndex], ...lohnausweisEntry }
  } else {
    geldVerdientData.push(lohnausweisEntry)
  }
  
  await updateTaxReturnData(taxReturnId, {
    geldVerdient: {
      data: geldVerdientData,
    },
  })
}
```

### 5. eCH-0119 Export mit Attachments

#### 5.1 Erweiterte Export-Funktion

```typescript
// src/ech0119/export.ts

export async function exportToECH0119(
  taxReturnId: string
): Promise<ECH0119Message> {
  const taxReturn = await getTaxReturn(taxReturnId)
  const user = await getUser(taxReturn.userId)
  const computed = await computeTaxReturn(taxReturn)
  
  // Dokumente laden
  const documents = await db.collection('documents').find({
    taxReturnId: taxReturn._id,
  }).toArray()
  
  // Kanton bestimmen
  const canton = getCantonFromTaxReturn(taxReturn)
  const cantonConfig = CantonRegistry.get(canton)
  
  // Header mit Attachments
  const header = await mapHeader(taxReturn, user, documents)
  if (cantonConfig?.extensionHandler?.extendHeader) {
    header = cantonConfig.extensionHandler.extendHeader(header, taxReturn)
  }
  
  // MainForm
  let mainForm = mapMainForm(taxReturn, taxReturn.data, user, computed)
  if (cantonConfig?.extensionHandler?.extendMainForm) {
    mainForm = cantonConfig.extensionHandler.extendMainForm(mainForm, taxReturn.data)
  }
  
  return {
    '@minorVersion': 0,
    header,
    content: {
      mainForm,
    },
  }
}
```

#### 5.2 XML-Generierung mit Attachments

```typescript
// src/ech0119/xml-generator.ts

export async function generateXML(
  message: ECH0119Message,
  options?: { includeAttachments?: boolean }
): Promise<string> {
  // XML generieren (wie bisher)
  let xml = generateXMLFromMessage(message)
  
  // Attachments als Base64 einbetten oder als Referenzen
  if (options?.includeAttachments && message.header.attachment) {
    for (const attachment of message.header.attachment) {
      for (const file of attachment.file) {
        // Option A: Base64 einbetten (für kleine Dateien)
        const document = await getDocumentByStoragePath(file.pathFileName)
        const fileBuffer = await storage.download(file.pathFileName)
        const base64Content = fileBuffer.toString('base64')
        
        // Option B: Externe Referenz (für große Dateien)
        // Signed URL generieren
        const signedUrl = await storage.getUrl(file.pathFileName, 3600) // 1 Stunde gültig
        
        // Attachment in XML einbetten (je nach eCH-0119 Spezifikation)
      }
    }
  }
  
  return xml
}
```

### 6. Frontend-Integration

#### 6.1 Dokument-Liste in TaxReturn

```typescript
// Frontend: src/view/authenticated/taxReturn/DocumentsOverview.tsx

export const DocumentsOverview = () => {
  const { taxReturnId } = useTaxReturn()
  const { data: documents } = useQuery({
    queryKey: ['documents', taxReturnId],
    queryFn: () => ApiService.getDocuments(taxReturnId),
  })
  
  return (
    <View>
      <Text>Hochgeladene Belege</Text>
      {documents?.map((doc) => (
        <DocumentCard
          key={doc._id}
          document={doc}
          onView={() => viewDocument(doc)}
          onDelete={() => deleteDocument(doc._id)}
        />
      ))}
      <Button onPress={() => navigateToScan('lohnausweis')}>
        Lohnausweis scannen
      </Button>
    </View>
  )
}
```

#### 6.2 Scan-Ergebnis mit Dokument-Referenz

```typescript
// Frontend: Nach erfolgreichem Scan

const handleScanSuccess = async (scanResult: ScanResponse) => {
  // Dokument-ID wird jetzt zurückgegeben
  const documentId = scanResult.documentId
  
  // TaxReturnData wird automatisch aktualisiert
  // Optional: Dokument in Liste anzeigen
  queryClient.invalidateQueries(['documents', taxReturnId])
}
```

---

## Implementierungs-Roadmap

### Phase 1: Dokumentenspeicherung (Woche 1-2)
- [ ] Document-Schema in MongoDB erstellen
- [ ] Storage-Interface definieren
- [ ] S3-Integration implementieren (oder GridFS)
- [ ] Scan-Endpoint erweitern für Dokumentenspeicherung

### Phase 2: Attachment-Mapping (Woche 3)
- [ ] `mapAttachments()` Funktion implementieren
- [ ] Kanton-spezifische Document-Type Mapping
- [ ] Header-Erweiterung mit Attachments
- [ ] Tests für verschiedene Dokument-Typen

### Phase 3: Kanton-Registry (Woche 4)
- [ ] CantonConfig Interface definieren
- [ ] CantonRegistry implementieren
- [ ] Zürich-Config erstellen
- [ ] Kanton-Detection implementieren
- [ ] Erste Extension-Handler (Zürich)

### Phase 4: eCH-0119 Export (Woche 5)
- [ ] Export-Funktion mit Attachments erweitern
- [ ] XML-Generierung mit Attachment-Einbindung
- [ ] Tests für vollständigen Export

### Phase 5: Weitere Kantone (Woche 6+)
- [ ] Basel-Stadt Config
- [ ] Bern Config
- [ ] Weitere Kantone nach Bedarf

---

## Beispiel: Lohnausweis-Einreichung für Zürich

### 1. User scannt Lohnausweis
```
POST /api/scan
{
  "data": "base64...",
  "mimeType": "application/pdf",
  "type": "Lohnausweis",
  "taxReturnId": "507f1f77bcf86cd799439011"
}
```

### 2. Backend verarbeitet
- Textract extrahiert Daten
- Azure OpenAI strukturiert JSON
- Dokument wird in S3 gespeichert
- Document-Metadaten in MongoDB gespeichert
- TaxReturnData.geldVerdient wird aktualisiert

### 3. eCH-0119 Export
```xml
<ech0119:header>
  <ech0119:attachment>
    <ech0119:title>Lohnausweis(e) Firma AG</ech0119:title>
    <ech0119:documentFormat>application/pdf</ech0119:documentFormat>
    <ech0119:documentIdentification>
      <ech0119:documentCanton>ZH</ech0119:documentCanton>
      <ech0119:documentType>Lohnausweis(e) pro Arbeitgeber</ech0119:documentType>
    </ech0119:documentIdentification>
    <ech0119:file>
      <ech0119:pathFileName>tax-returns/507f1f77bcf86cd799439011/lohnausweis-1.pdf</ech0119:pathFileName>
      <ech0119:internalSortOrder>1</ech0119:internalSortOrder>
    </ech0119:file>
  </ech0119:attachment>
</ech0119:header>
```

---

## Vorteile dieser Architektur

1. **Modularität:** Neue Kantone können einfach hinzugefügt werden
2. **Skalierbarkeit:** Storage-Lösung (S3) skaliert automatisch
3. **Wartbarkeit:** Klare Trennung zwischen Kantonen
4. **Erweiterbarkeit:** Extension-Handler ermöglichen kanton-spezifische Logik
5. **Rückwärtskompatibilität:** Bestehende Funktionalität bleibt erhalten

---

## Offene Fragen / Entscheidungen

1. **Storage-Lösung:** S3 vs. GridFS vs. andere?
2. **Attachment-Format:** Base64 einbetten vs. externe Referenzen?
3. **Dokument-Lebenszyklus:** Wie lange speichern? Archivierung?
4. **Zugriffskontrolle:** Wie werden Dokumente geschützt?
5. **Versionierung:** Was passiert bei Updates der Steuererklärung?

