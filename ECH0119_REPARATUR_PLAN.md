# eCH-0119 Export Reparatur Plan
## Ziel: Sauberer, validierter nationaler Export vor kantonale Extension

**Status:** In Arbeit  
**Priorität:** Hoch (Basis für kantonale Extension)

---

## Probleme identifiziert

### 1. ❌ Keine XSD-Validierung
- XML wird generiert, aber nicht gegen XSD geprüft
- Strukturelle Fehler werden nicht erkannt
- Element-Reihenfolge könnte falsch sein

### 2. ⚠️ Hardcoded Werte
- Säule 3a Limit: 7'056 CHF (2024)
- Kinderabzüge: 9'300/6'800 CHF
- Kanton: "ZH" hardcoded

### 3. ⚠️ Fehlende Datentyp-Validierung
- `moneyType1`: Range -999999999999 bis 999999999999 (12 digits)
- `moneyType2`: Decimal mit 2 Nachkommastellen
- Keine Validierung ob Werte im erlaubten Bereich

### 4. ⚠️ Element-Reihenfolge
- XSD definiert strikte Sequenz
- Aktuell korrekt implementiert, aber nicht validiert

### 5. ⚠️ Fehlende Tests
- Keine Tests für Mapping-Funktionen
- Keine Tests für XML-Generierung
- Keine Tests für XSD-Konformität

---

## Implementierungsplan

### Phase 1: XSD-Validierung Setup ✅ (in Arbeit)

**1.1 Bibliothek installieren**
- Option A: `libxmljs` (native, schnell, aber komplex)
- Option B: `xsd-schema-validator` (einfacher, aber langsamer)
- **Entscheidung:** `libxmljs` für Performance

**1.2 XSD-Validator-Modul erstellen**
- `src/ech0119/validator.ts`
- Funktion: `validateXMLAgainstXSD(xml: string): ValidationResult`
- Lädt XSD aus `src/data/eCH-0119-4-0-0.xsd`
- Validiert XML gegen XSD
- Gibt detaillierte Fehler zurück

**1.3 Integration in Export-Flow**
- `exportECH0119()` ruft Validator auf
- Bei Fehlern: Detaillierte Fehlermeldung mit XPath
- Optional: Warnungen für nicht-kritische Probleme

### Phase 2: Mapping-Verbesserungen

**2.1 Datentyp-Validierung**
- Validierungs-Funktionen für `moneyType1`, `moneyType2`
- Prüfung auf Range-Überschreitungen
- Prüfung auf Decimal-Präzision

**2.2 Element-Reihenfolge sicherstellen**
- XML-Generator prüft Reihenfolge gemäss XSD
- Tests für alle komplexen Typen

**2.3 Pflichtfelder validieren**
- Erweiterte Validierung in `validateECH0119Export()`
- Prüfung aller logisch erforderlichen Felder

### Phase 3: Konfiguration

**3.1 Steuerjahr-Konfiguration**
- `src/data/tax-year-config.ts`
- Limits pro Steuerjahr (Säule 3a, Kinderabzüge, etc.)
- Automatische Auswahl basierend auf `taxReturn.year`

**3.2 Kanton-Konfiguration**
- Aus `taxMunicipality` oder `personData` ableiten
- Nicht mehr hardcoded

### Phase 4: Tests

**4.1 Unit Tests für Mapping**
- `src/tests/ech0119/mappers.test.ts`
- Tests für alle Mapping-Funktionen
- Edge Cases (undefined, null, leere Arrays)

**4.2 XML-Generator Tests**
- `src/tests/ech0119/xml-generator.test.ts`
- Tests für XML-Struktur
- Tests für Element-Reihenfolge

**4.3 XSD-Validierung Tests**
- `src/tests/ech0119/validator.test.ts`
- Tests mit validen XMLs
- Tests mit invaliden XMLs
- Tests für Fehler-Meldungen

**4.4 Integration Tests**
- `src/tests/ech0119/export.test.ts`
- End-to-End Tests mit realen Daten
- XSD-Validierung nach Export

---

## Technische Details

### XSD-Validierung mit libxmljs

```typescript
import { parseXmlString, Schema } from 'libxmljs'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  line: number
  column: number
  message: string
  xpath?: string
}

export function validateXMLAgainstXSD(
  xml: string,
  xsdPath: string = 'src/data/eCH-0119-4-0-0.xsd'
): ValidationResult {
  // Load XSD schema
  // Parse XML
  // Validate
  // Return results
}
```

### Datentyp-Validierung

```typescript
export function validateMoneyType1(value: number): boolean {
  // Check range: -999999999999 to 999999999999
  // Check digits: max 12 total digits
  // Check integer (no decimals)
}

export function validateMoneyType2(value: number): boolean {
  // Check range: -999999999999.99 to 999999999999.99
  // Check digits: max 14 total digits, max 2 fraction digits
}
```

### Konfiguration

```typescript
// src/data/tax-year-config.ts
export interface TaxYearConfig {
  year: number
  saeule3aMax: number
  kinderabzugStaat: number
  kinderabzugBund: number
}

export const TAX_YEAR_CONFIGS: Record<number, TaxYearConfig> = {
  2024: {
    year: 2024,
    saeule3aMax: 7056,
    kinderabzugStaat: 9300,
    kinderabzugBund: 6800,
  },
  2025: {
    year: 2025,
    saeule3aMax: 7156, // Beispiel
    kinderabzugStaat: 9400,
    kinderabzugBund: 6900,
  },
}
```

---

## Nächste Schritte

1. ✅ XSD-Validierungsbibliothek installieren
2. ✅ XSD-Validator-Modul erstellen
3. ⏳ Mapping-Funktionen gegen XSD validieren
4. ⏳ Tests schreiben
5. ⏳ Konfiguration auslagern

---

**Status:** Phase 1 in Arbeit


