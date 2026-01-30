# Kantonale XML-Extension Analyse
## Basis: eCH-0119 Export → Zürich Extension (2024_zh-taxdeclaration-it-9-1_V1.1.xsd)

**Datum:** 2025  
**Ziel:** Valide kantonale XML-Extension basierend auf bestehendem eCH-119 Export implementieren

---

## A. Bestehender nationaler Export (eCH-119)

### 1. Welche Module/Felder sind aktuell im eCH-119 Export implementiert?

**Status:** Phase 1 implementiert (~70% Coverage für Standard-Employee-Steuererklärungen)

#### ✅ Implementierte Module:

**Header (`headerType`):**
- `taxPeriod` (Steuerjahr)
- `source` (0 = Software)
- `canton` ("ZH" hardcoded)
- `transactionDate` (ISO 8601)
- `sourceDescription` ("WETAX Mobile App")
- ❌ `cantonExtension` **NICHT implementiert** (wird für kantonale Extension benötigt!)

**Person Data Partner 1 (`personDataPartner1Type`):**
- `partnerPersonIdentification` (officialName, firstName, vn, dateOfBirth)
- `addressInformation` (street, houseNumber, town, swissZipCode, country)
- `maritalStatusTax` (zivilstand → Integer)
- `religion` (konfession → Integer)
- `job`, `employer`, `placeOfWork`
- `phoneNumberPrivate`
- `taxMunicipality` (BFS-Nummer)
- ❌ `cantonExtension` **NICHT implementiert**

**Revenue (`revenueType`):**
- `employedMainRevenue/partner1Amount` (totalEinkuenfte)
- `securitiesRevenue` (bruttoertragA/B)
- `totalAmountRevenue`
- ❌ Viele Felder fehlen: `employedSidelineRevenue`, `selfemployedMainRevenue`, `pension1Partner1`, `unemploymentInsurance`, `childAllowances`, etc.
- ❌ `cantonExtension` **NICHT implementiert**

**Deduction (`deductionType`):**
- `jobExpensesPartner1` (totalBerufsauslagenStaat/Bund)
- `provision3aPartner1Deduction` (max 7'056 CHF)
- `insuranceAndInterest` (versicherungenTotalStaat/Bund)
- `furtherDeductionJobOrientedFurtherEducationCost`
- `paymentPensionDeduction` (Säule 2)
- `furtherDeductionProvision` (AHV/IV Säule 2 selbst bezahlt)
- `paymentAlimonyChild`
- `totalAmountDeduction`
- ❌ `jobExpensesPartner2` fehlt
- ❌ `cantonExtension` **NICHT implementiert**

**Revenue Calculation (`revenueCalculationType`):**
- `totalAmountRevenue`, `totalAmountDeduction`, `netIncome`
- `deductionCharity` (spenden)
- `adjustedNetIncome` (reineinkommen)
- `socialDeductionHomeChild`, `socialDeductionExternalChild`
- `totalAmountFiscalRevenue`
- ❌ `cantonExtension` **NICHT implementiert**

**Asset (`assetType`):**
- `movablePropertyCashValue` (bargeld)
- `movablePropertySecuritiesAndAssets` (wertschriften)
- `movablePropertyHeritageEtc` (edelmetalle)
- `movablePropertyVehicle` (mit Details: description, purchasePrice, year)
- `totalAmountAssets`, `totalAmountFiscalAssets`
- ❌ `cantonExtension` **NICHT implementiert**

#### ❌ Nicht implementierte Module (Phase 2/3):
- `personDataPartner2` (Ehepartner)
- `childData` (Kinder)
- `listOfSecurities` (detailliertes Wertschriftenverzeichnis)
- `listOfLiabilities` (Schuldenverzeichnis)
- `jobExpenses` (detaillierte Berufsauslagen)
- `jobOrientedFurtherEducationCost` (detailliert)
- `insurancePremiums` (detailliert)
- `diseaseAndAccidentExpenses`
- `handicapExpenses`
- `qualifiedInvestmentsPrivate/Business`
- `benefit` (Leistungen)

---

### 2. Welche Felder oder Komponenten haben beim nationalen Export Probleme verursacht?

#### Bekannte Probleme aus Code-Analyse:

**a) Element-Reihenfolge (XSD Sequence):**
- **Problem:** XSD definiert strikte Sequenz, XML-Generator muss Reihenfolge beachten
- **Beispiel:** `partnerPersonIdentification` muss sein: `cantonExtension?`, `officialName`, `firstName`, `sex?`, `dateOfBirth?`, `vn`, `otherPersonId*`
- **Status:** ✅ Aktuell korrekt implementiert in `xml-generator.ts:145-155`

**b) Optional vs. Required Felder:**
- **Problem:** Viele Felder sind `minOccurs="0"`, aber logisch erforderlich
- **Beispiel:** `taxMunicipality` ist optional, aber für ZH-Export wahrscheinlich Pflicht
- **Status:** ⚠️ Validierung prüft nur Basis-Felder, nicht alle logischen Abhängigkeiten

**c) Datentyp-Konvertierungen:**
- **Problem:** WETAX verwendet andere Formate als eCH-0119
- **Beispiele:**
  - Datum: WETAX "20.10.2001" → eCH-0119 "2001-10-20" ✅ Implementiert
  - Zivilstand: WETAX String → eCH-0119 Integer ✅ Implementiert
  - Religion: WETAX String → eCH-0119 Integer ✅ Implementiert
  - Money: WETAX in Rappen → eCH-0119 in Rappen ✅ Korrekt
- **Status:** ✅ Konvertierungen funktionieren

**d) Adress-Parsing:**
- **Problem:** WETAX speichert Adresse als String "Gossauerstrasse 42", eCH-0119 braucht `street` + `houseNumber`
- **Status:** ✅ Implementiert in `mappers.ts:42-59` (parsing mit Regex)

**e) Fehlende Daten-Mappings:**
- **Problem:** Viele eCH-0119 Felder haben keine direkte Entsprechung in WETAX
- **Beispiele:**
  - `sex` (Geschlecht) - kann aus AHV-Nummer abgeleitet werden, aber nicht implementiert
  - `otherPersonId` - nicht implementiert
  - `phoneNumberBusiness` - nicht implementiert
- **Status:** ⚠️ Teilweise implementiert, viele Felder fehlen

**f) Partner 2 / Kinder:**
- **Problem:** WETAX hat Partner-Daten in `personData.data.partner2*`, aber eCH-0119 braucht `personDataPartner2`
- **Status:** ❌ Nicht implementiert (Phase 2)

**g) Säule 3a Limit:**
- **Problem:** Hardcoded Limit 7'056 CHF (2024), muss jährlich aktualisiert werden
- **Status:** ⚠️ Hardcoded in `mappers.ts:233`

**h) Berechnete Werte:**
- **Problem:** Viele Felder müssen aus `computed` kommen, nicht direkt aus `data`
- **Status:** ✅ Korrekt implementiert (z.B. `totalEinkuenfte`, `totalAbzuegeStaat`)

---

### 3. Gibt es Unit Tests oder Validatoren, die bestätigen, dass die eCH-119 XMLs korrekt sind?

#### Tests:

**Unit Tests:**
- ✅ `src/tests/api.controller.test.ts` - Prüft, dass Endpoint existiert
- ❌ **KEINE Tests für XML-Generierung**
- ❌ **KEINE Tests für Mapping-Funktionen**
- ❌ **KEINE Tests für Validierung**

**Validierung:**
- ✅ `validateECH0119Export()` in `src/ech0119/index.ts:56-83`
  - Prüft: Steuerjahr (2020-2026)
  - Prüft: AHV-Nummer Format (Regex: `^\d{3}\.\d{4}\.\d{4}\.\d{2}$`)
  - Prüft: Nachname, Vorname vorhanden
  - Prüft: Adresse vollständig (Strasse, Ort, PLZ)
  - Prüft: PLZ Format (4-stellig)
- ❌ **KEINE XSD-Schema-Validierung** (XML wird nicht gegen XSD geprüft)
- ❌ **KEINE Online-Validierung** (z.B. ESTV-Sandbox)

**Manuelle Tests:**
- ✅ Script: `scripts/generate-sample-ech0119.ts` - Generiert Sample-XML
- ❌ **KEINE dokumentierten Test-Cases**
- ❌ **KEINE Validierung gegen eCH-0119-4-0-0.xsd**

#### ⚠️ Kritische Lücke:
**Es gibt KEINE automatische XSD-Validierung!** XML könnte strukturell falsch sein, ohne dass es erkannt wird.

---

### 4. Wie sind die Daten aktuell modelliert?

#### Datenmodell-Struktur:

**Backend (TypeScript):**
- **Types:** `src/types.ts` - Definiert `TaxReturnData`, `TaxReturn`, `User`, `ComputedTaxReturnT`
- **Mapping:** `src/ech0119/mappers.ts` - Mappt `TaxReturnData` → eCH-0119 TypeScript Interfaces
- **eCH-0119 Types:** `src/ech0119/types.ts` - TypeScript Interfaces für eCH-0119 Struktur
- **XML-Generator:** `src/ech0119/xml-generator.ts` - Generiert XML aus TypeScript-Objekten

**Datenfluss:**
```
TaxReturn (MongoDB)
  ↓
TaxReturnData (TypeScript)
  ↓
computeTaxReturn() → ComputedTaxReturnT
  ↓
mapHeader(), mapMainForm() → ECH0119Message (TypeScript)
  ↓
generateECH0119XML() → XML String
```

**Mapping-Strategie:**
- **Funktions-basiert:** Jedes Modul hat eigene Mapping-Funktion (`mapHeader`, `mapPersonDataPartner1`, `mapRevenue`, etc.)
- **Computed Values:** Nutzt `computed` für berechnete Felder (z.B. `totalEinkuenfte`, `totalAbzuegeStaat`)
- **Optional Fields:** Felder werden nur hinzugefügt, wenn Wert vorhanden (`if (value) { ... }`)

**Technologie:**
- **XML-Bibliothek:** `xmlbuilder2@^4.0.3`
- **Typisierung:** Vollständig typisiert mit TypeScript Interfaces

**Probleme:**
- ❌ Keine automatische Validierung gegen XSD
- ❌ Hardcoded Werte (z.B. Säule 3a Limit, Kanton "ZH")
- ❌ Keine Konfiguration für verschiedene Steuerjahre/Limits

---

## B. Kantonale Extension XSD

### 5. Wie groß / komplex ist die Extension?

**Datei:** `2024_zh-taxdeclaration-it-9-1_V1.1.xsd`  
**Größe:** ~2'868 Zeilen  
**Namespace:** `http://www.zh.ch/xmlns/zh-taxdeclaration-it/ech3-0/9`  
**Prefix:** `zh:`

#### Hauptkomponenten:

**1. Header Extension (`headerExtensionType`):**
- `hiddenData` - Versteckte Daten (z.B. `differenceInPropertyRevenueP1`, `selfEmploymentP1`)
- `approvalReceipt` - Freigabequittung (z.B. `roundedTaxableIncome`, `taxReturnKind`)
- `sourceSystem` - System-Informationen (System, Version, OS, Browser, Datum)
- `documentList` - Belegliste (Array von `documentType`, `documentDeliveryMethod`, `documentDescription`)
- `reducedDispatch` - Reduzierte Zustellung (Boolean)
- `versionFK` - Version FK (String)
- `clientPasswordProtection` - Passwortschutz (Boolean)
- `scanning` - Scanning-Informationen (sehr komplex, viele Boolean-Flags)
- `triageKind` - Triage-Art ("K" = Kantonales Steueramt, "G" = Gemeinde)
- `taxGroup` - Steuergruppe (String)
- `limitedTaxLiability` - Beschränkte Steuerpflicht (Boolean)
- `businessPortal` - Business Portal (Boolean)

**2. Content Extension (`contentExtensionType`):**
- `listOfProperties` - **Aufstellung Liegenschaften** (sehr komplex!)
  - `property` (Array) - Pro Liegenschaft:
    - `propertyEarnings` - Ertrag
    - `propertyMaintenanceCosts` - Unterhaltskosten
    - `propertyNumber`, `town`, `cantonOrCountry`, `street`
    - `typeOfProperty`, `area`, `agriculturalUse`
    - `use` (1=self used, 2=used by others, 3=mixed)
    - `usufruct`, `rightOfResidence`
    - `purchaseDate`, `saleDate`
    - `capitalizedValue`, `commercialValue`
    - `rentEarningsPrivate`, `rentEarningsBusiness`, `rentEarningsTotal`
    - `maintenanceCostsFlatRate`, `maintenanceCostsReal`
    - `remainingsEarnings`
- `da1` - DA-1 Formular (Wertschriftenverzeichnis)
- `commentary` - Kommentare
- `inventoryQuestionnaire` - Inventarfragebogen
- `safeOpeningProtocol` - Tresoröffnungsprotokoll

**3. Person Data Extensions:**
- `personDataPartner1Extension` - Erweiterte Personendaten Partner 1
- `personDataPartner2Extension` - Erweiterte Personendaten Partner 2
- `childDataInhouseExtension` - Erweiterte Kinddaten (z.B. `receivedAlimonyPayer`, `externalCareDetail`)

#### Komplexität:

**Anzahl komplexer Typen:** ~30+ `complexType` Definitionen

**Verschachtelung:**
- `headerExtension` → `hiddenData`, `approvalReceipt`, `sourceSystem[]`, `documentList[]`, `scanning`
- `contentExtension` → `listOfProperties` → `property[]` → `propertyEarnings`, `propertyMaintenanceCosts`
- `propertyEarnings` → `earningsDetail[]`
- `propertyMaintenanceCosts` → `maintenanceCostsDetail[]`

**Pflichtfelder:**
- ⚠️ **Viele Felder sind `minOccurs="0"`, aber logisch erforderlich**
- Beispiel: `headerExtension` ist optional, aber für ZH-Export wahrscheinlich Pflicht
- Beispiel: `listOfProperties` ist optional, aber wenn Liegenschaften vorhanden, dann Pflicht

**Besondere Strukturen:**
- **Array-Elemente:** `property[]`, `earningsDetail[]`, `maintenanceCostsDetail[]`
- **Enumerations:** `documentType` (100+ Werte), `useType`, `countryIfAbroadType`
- **Boolean-Flags:** `scanning` hat 50+ Boolean-Felder

#### ⚠️ Kritische Komplexität:
**`listOfProperties` ist sehr komplex** und erfordert detaillierte Mapping-Logik für:
- Ertragsberechnung (Eigenmietwert vs. Mietzinsertrag)
- Unterhaltskosten (Pauschal vs. Effektiv)
- Vermögenssteuerwert
- Geschäftliche Nutzung

---

### 6. Gibt es bekannte Problemfelder oder Unklarheiten in der XSD?

#### Identifizierte Problemfelder:

**a) Optional vs. Pflicht:**
- **Problem:** Viele Felder sind `minOccurs="0"`, aber logisch erforderlich
- **Beispiel:** `headerExtension` ist optional, aber für ZH-Export wahrscheinlich Pflicht
- **Lösung:** Validierungslogik muss prüfen, ob Extension-Felder vorhanden sein müssen

**b) Abhängigkeiten:**
- **Problem:** Felder hängen voneinander ab
- **Beispiel:** Wenn `listOfProperties` vorhanden, dann müssen `property[]` Einträge vorhanden sein
- **Beispiel:** Wenn `maintenanceCostsReal` vorhanden, dann muss `maintenanceCostsDetail[]` vorhanden sein
- **Lösung:** Cross-Field-Validierung implementieren

**c) Enumerations:**
- **Problem:** Viele Enumerations haben 100+ Werte (z.B. `documentType`)
- **Beispiel:** `documentType` hat Werte "01" bis "999", "2300", "3100", etc.
- **Lösung:** Mapping-Tabellen für alle Enumerations erstellen

**d) Datentypen:**
- **Problem:** `scanning` hat viele Boolean-Flags mit kryptischen Namen (z.B. `R0-60001-0`, `R300_STE1_46001`)
- **Lösung:** Dokumentation/Mapping-Tabelle für alle Flags

**e) Verschachtelung:**
- **Problem:** `propertyEarnings` und `propertyMaintenanceCosts` sind verschachtelt in `property`
- **Beispiel:** `property` → `propertyEarnings` → `earningsDetail[]`
- **Lösung:** Rekursive Mapping-Funktionen

**f) Fehlende Dokumentation:**
- **Problem:** Viele Felder haben keine deutsche Dokumentation
- **Beispiel:** `hiddenData` Felder sind nicht dokumentiert
- **Lösung:** Kontakt mit ZH-Steueramt für Klärung

**g) Namespace-Handling:**
- **Problem:** Extension verwendet eigenen Namespace `zh:`, muss korrekt in XML deklariert werden
- **Lösung:** XML-Generator muss `xmlns:zh` Namespace hinzufügen

---

### 7. Welche Validierungsmöglichkeiten existieren aktuell?

#### Aktuelle Validierung:

**Lokal:**
- ❌ **KEINE XSD-Validierung** implementiert
- ✅ Basis-Validierung in `validateECH0119Export()` (Steuerjahr, AHV, Adresse)
- ❌ **KEINE Validierung für Extension-Felder**

**Online:**
- ❌ **KEINE Online-Validierung** bekannt
- ⚠️ ESTV könnte Sandbox haben, aber nicht dokumentiert

**Tools:**
- ⚠️ `xmlbuilder2` generiert XML, aber validiert nicht gegen XSD
- ❌ **KEINE XSD-Validierungsbibliothek** installiert (z.B. `libxmljs`, `xsd-schema-validator`)

#### Empfehlungen:

**Für kantonale Extension:**
1. **XSD-Validierung implementieren:**
   - Bibliothek: `libxmljs` oder `xsd-schema-validator`
   - Validierung nach XML-Generierung
   - Fehler-Reporting mit XPath zu fehlerhaften Elementen

2. **Erweiterte Validierung:**
   - Cross-Field-Validierung (z.B. wenn `listOfProperties` vorhanden, dann `property[]` Pflicht)
   - Business-Logic-Validierung (z.B. `maintenanceCostsReal` nur wenn `maintenanceCostsDetail[]` vorhanden)
   - Enumerations-Validierung (z.B. `documentType` muss gültiger Wert sein)

3. **Test-Validierung:**
   - Unit Tests mit Sample-XML gegen XSD
   - Integration Tests mit realen Daten
   - Regression Tests für bekannte Edge Cases

---

## C. Implementierung & Architektur

### 8. Welche Technik/Strategie willst du nutzen, um die kantonale XML-Extension zu erzeugen?

#### Empfohlene Strategie:

**Basierend auf bestehender eCH-0119 Implementierung:**

**1. Modularer Ansatz (wie aktuell):**
- **Separate Mapping-Funktionen** pro Extension-Modul:
  - `mapHeaderExtension()` → `headerExtensionType`
  - `mapContentExtension()` → `contentExtensionType`
  - `mapListOfProperties()` → `listOfPropertiesType`
  - `mapProperty()` → `propertyType`
  - etc.

**2. XML-Generator-Erweiterung:**
- **Erweitere `xml-generator.ts`** mit neuen Build-Funktionen:
  - `buildHeaderExtension()`
  - `buildContentExtension()`
  - `buildListOfProperties()`
  - `buildProperty()`
  - etc.

**3. TypeScript-Interfaces:**
- **Erweitere `types.ts`** mit Extension-Types:
  - `HeaderExtensionType`
  - `ContentExtensionType`
  - `ListOfPropertiesType`
  - `PropertyType`
  - etc.

**4. Namespace-Handling:**
- **XML-Generator muss `xmlns:zh` Namespace hinzufügen:**
  ```typescript
  xmlns:zh="http://www.zh.ch/xmlns/zh-taxdeclaration-it/ech3-0/9"
  ```
- **Extension-Elemente müssen mit `zh:` Prefix generiert werden**

**5. Integration in bestehenden Flow:**
```
exportECH0119()
  ↓
mapHeader() → füge cantonExtension hinzu
  ↓
mapMainForm() → füge cantonExtension hinzu (falls benötigt)
  ↓
mapContentExtension() → neue Funktion
  ↓
generateECH0119XML() → erweitere mit Extension-Build-Funktionen
```

#### Technologie-Stack:

**Bestehend:**
- `xmlbuilder2@^4.0.3` - XML-Generierung
- TypeScript - Typisierung

**Empfohlen (neu):**
- `libxmljs` oder `xsd-schema-validator` - XSD-Validierung
- `fast-xml-parser` (optional) - XML-Parsing für Tests

---

### 9. Wie soll modular gearbeitet werden?

#### Empfohlene Modularität:

**1. Pro `complexType` (wie aktuell):**
- **Ein Mapping-Modul pro komplexem Typ:**
  - `mappers-header-extension.ts` → `mapHeaderExtension()`
  - `mappers-content-extension.ts` → `mapContentExtension()`
  - `mappers-properties.ts` → `mapListOfProperties()`, `mapProperty()`
  - `mappers-da1.ts` → `mapDA1()` (falls benötigt)

**2. Pro logischer Block:**
- **Gruppierung nach Funktionalität:**
  - **Header-Block:** `mappers-header-extension.ts` (alle Header-Extension-Felder)
  - **Properties-Block:** `mappers-properties.ts` (Liegenschaften)
  - **DA1-Block:** `mappers-da1.ts` (Wertschriftenverzeichnis)
  - **Person-Block:** `mappers-person-extension.ts` (Person-Extensions)

**3. XML-Generator-Modularität:**
- **Separate Build-Funktionen pro Typ:**
  - `build-header-extension.ts` → `buildHeaderExtension()`
  - `build-content-extension.ts` → `buildContentExtension()`
  - `build-properties.ts` → `buildListOfProperties()`, `buildProperty()`

**4. Type-Definitionen:**
- **Separate Datei für Extension-Types:**
  - `types-extension.ts` → Alle `zh:*` Types

#### Datei-Struktur (empfohlen):

```
src/ech0119/
├── types.ts                    # eCH-0119 Basis-Types (bestehend)
├── types-extension.ts          # ZH Extension Types (NEU)
├── mappers.ts                  # eCH-0119 Basis-Mapper (bestehend)
├── mappers-header-extension.ts # Header Extension Mapper (NEU)
├── mappers-content-extension.ts # Content Extension Mapper (NEU)
├── mappers-properties.ts       # Properties Mapper (NEU)
├── xml-generator.ts            # eCH-0119 XML-Generator (erweitern)
├── xml-generator-extension.ts  # Extension XML-Generator (NEU)
├── validator.ts                # XSD-Validator (NEU)
└── index.ts                    # Main Export (erweitern)
```

#### Vorteile dieser Struktur:

1. **Separation of Concerns:** Extension-Code ist getrennt von Basis-Code
2. **Wartbarkeit:** Änderungen an Extension beeinflussen Basis-Code nicht
3. **Testbarkeit:** Jedes Modul kann einzeln getestet werden
4. **Skalierbarkeit:** Weitere Kantone können eigene Extension-Module haben

---

### 10. Wie sollen Defaults oder Dummywerte behandelt werden, wenn Felder nicht direkt aus eCH-119 abgeleitet werden können?

#### Strategie für Defaults/Dummywerte:

**1. Pflichtfelder ohne Datenquelle:**

**a) `headerExtension.sourceSystem`:**
- **Problem:** WETAX hat keine System-Informationen
- **Lösung:** Hardcoded Defaults:
  ```typescript
  system: "WETAX Mobile App"
  version: "1.0.0" // aus package.json
  operatingSystem: process.platform // "win32", "linux", "darwin"
  browser: "Mobile App" // oder undefined
  date: new Date().toISOString().split('T')[0] // ISO-Datum
  ```

**b) `headerExtension.scanning`:**
- **Problem:** WETAX ist keine Scanning-Software
- **Lösung:** Defaults setzen:
  ```typescript
  minSet: false
  defaultValues: false
  fileTyp: undefined // oder weglassen
  opCode: "00" // Produktion
  nachrichtenTyp: "SCAN" // normale Deklaration
  ```

**c) `headerExtension.triageKind`:**
- **Problem:** WETAX weiß nicht, ob Kanton oder Gemeinde
- **Lösung:** Default "K" (Kantonales Steueramt) oder aus `taxMunicipality` ableiten

**d) `headerExtension.approvalReceipt`:**
- **Problem:** Berechnete Werte müssen aus `computed` kommen
- **Lösung:** Aus `computed` mappen:
  ```typescript
  roundedTaxableIncome: {
    cantonalTax: Math.round(computed.reineinkommenStaat),
    federalTax: Math.round(computed.reineinkommenBund)
  }
  roundedRatedeterminingIncome: { ... }
  roundedTaxableAsset: Math.round(computed.totalVermoegenswerte)
  ```

**2. Optionale Felder:**

**a) `headerExtension.documentList`:**
- **Problem:** WETAX hat keine Belegliste
- **Lösung:** **WEGLASSEN** (optional, `minOccurs="0"`)

**b) `contentExtension.listOfProperties`:**
- **Problem:** WETAX hat `liegenschaften.data[]`, aber nicht alle Felder
- **Lösung:** **Nur mappen, wenn Daten vorhanden**, fehlende Felder weglassen

**3. Fehlende Daten mit Business-Logic:**

**a) `property.use`:**
- **Problem:** WETAX hat `istGeschaeftlich`, aber nicht `use`
- **Lösung:** Ableiten:
  ```typescript
  if (istGeschaeftlich) {
    use: 3 // mixed use
  } else {
    use: 1 // self used (Standard)
  }
  ```

**b) `property.maintenanceCostsReal`:**
- **Problem:** WETAX hat `unterhaltArt` ('pauschal' | 'effektiv')
- **Lösung:** Nur mappen, wenn `unterhaltArt === 'effektiv'`

**4. Dummywerte vermeiden:**

**⚠️ WICHTIG:** **KEINE Dummywerte verwenden!**
- Wenn Daten fehlen → Feld **weglassen** (nicht mit 0 oder "" füllen)
- Nur mappen, wenn **valide Daten vorhanden**
- Validierung sollte prüfen, ob **logisch erforderliche Felder** vorhanden sind

**5. Dokumentation:**

**Jedes Default/Dummywert muss dokumentiert sein:**
- **Warum** wird dieser Wert verwendet?
- **Woher** kommt der Wert?
- **Ist** der Wert valide für alle Fälle?

---

### 11. Welche Anforderungen gibt es an Dokumentation oder Rechtfertigung der Felder?

#### Dokumentations-Anforderungen:

**1. Code-Dokumentation:**

**a) Jede Mapping-Funktion:**
```typescript
/**
 * Maps WETAX liegenschaften data to ZH Extension listOfProperties
 * 
 * @param data - TaxReturnData with liegenschaften
 * @param computed - ComputedTaxReturnT with calculated values
 * @returns listOfPropertiesType or undefined if no properties
 * 
 * Mapping Rules:
 * - Only maps if liegenschaften.data[] has entries
 * - unterhaltArt 'pauschal' → maintenanceCostsFlatRate
 * - unterhaltArt 'effektiv' → maintenanceCostsReal + maintenanceCostsDetail[]
 * - istGeschaeftlich → use: 3 (mixed use)
 * 
 * Missing Fields (not mapped):
 * - propertyEarnings.earningsDetail[] (not in WETAX data model)
 * - propertyMaintenanceCosts.maintenanceCostsDetail[] (only if effektiv)
 */
export function mapListOfProperties(
  data: TaxReturnData,
  computed: ComputedTaxReturnT
): ListOfPropertiesType | undefined {
  // ...
}
```

**b) Jedes Default-Wert:**
```typescript
// Default: "K" (Kantonales Steueramt)
// Reason: WETAX is used for cantonal tax returns, not municipal
// Source: ZH Extension XSD documentation
triageKind: "K"
```

**2. Mapping-Dokumentation:**

**Separate Datei:** `MAPPING_DOCUMENTATION.md`
- **Tabelle:** WETAX Feld → eCH-0119 Feld → ZH Extension Feld
- **Fehlende Felder:** Liste aller Extension-Felder, die nicht gemappt werden können
- **Default-Werte:** Liste aller Defaults mit Begründung
- **Edge Cases:** Bekannte Probleme und Lösungen

**3. Validierungs-Dokumentation:**

**Separate Datei:** `VALIDATION_RULES.md`
- **Pflichtfelder:** Liste aller logisch erforderlichen Felder
- **Abhängigkeiten:** Cross-Field-Validierungsregeln
- **Business-Logic:** Validierungsregeln, die nicht aus XSD kommen

**4. Test-Dokumentation:**

**Separate Datei:** `TEST_CASES.md`
- **Test-Cases:** Beispiele für verschiedene Szenarien
- **Edge Cases:** Bekannte Probleme und wie sie getestet werden
- **Regression Tests:** Tests für bekannte Bugs

**5. Rechtfertigung für fehlende Felder:**

**Wenn Feld nicht gemappt werden kann:**
- **Dokumentieren:** Warum kann es nicht gemappt werden?
- **Alternative:** Gibt es eine Alternative?
- **Zukunft:** Kann es in Zukunft gemappt werden?

**Beispiel:**
```markdown
## Fehlende Felder

### propertyEarnings.earningsDetail[]
- **Grund:** WETAX speichert nur Gesamtbetrag, nicht detaillierte Ertragsaufstellung
- **Alternative:** Kann aus `liegenschaften.data[].eigenmietwertOderMietertrag` abgeleitet werden
- **Zukunft:** Wenn WETAX detaillierte Ertragsaufstellung einführt, dann mappen
```

---

## D. Edge Cases & Lessons Learned

### 12. Welche Edge Cases aus der nationalen Implementation müssen unbedingt gefixt werden?

#### Identifizierte Edge Cases:

**1. Element-Reihenfolge:**
- **Problem:** XSD definiert strikte Sequenz, Reihenfolge muss korrekt sein
- **Status:** ✅ Aktuell korrekt, aber für Extension prüfen
- **Fix:** XML-Generator muss Reihenfolge für Extension-Elemente beachten

**2. Namespace-Handling:**
- **Problem:** Extension verwendet eigenen Namespace `zh:`
- **Status:** ❌ Nicht implementiert
- **Fix:** XML-Generator muss `xmlns:zh` Namespace hinzufügen

**3. Optional vs. Pflicht:**
- **Problem:** Viele Extension-Felder sind `minOccurs="0"`, aber logisch erforderlich
- **Status:** ⚠️ Validierung prüft nicht alle Abhängigkeiten
- **Fix:** Erweiterte Validierung für Extension-Felder

**4. Array-Handling:**
- **Problem:** `property[]` Array muss korrekt generiert werden
- **Status:** ⚠️ Nicht getestet für Extension
- **Fix:** Tests für Array-Generierung

**5. Datentyp-Konvertierungen:**
- **Problem:** Extension verwendet andere Datentypen (z.B. `xs:date` für `purchaseDate`)
- **Status:** ⚠️ Nicht implementiert
- **Fix:** Konvertierungs-Funktionen für Extension-Datentypen

**6. Fehlende Daten:**
- **Problem:** Viele Extension-Felder haben keine Entsprechung in WETAX
- **Status:** ⚠️ Nicht dokumentiert
- **Fix:** Dokumentation aller fehlenden Felder

**7. Berechnete Werte:**
- **Problem:** Extension benötigt berechnete Werte (z.B. `roundedTaxableIncome`)
- **Status:** ⚠️ Nicht implementiert
- **Fix:** Mapping aus `computed` für Extension-Felder

**8. Boolean-Flags:**
- **Problem:** `scanning` hat viele Boolean-Flags, die nicht gemappt werden können
- **Status:** ❌ Nicht implementiert
- **Fix:** Defaults für alle Boolean-Flags dokumentieren

---

### 13. Welche Datenlogik oder Transformationen wurden bisher falsch umgesetzt?

#### Identifizierte Probleme:

**1. Säule 3a Limit:**
- **Problem:** Hardcoded 7'056 CHF (2024), muss jährlich aktualisiert werden
- **Status:** ⚠️ Hardcoded in `mappers.ts:233`
- **Fix:** Konfigurationsdatei für Steuerjahr-Limits

**2. Kinderabzüge:**
- **Problem:** Hardcoded Werte (9'300 CHF Staat, 6'800 CHF Bund)
- **Status:** ⚠️ Hardcoded in `mappers.ts:363-366`
- **Fix:** Konfigurationsdatei für Steuerjahr-Limits

**3. Kanton hardcoded:**
- **Problem:** `canton: 'ZH'` hardcoded in `mappers.ts:32`
- **Status:** ⚠️ Hardcoded
- **Fix:** Aus `taxReturn.data` oder `taxMunicipality` ableiten

**4. Adress-Parsing:**
- **Problem:** Regex-Parsing kann fehlschlagen bei ungewöhnlichen Adressen
- **Status:** ⚠️ Kann Edge Cases nicht handhaben
- **Fix:** Robustere Parsing-Logik oder manuelle Eingabe

**5. Datum-Konvertierung:**
- **Problem:** Annahme, dass Datum immer "DD.MM.YYYY" Format hat
- **Status:** ⚠️ Kann fehlschlagen bei anderen Formaten
- **Fix:** Robustere Konvertierungs-Logik

**6. Partner 2 Mapping:**
- **Problem:** Partner 2 Daten sind in `personData.data.partner2*`, aber nicht gemappt
- **Status:** ❌ Nicht implementiert
- **Fix:** Mapping für Partner 2 implementieren

**7. Fehlende Validierung:**
- **Problem:** Viele Felder werden nicht validiert (z.B. PLZ-Format, AHV-Format)
- **Status:** ⚠️ Basis-Validierung vorhanden, aber nicht vollständig
- **Fix:** Erweiterte Validierung für alle Felder

---

### 14. Gibt es besondere Anforderungen des Kantons, die im nationalen Export nicht existieren?

#### Identifizierte kantonale Besonderheiten:

**1. Header Extension (ZH-spezifisch):**
- **`hiddenData`:** Versteckte Daten, die nicht im nationalen Export existieren
- **`approvalReceipt`:** Freigabequittung mit gerundeten Werten
- **`sourceSystem`:** Detaillierte System-Informationen
- **`documentList`:** Belegliste mit 100+ Dokumenttypen
- **`scanning`:** Scanning-Informationen mit 50+ Boolean-Flags
- **`triageKind`:** Triage-Art (Kanton vs. Gemeinde)

**2. Content Extension (ZH-spezifisch):**
- **`listOfProperties`:** Detaillierte Liegenschaften-Aufstellung
  - **Nicht im nationalen Export:** Detaillierte Ertragsaufstellung (`earningsDetail[]`)
  - **Nicht im nationalen Export:** Detaillierte Unterhaltskosten (`maintenanceCostsDetail[]`)
  - **Nicht im nationalen Export:** Geschäftliche Nutzung (`use`)
  - **Nicht im nationalen Export:** Landwirtschaftliche Nutzung (`agriculturalUse`)

**3. Person Data Extensions (ZH-spezifisch):**
- **`personDataPartner1Extension`:** Erweiterte Personendaten
- **`personDataPartner2Extension`:** Erweiterte Personendaten Partner 2
- **`childDataInhouseExtension`:** Erweiterte Kinddaten
  - **`receivedAlimonyPayer`:** Unterhaltszahler
  - **`externalCareDetail`:** Fremdbetreuung

**4. DA1 Extension (ZH-spezifisch):**
- **`da1`:** Detailliertes Wertschriftenverzeichnis
  - **Nicht im nationalen Export:** Detaillierte Ertragsaufstellung
  - **Nicht im nationalen Export:** Zugangs-/Abgangsdetails

**5. Inventarfragebogen (ZH-spezifisch):**
- **`inventoryQuestionnaire`:** Inventarfragebogen
- **`safeOpeningProtocol`:** Tresoröffnungsprotokoll
- **Nicht im nationalen Export:** Komplett neue Strukturen

#### ⚠️ Kritische kantonale Anforderungen:

**1. Liegenschaften-Details:**
- **Problem:** WETAX hat `liegenschaften.data[]`, aber nicht alle erforderlichen Felder
- **Fehlende Felder:**
  - `propertyEarnings.earningsDetail[]` (detaillierte Ertragsaufstellung)
  - `propertyMaintenanceCosts.maintenanceCostsDetail[]` (detaillierte Unterhaltskosten)
  - `use` (Nutzungsart: selbst genutzt, vermietet, gemischt)
  - `agriculturalUse` (landwirtschaftliche Nutzung)
  - `usufruct`, `rightOfResidence` (Nießbrauch, Wohnrecht)

**2. Belegliste:**
- **Problem:** WETAX hat keine Belegliste
- **Lösung:** Kann aus `data` abgeleitet werden (z.B. wenn `geldVerdient` vorhanden → Dokumenttyp "01")

**3. Scanning-Informationen:**
- **Problem:** WETAX ist keine Scanning-Software
- **Lösung:** Defaults setzen (siehe Frage 10)

**4. Freigabequittung:**
- **Problem:** Gerundete Werte müssen aus `computed` kommen
- **Lösung:** Mapping aus `computed` (siehe Frage 10)

---

## Zusammenfassung & Empfehlungen

### Kritische Punkte für Implementierung:

1. **Namespace-Handling:** `xmlns:zh` muss korrekt in XML deklariert werden
2. **Element-Reihenfolge:** XSD-Sequenz muss beachtet werden
3. **XSD-Validierung:** Automatische Validierung gegen XSD implementieren
4. **Fehlende Daten:** Dokumentation aller nicht mappbaren Felder
5. **Defaults:** Keine Dummywerte, nur valide Defaults mit Dokumentation
6. **Modularität:** Separate Module für Extension-Code
7. **Tests:** Unit Tests für alle Mapping-Funktionen
8. **Validierung:** Erweiterte Validierung für Extension-Felder

### Nächste Schritte:

1. **Phase 1:** Header Extension implementieren
2. **Phase 2:** Content Extension (Liegenschaften) implementieren
3. **Phase 3:** Person Data Extensions implementieren
4. **Phase 4:** XSD-Validierung implementieren
5. **Phase 5:** Tests und Dokumentation

---

**Status:** Analyse abgeschlossen ✅  
**Nächste Aktion:** Implementierung starten mit Header Extension


