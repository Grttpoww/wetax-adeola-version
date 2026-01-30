# eCH-0119 Validierung & Test-Export

## Übersicht

Dieses Dokument beschreibt die Validierung und den Test-Export für eCH-0119 XML-Dateien.

## Implementierte Features

### ✅ 1. Validierung

Die Validierung prüft:

1. **Schema/XSD-Verletzungen (hart)**
   - Required Fields
   - AHV-Nummer Format
   - Datentypen

2. **Semantische Validierungen**
   - maritalStatusTax Konsistenz
   - paymentPension Konsistenz
   - Totals-Konsistenz

3. **Dezimalzahl-Präzision**
   - Max. 2 Nachkommastellen für alle Geldbeträge

4. **Kanton-spezifische Validierungen**
   - municipalityId-Validierung (ZH)
   - Kanton-spezifische Regeln

### ✅ 2. Fixes

Alle identifizierten Fehler wurden behoben:

1. ✅ **Dezimalzahlen**: Alle Geldbeträge werden auf max. 2 Nachkommastellen gerundet
2. ✅ **Totals-Konsistenz**: Validierung prüft, ob Totals mit Summen übereinstimmen
3. ✅ **municipalityId**: Format-Validierung für ZH (10000-19999)
4. ⚠️ **moveableProperty***: Im XSD steht tatsächlich "moveable" (nicht "movable"), daher korrekt

### ✅ 3. Test-Export

Ein Test-Export-Script erstellt Beispiel-XMLs für Validierung.

## Verwendung

### Test-Export ausführen

```bash
# Direkt ausführen
npx ts-node src/ech0119/test-export.ts

# Oder als npm script (muss zu package.json hinzugefügt werden)
npm run test:export
```

Das Script erstellt:
- `test-exports/ech0119-test-{timestamp}.xml` - Das generierte XML
- `test-exports/validation-report-{timestamp}.json` - Validierungs-Report

### Validierung programmatisch

```typescript
import { validateECH0119Message } from './ech0119/validator'
import { ECH0119Message } from './ech0119/types'

const message: ECH0119Message = { /* ... */ }
const validationReport = validateECH0119Message(message, taxReturn, data, computed)

if (!validationReport.isValid) {
  console.error('Validation failed:', validationReport.results)
}
```

## Bekannte Probleme / Offene Punkte

### 1. moveableProperty* vs movableProperty*

**Status**: ⚠️ Unklar

- Im XSD (`eCH-0119-4-0-0.xsd`) steht: `moveablePropertyVehicleDescription` (mit "moveable")
- Die KI behauptet, es sollte "movable" sein
- **Aktuell**: Wir verwenden "moveable" wie im XSD definiert

**Nächste Schritte**: 
- Mit Sandbox testen
- Falls Sandbox "movable" erwartet, dann anpassen

### 2. XSD-Validierung

**Status**: ⚠️ Noch nicht implementiert

Aktuell führen wir nur strukturelle Validierungen durch. Eine echte XSD-Validierung würde erfordern:

```typescript
import { validateXML } from 'xsd-schema-validator'

const xsdPath = 'src/data/eCH-0119-4-0-0.xsd'
const errors = await validateXML(xmlString, xsdPath)
```

**Nächste Schritte**:
- Library `xsd-schema-validator` oder ähnlich installieren
- XSD-Validierung in `validator.ts` integrieren

### 3. Namespace/Import-Probleme

**Status**: ⚠️ Bekannt, aber normal

Die KI erwähnte, dass Namespace-Imports in einer echten Validierung fehlschlagen könnten. Das ist normal und wird erst mit der Sandbox getestet.

## Validierungs-Report Format

```typescript
{
  isValid: boolean,
  results: [
    {
      code: string,        // z.B. "DECIMAL_PRECISION_TOO_HIGH"
      message: string,     // Beschreibung
      field?: string,      // Pfad zum Feld
      severity: 'error' | 'warning' | 'info',
      xpath?: string       // XPath (optional)
    }
  ],
  errorCount: number,
  warningCount: number
}
```

## Nächste Schritte für Sandbox-Test

1. **Test-Export ausführen**
   ```bash
   npx ts-node src/ech0119/test-export.ts
   ```

2. **XML an Sandbox senden**
   - XML-Datei aus `test-exports/` verwenden
   - An Kanton Zürich Sandbox senden
   - API-Schnittstelle erhalten

3. **Fehler analysieren**
   - Sandbox-Fehler mit Validierungs-Report vergleichen
   - Weitere Fixes implementieren

4. **XSD-Validierung hinzufügen**
   - Library installieren
   - XSD-Validierung integrieren
   - Automatische Tests

## Beispiel-Output

### Validation Report

```json
{
  "isValid": true,
  "errorCount": 0,
  "warningCount": 1,
  "results": [
    {
      "code": "MUNICIPALITY_ID_INVALID_RANGE",
      "message": "municipalityId 261 liegt nicht im gültigen Bereich für ZH (10000-19999)",
      "field": "personDataPartner1.taxMunicipality.municipalityId",
      "severity": "warning"
    }
  ]
}
```

## API-Endpoint (TODO)

Ein API-Endpoint für den Test-Export sollte erstellt werden:

```typescript
@Get('test-export')
public async testExport(): Promise<{ xml: string; validationReport: ValidationReport }> {
  return runTestExport()
}
```

