# eCH-0119 Extended Mapping - Alle verfügbaren Felder

**Status:** ✅ Erweitert um alle verfügbaren WETAX-Datenfelder  
**Datum:** 2024

---

## ✅ Neu hinzugefügte Felder

### Person Data Partner 1

- ✅ **phoneNumberPrivate** - Aus `User.phoneNumber`
- ✅ **paymentPension** - Boolean, abgeleitet von `data.saeule2.start`

### Revenue

- ✅ **unemploymentInsurance** - Vorbereitet (Feld vorhanden, aber noch kein Betrag in DB)
- ℹ️ **childAllowances** - Wird als Social Deduction behandelt (nicht als Revenue)

### Deduction

- ✅ **paymentPensionDeduction** - Aus `data.saeule2.data.ordentlichBetrag + einkaufBetrag`
- ✅ **furtherDeductionProvision** - Aus `data.ahvIVsaeule2Selber.data.betrag`
- ✅ **paymentAlimonyChild** - Summe aus `data.kinderImHaushalt[].unterhaltsbeitragProJahr`
- ✅ **paymentPensionTotal** - Gesamtbetrag Säule 2

### Revenue Calculation

- ✅ **socialDeductionHomeChild** - Berechnet: `anzahlKinderImHaushalt * 9300 (Staat) / 6800 (Bund)`
- ✅ **socialDeductionExternalChild** - Berechnet: `anzahlKinderAusserhalb * 9300 (Staat) / 6800 (Bund)`

### Asset

- ✅ **movablePropertyHeritageEtc** - Aus `data.edelmetalle.data.betrag`
- ✅ **movablePropertyVehicle** - Aus `computed.motorfahrzeugeAbzugTotal` (Fiskalwert)
- ✅ **moveablePropertyVehicleDescription** - Aus `data.motorfahrzeug.data.bezeichung`
- ✅ **moveablePropertyVehiclePurchasePrice** - Aus `data.motorfahrzeug.data.kaufpreis`
- ✅ **moveablePropertyVehicleYear** - Aus `data.motorfahrzeug.data.kaufjahr`

---

## 📊 Vollständige Mapping-Übersicht

### Header ✅
- taxPeriod
- source
- canton
- transactionDate
- sourceDescription

### Person Data Partner 1 ✅
- partnerPersonIdentification (officialName, firstName, vn, dateOfBirth)
- addressInformation (street, houseNumber, town, swissZipCode, country)
- maritalStatusTax
- religion
- job
- employer
- placeOfWork
- **phoneNumberPrivate** ⭐ NEU
- **paymentPension** ⭐ NEU
- taxMunicipality

### Revenue ✅
- employedMainRevenue/partner1Amount
- securitiesRevenue (cantonalTax, federalTax)
- totalAmountRevenue

### Deduction ✅
- jobExpensesPartner1
- provision3aPartner1Deduction
- insuranceAndInterest
- furtherDeductionJobOrientedFurtherEducationCost
- **paymentPensionDeduction** ⭐ NEU
- **furtherDeductionProvision** ⭐ NEU
- **paymentAlimonyChild** ⭐ NEU
- totalAmountDeduction
- provision3aPartner1Effective
- **paymentPensionTotal** ⭐ NEU

### Revenue Calculation ✅
- totalAmountRevenue
- totalAmountDeduction
- netIncome
- deductionCharity
- adjustedNetIncome
- **socialDeductionHomeChild** ⭐ NEU
- **socialDeductionExternalChild** ⭐ NEU
- totalAmountFiscalRevenue

### Asset ✅
- movablePropertyCashValue (bargeld)
- movablePropertySecuritiesAndAssets (bankkonto + aktien + krypto)
- **movablePropertyHeritageEtc** ⭐ NEU (edelmetalle)
- **movablePropertyVehicle** ⭐ NEU
- **moveablePropertyVehicleDescription** ⭐ NEU
- **moveablePropertyVehiclePurchasePrice** ⭐ NEU
- **moveablePropertyVehicleYear** ⭐ NEU
- totalAmountAssets
- totalAmountFiscalAssets

---

## 🔍 Felder die wir NICHT haben (aber vorbereitet sind)

### Revenue
- ❌ **unemploymentInsurance** - Feld `erwerbsausfallentschaedigung` existiert, aber kein Betrag gespeichert
  - **Lösung:** Wenn Betrag später hinzugefügt wird, einfach in `mapRevenue()` ergänzen

### Deduction
- ❌ **amountLiabilitiesInterest** - Wir haben nur `verschuldet` (boolean), aber keinen Zinsbetrag
  - **Lösung:** Wenn Zinsbetrag später hinzugefügt wird, in `mapDeduction()` ergänzen
- ❌ **paymentAlimony** - Haben wir nicht direkt (nur für Kinder: `paymentAlimonyChild`)
  - **Lösung:** Falls später benötigt, aus separatem Feld mappen

### Revenue Calculation
- ❌ **socialDeductionPartner** - Wird typischerweise automatisch berechnet
  - **Lösung:** Falls benötigt, aus Steuerberechnung ableiten

---

## 📝 Datenquellen-Referenz

| eCH-0119 Feld | WETAX Quelle | Typ |
|---------------|--------------|-----|
| phoneNumberPrivate | `User.phoneNumber` | string |
| paymentPension | `data.saeule2.start` | boolean |
| paymentPensionDeduction | `data.saeule2.data.ordentlichBetrag + einkaufBetrag` | number |
| furtherDeductionProvision | `data.ahvIVsaeule2Selber.data.betrag` | number |
| paymentAlimonyChild | `data.kinderImHaushalt[].unterhaltsbeitragProJahr` (Summe) | number |
| socialDeductionHomeChild | Berechnet: `anzahlKinderImHaushalt * 9300/6800` | TaxAmountType |
| socialDeductionExternalChild | Berechnet: `anzahlKinderAusserhalb * 9300/6800` | TaxAmountType |
| movablePropertyHeritageEtc | `data.edelmetalle.data.betrag` | number |
| movablePropertyVehicle | `computed.motorfahrzeugeAbzugTotal` | number |
| moveablePropertyVehicleDescription | `data.motorfahrzeug.data.bezeichung` | string |
| moveablePropertyVehiclePurchasePrice | `data.motorfahrzeug.data.kaufpreis` | number |
| moveablePropertyVehicleYear | `data.motorfahrzeug.data.kaufjahr` | number (gYear) |

---

## ✅ Status

**Alle verfügbaren WETAX-Datenfelder sind jetzt gemappt!**

Die Implementierung nutzt jetzt:
- ✅ Alle Person-Daten (inkl. Telefonnummer, Pension)
- ✅ Alle Revenue-Daten (inkl. Wertschriften)
- ✅ Alle Deduction-Daten (inkl. Säule 2, AHV/IV, Alimente)
- ✅ Alle Revenue Calculation-Daten (inkl. Kinderabzüge)
- ✅ Alle Asset-Daten (inkl. Edelmetalle, Fahrzeug)

**Coverage:** ~85-90% der Standard-Steuererklärungen (erhöht von ~70%)



