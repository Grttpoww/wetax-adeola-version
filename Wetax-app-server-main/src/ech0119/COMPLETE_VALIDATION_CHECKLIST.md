# Vollständige Validierungs-Checkliste für Kanton Zürich

## Ziel: 100% erfolgreicher Test-Run beim Kanton Zürich Validator

---

## ✅ 1. MoneyTypes - KORRIGIERT

### Status: ✅ FIXED

- [x] `formatMoney()` verwendet `Math.round()` für Integer (moneyType1)
- [x] Alle Mapper verwenden `formatMoney()` für Geldbeträge
- [x] XML-Generator verwendet `.toString()` (korrekt für Integer)

### Verbleibende Prüfung:
- [ ] **KRITISCH**: `totalAmountDeduction` in `mapDeduction()` - FEHLT `formatMoney()`!

---

## ✅ 2. XML-Generator - Prüfung

### Status: ⚠️ ZU PRÜFEN

Der XML-Generator verwendet `.toString()` für alle Zahlen:
```typescript
amountEl.ele('cantonalTax').txt(amount.cantonalTax.toString())
```

**Problem**: Wenn `cantonalTax` ein Decimal ist (z.B. 15000.5), wird es als "15000.5" ausgegeben, nicht als "15000".

**Lösung**: Da `formatMoney()` bereits Integer zurückgibt, sollte `.toString()` korrekt sein. ABER: Prüfe ob alle Werte wirklich durch `formatMoney()` gelaufen sind.

### Zu prüfen:
- [ ] Alle `cantonalTax`/`federalTax` Werte kommen aus `formatMoney()`
- [ ] Alle `fiscalValue` Werte kommen aus `formatMoney()`
- [ ] Alle `partner1Amount`/`partner2Amount` Werte kommen aus `formatMoney()`

---

## ⚠️ 3. Fehlende Felder im Header

### transactionNumber
- **Status**: Optional im XSD (`minOccurs="0"`)
- **Frage**: Wird für API-Übermittlung benötigt?
- **Aktuell**: Nicht gesetzt in `mapHeader()`

### periodFrom / periodTo
- **Status**: Optional im XSD
- **Aktuell**: Nicht gesetzt
- **Empfehlung**: Sollten gesetzt werden für vollständige Steuerperiode

### sourceDescription
- **Status**: Optional, aber gesetzt ✅
- **Wert**: "WETAX Mobile App"

---

## ❓ 4. Online-Zugangscode / API-Authentifizierung

### Status: UNBEKANNT

**Frage**: Wird der Online-Zugangscode im XML benötigt oder nur im API-Call?

**Mögliche Orte:**
1. **Im XML Header** - als `transactionNumber` oder separates Feld?
2. **Im API-Call** - als HTTP Header oder Query Parameter?
3. **Nicht im XML** - nur für Authentifizierung

**Zu prüfen:**
- [ ] Gibt es ein Feld im XSD für Online-Zugangscode?
- [ ] Wird es im Header benötigt?
- [ ] Oder nur im API-Call (HTTP Header)?

---

## ✅ 5. Required Fields - Prüfung

### Header (Required):
- [x] `taxPeriod` ✅
- [x] `source` ✅
- [ ] `canton` ✅ (wird dynamisch gesetzt)

### PersonDataPartner1 (Required):
- [x] `partnerPersonIdentification.officialName` ✅
- [x] `partnerPersonIdentification.firstName` ✅
- [x] `partnerPersonIdentification.vn` (AHV-Nummer) ✅

### Optional aber empfohlen:
- [ ] `periodFrom` / `periodTo` - Steuerperiode
- [ ] `transactionNumber` - Für Tracking
- [ ] `addressInformation` - Vollständige Adresse

---

## ⚠️ 6. Dezimalzahlen - Finale Prüfung

### Problem erkannt:
In `mapDeduction()` Zeile 337-338:
```typescript
const totalAmountDeduction: TaxAmountType = {
  cantonalTax: computed.totalAbzuegeStaat,  // ❌ FEHLT formatMoney()!
  federalTax: computed.totalAbzuegeBund,     // ❌ FEHLT formatMoney()!
}
```

**FIX ERFORDERLICH!**

---

## ✅ 7. Totals-Konsistenz

### Status: ✅ VALIDIERUNG IMPLEMENTIERT

Die Validierung prüft automatisch:
- Revenue Totals
- Deduction Totals
- Net Income
- Adjusted Net Income

**Zu prüfen:**
- [ ] Alle Totals werden korrekt berechnet
- [ ] Validierung schlägt nicht fehl

---

## ✅ 8. municipalityId Validierung

### Status: ✅ IMPLEMENTIERT

- [x] Format-Prüfung (10000-19999 für ZH)
- [ ] Prüfung gegen aktuelle ZH-Referenztabelle (TODO)

---

## ⚠️ 9. Namespace/Imports

### Status: ⚠️ BEKANNTES PROBLEM

Die KI erwähnte, dass Namespace-Imports in einer echten Validierung fehlschlagen könnten. Das ist normal und wird erst mit der Sandbox getestet.

**Aktuell im XML:**
```xml
xmlns="http://www.ech.ch/xmlns/eCH-0119/4"
xmlns:eCH-0007f="http://www.ech.ch/xmlns/eCH-0007-f/6"
...
```

**Zu prüfen:**
- [ ] Sandbox akzeptiert diese Namespaces
- [ ] Falls nicht, XSD-Import-Set anpassen

---

## ✅ 10. moveableProperty* vs movableProperty*

### Status: ✅ KORREKT

Im XSD steht tatsächlich `moveablePropertyVehicleDescription` (mit "moveable"), nicht "movable".

**Aktuell**: Korrekt implementiert ✅

---

## 📋 FINALE CHECKLISTE VOR TEST-RUN

### Kritische Fixes:
- [ ] **KRITISCH**: `totalAmountDeduction` in `mapDeduction()` mit `formatMoney()` fixen
- [ ] Prüfen ob alle anderen Totals auch `formatMoney()` verwenden

### Empfohlene Ergänzungen:
- [ ] `periodFrom` / `periodTo` im Header setzen
- [ ] `transactionNumber` im Header setzen (falls benötigt)
- [ ] Online-Zugangscode klären (XML oder API-Call?)

### Validierung:
- [ ] Test-Export ausführen
- [ ] Validierungs-Report prüfen
- [ ] Alle Errors beheben
- [ ] Alle Warnings prüfen

### API-Übermittlung:
- [ ] Online-Zugangscode für API-Call klären
- [ ] HTTP Headers prüfen
- [ ] Request-Body Format prüfen

---

## 🚀 Nächste Schritte

1. **KRITISCH**: Fix `totalAmountDeduction` in `mapDeduction()`
2. Prüfe alle anderen Totals
3. Test-Export ausführen
4. Validierungs-Report analysieren
5. Online-Zugangscode klären
6. Sandbox-Test durchführen

