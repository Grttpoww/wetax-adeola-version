# eCH-0119 XML Export - XSD-Analyse für Kanton Zürich

**Datum:** 2024  
**Version:** Phase 1 - Minimal Viable Export  
**Ziel:** WETAX → eCH-0119 XML Mapping für Arbeitnehmer in Kanton Zürich

---

## Executive Summary

**Phase 1 Scope:** Implementierung eines minimalen eCH-0119 XML Exports für Standard-Arbeitnehmer in Kanton Zürich.

**Was implementieren wir:**
- ✅ Header (taxPeriod, source, canton)
- ✅ PersonDataPartner1 (Grunddaten, Adresse, AHV-Nr)
- ✅ Revenue (employedMainRevenue, pension, basic income)
- ✅ Deduction (Standard-Abzüge: jobExpenses, provision3a, insurance)
- ✅ Asset (nur Bank-Guthaben, Bargeld, keine Immobilien)
- ✅ Basic revenueCalculation (netIncome, adjustedNetIncome)

**Was wir NICHT implementieren (Phase 1):**
- ❌ Partner2 (nur für Verheiratete - später)
- ❌ Children (Kinderabzüge - später)
- ❌ listOfSecurities (Wertschriften-Verzeichnis - nie)
- ❌ qualifiedInvestments (Beteiligungen >10% - nie)
- ❌ jobExpenses (Detail-Formular - Pauschale reicht)
- ❌ handicapExpenses (Edge Case)
- ❌ Self-Employment (nicht Zielgruppe)

**Coverage:** ~70% der Standard-Arbeitnehmer-Steuererklärungen

---

## 1. Required vs Optional Fields

### A) ABSOLUT REQUIRED (kein minOccurs oder minOccurs fehlt)

| XSD Path | Type | Description | WETAX Mapping |
|----------|------|-------------|---------------|
| `message/@minorVersion` | xs:integer | Schema Version | Hardcoded: `0` |
| `header/taxPeriod` | xs:gYear | Steuerjahr | `TaxReturn.year` → "2024" |
| `header/source` | xs:integer | Quelle (0=Software) | Hardcoded: `0` |
| `content/mainForm/personDataPartner1/partnerPersonIdentification/officialName` | baseNameType | Nachname | `TaxReturnData.personData.data.nachname` |
| `content/mainForm/personDataPartner1/partnerPersonIdentification/firstName` | baseNameType | Vorname | `TaxReturnData.personData.data.vorname` |
| `content/mainForm/personDataPartner1/partnerPersonIdentification/vn` | vnType | AHV-Nummer (13-stellig) | `User.ahvNummer` (Format: 756.1234.5678.97) |

**Anmerkung:** Die meisten anderen Felder haben `minOccurs="0"`, sind also technisch optional.

---

### B) PRAKTISCH REQUIRED (minOccurs="0" aber ohne geht's nicht)

Diese Felder sind technisch optional, aber für eine sinnvolle Steuererklärung **unbedingt nötig**:

| XSD Path | Type | Description | WETAX Mapping | Priority |
|----------|------|-------------|---------------|----------|
| `header/canton` | cantonAbbreviationType | Kanton | Hardcoded: `"ZH"` | P1 |
| `content/mainForm/personDataPartner1/addressInformation` | addressType | Adresse | `TaxReturnData.personData.data` → Adress-Felder | P1 |
| `content/mainForm/personDataPartner1/maritalStatusTax` | maritalDataType | Zivilstand | `TaxReturnData.personData.data.zivilstand` | P1 |
| `content/mainForm/personDataPartner1/taxMunicipality` | swissMunicipalityType | Steuergemeinde | **MISSING** → Muss ergänzt werden | P1 |
| `content/mainForm/revenue/employedMainRevenue/partner1Amount` | moneyType1 | Lohneinkommen Partner 1 | `TaxReturnData.geldVerdient` → Summe nettolohn | P1 |
| `content/mainForm/revenue/totalAmountRevenue` | taxAmountType | Gesamteinkommen | Berechnet aus revenue-Feldern | P1 |
| `content/mainForm/deduction/jobExpensesPartner1` | taxAmountType | Berufsauslagen Partner 1 | `ComputedTaxReturn.totalBerufsauslagenStaat/Bund` | P1 |
| `content/mainForm/deduction/provision3aPartner1Deduction` | taxAmountType | Säule 3a Abzug | `TaxReturnData.saeule3a.data.betrag` | P1 |
| `content/mainForm/deduction/insuranceAndInterest` | taxAmountType | Versicherungen & Zinsen | `ComputedTaxReturn.versicherungenTotalStaat/Bund` | P1 |
| `content/mainForm/deduction/totalAmountDeduction` | taxAmountType | Total Abzüge | Berechnet aus deduction-Feldern | P1 |
| `content/mainForm/revenueCalculation/netIncome` | taxAmountType | Nettoeinkommen | `ComputedTaxReturn.nettoEinkommenStaat/Bund` | P1 |
| `content/mainForm/revenueCalculation/adjustedNetIncome` | taxAmountType | Bereinigtes Nettoeinkommen | `ComputedTaxReturn.reineinkommenStaat/Bund` | P1 |
| `content/mainForm/revenueCalculation/totalAmountFiscalRevenue` | taxAmountType | Steuerbares Einkommen | `ComputedTaxReturn.reineinkommenStaat/Bund` | P1 |
| `content/mainForm/asset/movablePropertyCashValue/fiscalValue` | moneyType1 | Bargeld | `TaxReturnData.bargeld.data.betrag` | P1 |
| `content/mainForm/asset/totalAmountAssets` | privateBusinessType | Total Vermögen | Summe aller Asset-Felder | P1 |
| `content/mainForm/asset/totalAmountFiscalAssets` | privateBusinessType | Steuerbares Vermögen | `ComputedTaxReturn.totalVermoegenswerte` | P1 |

---

### C) OPTIONAL / EDGE CASES (<10% der User)

Diese Felder sind nur für spezielle Fälle relevant:

| XSD Path | Type | Description | WETAX Mapping | Priority |
|----------|------|-------------|---------------|----------|
| `content/mainForm/personDataPartner2` | personDataPartner2Type | Partner 2 Daten | Nur für Verheiratete | P2 |
| `content/mainForm/childData` | childDataType[] | Kinder | `TaxReturnData.kinderImHaushalt` + `kinderAusserhalb` | P2 |
| `content/mainForm/revenue/pension1Partner1` | pensionType | AHV/IV Rente Partner 1 | **MISSING** → Edge Case | P3 |
| `content/mainForm/revenue/selfemployedMainRevenue` | partnerAmountType | Selbständigkeit | Nicht Zielgruppe | P3 |
| `content/mainForm/revenue/propertyNotionalRentalValue` | moneyType1 | Liegenschaft Eigenmietwert | `TaxReturnData.liegenschaften` (leer) | P3 |
| `content/mainForm/deduction/paymentAlimony` | taxAmountType | Alimente | **MISSING** → Edge Case | P3 |
| `content/mainForm/listOfSecurities` | listOfSecuritiesType | Wertschriften-Verzeichnis | Komplex, später | P3 |
| `content/mainForm/qualifiedInvestmentsPrivate` | qualifiedInvestmentsPrivateType | Beteiligungen >10% | Nicht Zielgruppe | P3 |
| `content/mainForm/jobExpenses` | jobExpensesFormType | Detail Berufsauslagen | Pauschale reicht | P3 |
| `content/mainForm/handicapExpenses` | handicapExpensesType | Behinderten-Abzüge | Edge Case | P3 |

---

## 2. WETAX Mapping Table

### Header Fields

| XSD Path | XSD Type | WETAX DB Field | Notes | Format/Example |
|----------|----------|----------------|-------|---------------|
| `header/taxPeriod` | xs:gYear | `TaxReturn.year` | Steuerjahr | "2024" |
| `header/source` | xs:integer | Hardcoded | Software = 0 | `0` |
| `header/canton` | cantonAbbreviationType | Hardcoded | Kanton Zürich | `"ZH"` |
| `header/transactionDate` | xs:dateTime | `new Date()` | Aktuelles Datum | "2024-12-31T12:00:00" |
| `header/sourceDescription` | xs:string | Hardcoded | App Name | `"WETAX Mobile App"` |

### Person Data Partner 1

| XSD Path | XSD Type | WETAX DB Field | Notes |
|----------|----------|----------------|-------|
| `personDataPartner1/partnerPersonIdentification/officialName` | baseNameType | `TaxReturnData.personData.data.nachname` | Nachname |
| `personDataPartner1/partnerPersonIdentification/firstName` | baseNameType | `TaxReturnData.personData.data.vorname` | Vorname |
| `personDataPartner1/partnerPersonIdentification/vn` | vnType | `User.ahvNummer` | AHV-Nr (Format: 756.1234.5678.97) |
| `personDataPartner1/partnerPersonIdentification/dateOfBirth` | datePartiallyKnownType | `TaxReturnData.personData.data.geburtsdatum` | Format: "2001-10-20" (von "20.10.2001") |
| `personDataPartner1/partnerPersonIdentification/sex` | sexType | **MISSING** | Könnte aus AHV-Nr abgeleitet werden (optional) |
| `personDataPartner1/addressInformation/street` | string | `TaxReturnData.personData.data.adresse` | "Gossauerstrasse 42" |
| `personDataPartner1/addressInformation/houseNumber` | string | **PARSEN** | Aus `adresse` extrahieren (z.B. "42" aus "Gossauerstrasse 42") |
| `personDataPartner1/addressInformation/town` | string | `TaxReturnData.personData.data.stadt` | "zurich" → "Zürich" |
| `personDataPartner1/addressInformation/swissZipCode` | string | `TaxReturnData.personData.data.plz` | "8050" |
| `personDataPartner1/maritalStatusTax` | maritalDataType | `TaxReturnData.personData.data.zivilstand` | Mapping: "ledig"→1, "verheiratet"→2, etc. |
| `personDataPartner1/religion` | religionType | `TaxReturnData.personData.data.konfession` | Mapping: "römisch-katholisch"→1, "evangelisch-reformiert"→2, etc. |
| `personDataPartner1/job` | jobTitleType | `TaxReturnData.personData.data.beruf` | Max 100 Zeichen |
| `personDataPartner1/taxMunicipality` | swissMunicipalityType | **MISSING** | Muss ergänzt werden (Gemeinde-ID für ZH) |

### Revenue Fields

| XSD Path | XSD Type | WETAX DB Field | Notes |
|----------|----------|----------------|-------|
| `revenue/employedMainRevenue/partner1Amount` | moneyType1 | `TaxReturnData.geldVerdient[].nettolohn` → Summe | Lohneinkommen Partner 1 |
| `revenue/employedMainRevenue/partner2Amount` | moneyType1 | **N/A** | Nur für Verheiratete (P2) |
| `revenue/pension1Partner1/amountFinal` | moneyType1 | **MISSING** | AHV/IV Rente (Edge Case) |
| `revenue/unemploymentInsurance/partner1Amount` | moneyType1 | `TaxReturnData.erwerbsausfallentschaedigung` | Arbeitslosenentschädigung (wenn vorhanden) |
| `revenue/securitiesRevenue/cantonalTax` | moneyType1 | `ComputedTaxReturn.bruttoertragA` | Bruttoertrag A (Kanton) |
| `revenue/securitiesRevenue/federalTax` | moneyType1 | `ComputedTaxReturn.bruttoerttragB` | Bruttoertrag B (Bund) |
| `revenue/totalAmountRevenue/cantonalTax` | moneyType1 | Berechnet | Summe aller Revenue-Felder (Kanton) |
| `revenue/totalAmountRevenue/federalTax` | moneyType1 | Berechnet | Summe aller Revenue-Felder (Bund) |

### Deduction Fields

| XSD Path | XSD Type | WETAX DB Field | Notes |
|----------|----------|----------------|-------|
| `deduction/jobExpensesPartner1/cantonalTax` | moneyType1 | `ComputedTaxReturn.totalBerufsauslagenStaat` | Berufsauslagen (Kanton) |
| `deduction/jobExpensesPartner1/federalTax` | moneyType1 | `ComputedTaxReturn.totalBerufsauslagenBund` | Berufsauslagen (Bund) |
| `deduction/provision3aPartner1Deduction/cantonalTax` | moneyType1 | `TaxReturnData.saeule3a.data.betrag` | Säule 3a (max 7'056 CHF 2024) |
| `deduction/provision3aPartner1Deduction/federalTax` | moneyType1 | `TaxReturnData.saeule3a.data.betrag` | Säule 3a (max 7'056 CHF 2024) |
| `deduction/insuranceAndInterest/cantonalTax` | moneyType1 | `ComputedTaxReturn.versicherungenTotalStaat` | Versicherungen & Zinsen (Kanton) |
| `deduction/insuranceAndInterest/federalTax` | moneyType1 | `ComputedTaxReturn.versicherungenTotalBund` | Versicherungen & Zinsen (Bund) |
| `deduction/furtherDeductionJobOrientedFurtherEducationCost/cantonalTax` | moneyType1 | `ComputedTaxReturn.abzugAusbildungStaat` | Weiterbildung (Kanton) |
| `deduction/furtherDeductionJobOrientedFurtherEducationCost/federalTax` | moneyType1 | `ComputedTaxReturn.abzugAusbildungBund` | Weiterbildung (Bund) |
| `deduction/totalAmountDeduction/cantonalTax` | moneyType1 | `ComputedTaxReturn.totalAbzuegeStaat` | Total Abzüge (Kanton) |
| `deduction/totalAmountDeduction/federalTax` | moneyType1 | `ComputedTaxReturn.totalAbzuegeBund` | Total Abzüge (Bund) |

### Revenue Calculation Fields

| XSD Path | XSD Type | WETAX DB Field | Notes |
|----------|----------|----------------|-------|
| `revenueCalculation/totalAmountRevenue/cantonalTax` | moneyType1 | `ComputedTaxReturn.totalEinkuenfte` | Gesamteinkommen (Kanton) |
| `revenueCalculation/totalAmountRevenue/federalTax` | moneyType1 | `ComputedTaxReturn.totalEinkuenfte` | Gesamteinkommen (Bund) |
| `revenueCalculation/totalAmountDeduction/cantonalTax` | moneyType1 | `ComputedTaxReturn.totalAbzuegeStaat` | Total Abzüge (Kanton) |
| `revenueCalculation/totalAmountDeduction/federalTax` | moneyType1 | `ComputedTaxReturn.totalAbzuegeBund` | Total Abzüge (Bund) |
| `revenueCalculation/netIncome/cantonalTax` | moneyType1 | `ComputedTaxReturn.nettoEinkommenStaat` | Nettoeinkommen (Kanton) |
| `revenueCalculation/netIncome/federalTax` | moneyType1 | `ComputedTaxReturn.nettoEinkommenBund` | Nettoeinkommen (Bund) |
| `revenueCalculation/deductionDiseaseAndAccident/cantonalTax` | moneyType1 | **MISSING** | Krankheitskosten (Edge Case) |
| `revenueCalculation/deductionCharity/cantonalTax` | moneyType1 | `ComputedTaxReturn.spendenStaat` | Spenden (Kanton) |
| `revenueCalculation/deductionCharity/federalTax` | moneyType1 | `ComputedTaxReturn.spendenBund` | Spenden (Bund) |
| `revenueCalculation/adjustedNetIncome/cantonalTax` | moneyType1 | `ComputedTaxReturn.reineinkommenStaat` | Bereinigtes Nettoeinkommen (Kanton) |
| `revenueCalculation/adjustedNetIncome/federalTax` | moneyType1 | `ComputedTaxReturn.reineinkommenBund` | Bereinigtes Nettoeinkommen (Bund) |
| `revenueCalculation/totalAmountFiscalRevenue/cantonalTax` | moneyType1 | `ComputedTaxReturn.reineinkommenStaat` | Steuerbares Einkommen (Kanton) |
| `revenueCalculation/totalAmountFiscalRevenue/federalTax` | moneyType1 | `ComputedTaxReturn.reineinkommenBund` | Steuerbares Einkommen (Bund) |

### Asset Fields

| XSD Path | XSD Type | WETAX DB Field | Notes |
|----------|----------|----------------|-------|
| `asset/movablePropertyCashValue/fiscalValue` | moneyType1 | `TaxReturnData.bargeld.data.betrag` | Bargeld |
| `asset/movablePropertySecuritiesAndAssets/fiscalValue` | moneyType1 | `ComputedTaxReturn.totalSteuerwertVermoegen` | Wertschriften (aus aktien + bankkonto) |
| `asset/movablePropertyVehicle/fiscalValue` | moneyType1 | **MISSING** | Fahrzeug (wird nicht als Vermögen besteuert, nur Abzug) |
| `asset/totalAmountAssets/fiscalValue` | moneyType1 | `ComputedTaxReturn.totalVermoegenswerte` | Total Vermögen |
| `asset/totalAmountFiscalAssets/fiscalValue` | moneyType1 | `ComputedTaxReturn.totalVermoegenswerte` | Steuerbares Vermögen |

---

## 3. Missing DB Fields

### Kritische Missing Fields (müssen ergänzt werden)

| Field | XSD Path | Type | Vorschlag | Priority |
|-------|----------|------|-----------|----------|
| `taxMunicipality` | `personDataPartner1/taxMunicipality` | swissMunicipalityType | Gemeinde-ID für Kanton ZH (z.B. "261" für Zürich) | **P1** |
| `sex` | `partnerPersonIdentification/sex` | sexType | Optional: Könnte aus AHV-Nr abgeleitet werden (2. Ziffer) | P2 |
| `employer` | `personDataPartner1/employer` | employerNameType | `TaxReturnData.geldVerdient[].arbeitgeber` → Erster Eintrag | P2 |
| `placeOfWork` | `personDataPartner1/placeOfWork` | placeOfWorkType | `TaxReturnData.geldVerdient[].arbeitsort` → Erster Eintrag | P2 |

### Optional Missing Fields (Edge Cases)

| Field | XSD Path | Type | Vorschlag | Priority |
|-------|----------|------|-----------|----------|
| `pension1Partner1` | `revenue/pension1Partner1` | pensionType | AHV/IV Rente (nur für Rentner) | P3 |
| `paymentAlimony` | `deduction/paymentAlimony` | taxAmountType | Alimente (Edge Case) | P3 |
| `diseaseAndAccidentExpenses` | `revenueCalculation/deductionDiseaseAndAccident` | taxAmountType | Krankheitskosten (Edge Case) | P3 |

### Vorschlag: DB Schema Ergänzungen

```typescript
// In TaxReturnData.personData.data ergänzen:
{
  // ... existing fields ...
  taxMunicipality?: string; // Gemeinde-ID für ZH (z.B. "261" für Zürich)
  sex?: 'M' | 'F'; // Optional: aus AHV-Nr ableitbar
}
```

**Gemeinde-Mapping für ZH:**
- Zürich: "261"
- Winterthur: "230"
- Uster: "191"
- ... (vollständige Liste muss von ZH Steueramt kommen)

---

## 4. TypeScript Interfaces

```typescript
// ============================================================================
// Basis-Types (aus XSD)
// ============================================================================

/**
 * moneyType1: Integer, max 12 digits, can be negative
 * Range: -999999999999 to 999999999999
 */
type MoneyType1 = number;

/**
 * moneyType2: Decimal with 2 fractions (für Verrechnungssteuer)
 * Range: -999999999999.99 to 999999999999.99
 */
type MoneyType2 = number;

/**
 * Partner Amount: Separate amounts for Partner 1 and Partner 2
 */
interface PartnerAmountType {
  partner1Amount?: MoneyType1;
  partner2Amount?: MoneyType1;
}

/**
 * Tax Amount: Separate amounts for Cantonal and Federal tax
 */
interface TaxAmountType {
  cantonalTax?: MoneyType1;
  federalTax?: MoneyType1;
}

/**
 * Private/Business Type: Fiscal value and business portion
 */
interface PrivateBusinessType {
  fiscalValue?: MoneyType1;
  businessPortion?: MoneyType1;
}

// ============================================================================
// Header Types
// ============================================================================

interface ECH0119Header {
  attachment?: AttachmentType[];
  cantonExtension?: CantonExtensionType;
  transactionNumber?: string;
  transactionDate?: string; // ISO 8601 dateTime
  taxPeriod: string; // gYear, e.g. "2024"
  periodFrom?: string; // ISO 8601 date
  periodTo?: string; // ISO 8601 date
  canton?: string; // "ZH"
  source: 0 | 1 | 2; // 0=Software, 1=2D-Barcode, 2=OCR
  sourceDescription?: string; // "WETAX Mobile App"
}

interface AttachmentType {
  file: AttachmentFileType[];
  documentIdentification?: DocumentIdentificationType;
  cantonExtension?: CantonExtensionType;
  title: string;
  documentFormat: string;
  attachedToNumber?: string;
}

interface AttachmentFileType {
  cantonExtension?: CantonExtensionType;
  pathFileName: string;
  internalSortOrder: number;
}

interface DocumentIdentificationType {
  cantonExtension?: CantonExtensionType;
  documentCanton: string; // "ZH" or "CH"
  documentType: string;
}

interface CantonExtensionType {
  // Any namespace="##other" elements
  canton: string; // cantonFlAbbreviationType
}

// ============================================================================
// Person Data Types
// ============================================================================

interface PersonDataPartner1 {
  partnerPersonIdentification: PartnerPersonIdentificationType;
  addressInformation?: AddressType; // eCH-0046f:addressType
  cantonExtension?: CantonExtensionType;
  maritalStatusTax?: number; // 1=ledig, 2=verheiratet, 3=geschieden, 4=verwitwet
  religion?: number; // 1=römisch-katholisch, 2=evangelisch-reformiert, etc.
  job?: string; // max 100 chars
  employer?: string; // max 60 chars
  placeOfWork?: string; // max 40 chars
  phoneNumberPrivate?: PhoneNumberType;
  phoneNumberBusiness?: PhoneNumberType;
  paymentPension?: boolean;
  taxMunicipality?: SwissMunicipalityType;
}

interface PartnerPersonIdentificationType {
  cantonExtension?: CantonExtensionType;
  officialName: string; // baseNameType
  firstName: string; // baseNameType
  sex?: number; // 1=männlich, 2=weiblich
  dateOfBirth?: string; // datePartiallyKnownType, ISO 8601 date
  vn: string; // vnType, 13-stellige AHV-Nr
  otherPersonId?: NamedPersonIdType[];
}

interface AddressType {
  // eCH-0046f:addressType structure
  street?: string;
  houseNumber?: string;
  town?: string;
  swissZipCode?: string;
  country?: string;
  // ... weitere Felder
}

interface SwissMunicipalityType {
  // eCH-0007f:swissMunicipalityType
  municipalityId?: number;
  municipalityName?: string;
  cantonAbbreviation?: string;
}

interface PhoneNumberType {
  // eCH-0046f:phoneNumberType
  phoneNumberCategory?: number;
  phoneNumber?: string;
}

interface NamedPersonIdType {
  // eCH-0044f:namedPersonIdType
  personIdCategory?: string;
  personId?: string;
}

// ============================================================================
// Revenue Types
// ============================================================================

interface RevenueType {
  employedMainRevenue?: PartnerAmountType;
  employedSidelineRevenue?: PartnerAmountType;
  selfemployedMainRevenue?: PartnerAmountType;
  selfemployedSidelineRevenue?: PartnerAmountType;
  insuranceAHVIV100?: Insurance100Type;
  insuranceAHVIV100Amount?: PartnerAmountType;
  pension1Partner1?: PensionType;
  pension2FPartner1?: PensionType;
  pension1Partner2?: PensionType;
  pension2FPartner2?: PensionType;
  unemploymentInsurance?: PartnerAmountType;
  childAllowances?: PartnerAmountType;
  identificationPersonAlimony?: PersonIdentificationType;
  identificationAddressAlimony?: AddressType;
  cantonExtension?: CantonExtensionType;
  securitiesRevenue?: TaxAmountType;
  securitiesRevenueQualified?: MoneyType1;
  restRevenueAlimony?: MoneyType1;
  restRevenueAlimonyChild?: MoneyType1;
  restRevenueInheritanceEtc?: MoneyType1;
  restRevenueFreeText?: string;
  restRevenueFreeTextAmount?: MoneyType1;
  restRevenueLumpSumSettlementMonths?: number; // 1-999
  restRevenueLumpSumSettlementAmount?: MoneyType1;
  restRevenueLumpSumSettlementText?: string;
  propertyNotionalRentalValue?: MoneyType1;
  propertyRevenueRent?: MoneyType1;
  propertyRevenueGross?: MoneyType1;
  propertyDeductionFlatrate?: MoneyType1;
  propertyDeductionEffective?: MoneyType1;
  propertyRemainingRevenue?: MoneyType1;
  propertyRevenueOtherProperty?: MoneyType1;
  totalAmountRevenue?: TaxAmountType;
}

interface Insurance100Type {
  cantonExtension?: CantonExtensionType;
  partner1Insurance?: 0 | 1; // 0=AHV, 1=IV
  partner2Insurance?: 0 | 1;
}

interface PensionType {
  cantonExtension?: CantonExtensionType;
  amount100?: MoneyType1;
  percentage?: number; // 0-100
  amountFinal?: MoneyType1;
}

// ============================================================================
// Deduction Types
// ============================================================================

interface DeductionType {
  jobExpensesPartner1?: TaxAmountType;
  jobExpensesPartner2?: TaxAmountType;
  amountLiabilitiesInterest?: TaxAmountType;
  paymentAlimony?: TaxAmountType;
  paymentAlimonyChild?: TaxAmountType;
  paymentPensionDeduction?: TaxAmountType;
  provision3aPartner1Deduction?: TaxAmountType;
  provision3aPartner2Deduction?: TaxAmountType;
  insuranceAndInterest?: TaxAmountType;
  furtherDeductionProvision?: TaxAmountType;
  furtherDeductionJobOrientedFurtherEducationCost?: TaxAmountType;
  furtherDeductionFinancialManagement?: TaxAmountType;
  furtherDeductionHandicap?: TaxAmountType;
  furtherDeductionFreeTextAmount?: TaxAmountType;
  furtherDeductionNonparentalSuperVision?: TaxAmountType;
  employmentBothPartner?: TaxAmountType;
  totalAmountDeduction?: TaxAmountType;
  cantonExtension?: CantonExtensionType;
  paymentPensionTotal?: MoneyType1;
  provision3aPartner1Effective?: MoneyType1;
  provision3aPartner2Effective?: MoneyType1;
  furtherDeductionFreeText?: string;
}

// ============================================================================
// Revenue Calculation Types
// ============================================================================

interface RevenueCalculationType {
  totalAmountRevenue?: TaxAmountType;
  totalAmountDeduction?: TaxAmountType;
  netIncome?: TaxAmountType;
  deductionDiseaseAndAccident?: TaxAmountType;
  deductionCharity?: TaxAmountType;
  adjustedNetIncome?: TaxAmountType;
  socialDeductionHomeChild?: TaxAmountType;
  socialDeductionExternalChild?: TaxAmountType;
  socialDeductionSupportedPerson?: TaxAmountType;
  socialDeductionPartner?: TaxAmountType;
  totalAmountFiscalRevenue?: TaxAmountType;
  fiscalRevenueOtherCanton?: TaxAmountType;
  fiscalRevenueAbroad?: TaxAmountType;
  resultingFiscalRevenue?: TaxAmountType;
  cantonExtension?: CantonExtensionType;
}

// ============================================================================
// Asset Types
// ============================================================================

interface AssetType {
  movablePropertySecuritiesAndAssets?: PrivateBusinessType;
  movablePropertyCashValue?: PrivateBusinessType;
  movablePropertyLifeInsurances?: MoveablePropertyLifeInsuranceType[];
  movablePropertyVehicle?: PrivateBusinessType;
  movablePropertyHeritageEtc?: PrivateBusinessType;
  movablePropertyFreeTextAmount?: PrivateBusinessType;
  propertyHouseOrFlat?: PrivateBusinessType;
  propertyMarketValue?: PrivateBusinessType;
  propertyCapitalizedValue?: PrivateBusinessType;
  selfEmployedbusinessCapital?: PrivateBusinessType;
  selfEmployedOtherAssets?: PrivateBusinessType;
  selfEmployedStock?: PrivateBusinessType;
  selfEmployedLiveStock?: PrivateBusinessType;
  selfEmployedAssetWithoutProperty?: PrivateBusinessType;
  totalAmountAssets?: PrivateBusinessType;
  totalAmountLiabilities?: PrivateBusinessType;
  totalAmountFiscalAssets?: PrivateBusinessType;
  fiscalAssetsOtherCanton?: PrivateBusinessType;
  fiscalAssetsAbroad?: PrivateBusinessType;
  resultingFiscalAssets?: PrivateBusinessType;
  cantonExtension?: CantonExtensionType;
  moveablePropertyLifeInsurancesTotal?: MoneyType1;
  moveablePropertyVehicleDescription?: string;
  moveablePropertyVehiclePurchasePrice?: MoneyType1;
  moveablePropertyVehicleYear?: string; // gYear
  movablePropertyFreeText?: string;
  propertyHouseOrFlatTown?: string;
  propertyHouseOrFlatStreet?: string;
  selfEmployedLiveStockInsuranceValue?: MoneyType1;
}

interface MoveablePropertyLifeInsuranceType {
  cantonExtension?: CantonExtensionType;
  lifeInsuranceCompany?: string;
  lifeInsuranceFixtureYear?: string; // gYear
  lifeInsuranceExpirationYear?: string; // gYear
  lifeInsuranceFiscalValue?: MoneyType1;
}

// ============================================================================
// Main Form Type
// ============================================================================

interface MainFormType {
  representativePerson?: RepresentativePersonType;
  personDataPartner1: PersonDataPartner1;
  personDataPartner2?: PersonDataPartner2Type;
  childData?: ChildDataType[];
  disabledPersonSupport?: DisabledPersonSupportType[];
  revenue?: RevenueType;
  deduction?: DeductionType;
  revenueCalculation?: RevenueCalculationType;
  asset?: AssetType;
  benefit?: BenefitType;
  attachedForms?: AttachedFormsType;
  cantonExtension?: CantonExtensionType;
  lastTaxDeclaration?: SwissMunicipalityType;
}

interface RepresentativePersonType {
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  officialName?: string;
  firstName?: string;
  organisationName?: string;
  phoneNumber?: PhoneNumberType;
  uid?: UidStructureType;
}

interface PersonDataPartner2Type {
  personIdentification?: PersonIdentificationType;
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  maritalStatusTax?: number;
  religion?: number;
  job?: string;
  employer?: string;
  placeOfWork?: string;
  phoneNumberPrivate?: PhoneNumberType;
  phoneNumberBusiness?: PhoneNumberType;
  paymentPension?: boolean;
  taxMunicipality?: SwissMunicipalityType;
}

interface ChildDataType {
  personIdentification?: PersonIdentificationType;
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  homeOrExternal?: boolean; // false=home, true=external
  schoolOrCompany?: string;
  correctTo?: string; // ISO 8601 date
  alimonyOtherPerson?: boolean;
}

interface DisabledPersonSupportType {
  personIdentification?: PersonIdentificationType;
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  homeOrExternal?: boolean;
  supportAmount?: MoneyType1;
}

interface BenefitType {
  payment?: PaymentType[];
  restBenefitPaymentReceived?: RestBenefitType;
  restBenefitPaidOut?: RestBenefitType;
  cantonExtension?: CantonExtensionType;
  benefitNote?: string;
  paymentAmountTotal?: MoneyType1;
}

interface PaymentType {
  cantonExtension?: CantonExtensionType;
  paymentReason?: number[]; // 1=AHV/IV, 2=Freizügigkeit, 3=Death/Invalidity, 4=Pillar 2, 5=Pillar 3a, 6=Other
  paymentDate?: string; // ISO 8601 date
  paymentAmount?: MoneyType1;
}

interface RestBenefitType {
  personidentification?: PersonIdentificationType;
  adress?: AddressType;
  cantonExtension?: CantonExtensionType;
  relation?: string;
  restSource?: 1 | 2 | 3 | 4; // 1=donation, 2=advancement, 3=inheritance, 4=share in community
  date?: string; // gMonthDay
  amount?: MoneyType1;
}

interface AttachedFormsType {
  cantonExtension?: CantonExtensionType;
  attachedPcTaxDeclaration?: boolean;
  attachedListOfAssets?: boolean;
  attachedWageStatement?: boolean;
  attachedColumn3a?: boolean;
  attachedBalance?: boolean;
  attachedQuestionnaire?: boolean;
  attachedQuestionnaireText?: string;
  attachedExpenses?: boolean;
  attachedFreeTextCheckbox?: boolean;
  attachedFreeText?: string;
  locationAndDate?: string;
}

interface PersonIdentificationType {
  // eCH-0044f:personIdentificationType
  // ... structure
}

interface UidStructureType {
  // eCH-0097:uidStructureType
  // ... structure
}

// ============================================================================
// Content Type
// ============================================================================

interface ContentType {
  mainForm?: MainFormType;
  listOfSecurities?: ListOfSecuritiesType;
  listOfLiabilities?: ListOfLiabilitiesType;
  qualifiedInvestmentsPrivate?: QualifiedInvestmentsPrivateType;
  qualifiedInvestmentsBusiness?: QualifiedInvestmentsBusinessType;
  jobExpenses?: JobExpensesFormType;
  jobOrientedFurtherEducationCost?: JobOrientedFurtherEducationCostType;
  insurancePremiums?: InsurancePremiumsType;
  diseaseAndAccidentExpenses?: DiseaseAndAccidentExpensesType;
  handicapExpenses?: HandicapExpensesType;
  cantonExtension?: CantonExtensionType;
}

// ============================================================================
// Root Message Type
// ============================================================================

interface ECH0119Message {
  '@minorVersion': number; // Required attribute
  header: ECH0119Header;
  content: ContentType;
}

// ============================================================================
// Helper Types (for complex types we're not implementing in Phase 1)
// ============================================================================

interface ListOfSecuritiesType {
  // Not implemented in Phase 1
}

interface QualifiedInvestmentsPrivateType {
  // Not implemented in Phase 1
}

interface QualifiedInvestmentsBusinessType {
  // Not implemented in Phase 1
}

interface JobExpensesFormType {
  // Not implemented in Phase 1 (using pauschale)
}

interface JobOrientedFurtherEducationCostType {
  // Not implemented in Phase 1
}

interface InsurancePremiumsType {
  // Not implemented in Phase 1
}

interface DiseaseAndAccidentExpensesType {
  // Not implemented in Phase 1
}

interface HandicapExpensesType {
  // Not implemented in Phase 1
}

interface ListOfLiabilitiesType {
  // Not implemented in Phase 1
}
```

---

## 5. Validation Rules

### Format-Validierungen

| Field | Rule | Error Message |
|-------|------|---------------|
| `header/taxPeriod` | Must be between 2020-2026 | "Steuerjahr muss zwischen 2020 und 2026 sein" |
| `header/taxPeriod` | Format: YYYY (gYear) | "Steuerjahr muss Format YYYY haben (z.B. '2024')" |
| `partnerPersonIdentification/vn` | Must be 13 digits (with dots) | "AHV-Nummer muss 13-stellig sein (Format: 756.1234.5678.97)" |
| `partnerPersonIdentification/vn` | Must match pattern: `^\d{3}\.\d{4}\.\d{4}\.\d{2}$` | "AHV-Nummer Format ungültig" |
| `partnerPersonIdentification/dateOfBirth` | Must be valid ISO 8601 date | "Geburtsdatum Format ungültig (erwartet: YYYY-MM-DD)" |
| `addressInformation/swissZipCode` | Must be 4 digits | "PLZ muss 4-stellig sein" |
| `addressInformation/swissZipCode` | Must be valid Swiss ZIP code | "PLZ ungültig" |
| `maritalStatusTax` | Must be 1, 2, 3, or 4 | "Zivilstand ungültig (1=ledig, 2=verheiratet, 3=geschieden, 4=verwitwet)" |
| `religion` | Must be valid religion code (1-9) | "Konfession ungültig" |
| `moneyType1` | Must be integer between -999999999999 and 999999999999 | "Betrag ausserhalb des erlaubten Bereichs" |
| `moneyType2` | Must be decimal with max 2 fractions | "Betrag muss max. 2 Dezimalstellen haben" |

### Business-Logic-Validierungen

| Rule | Condition | Error Message |
|------|-----------|---------------|
| **AHV-Nummer Validierung** | VN muss 13-stellig sein | "AHV-Nummer muss 13-stellig sein" |
| **Steuerjahr Validierung** | taxPeriod muss aktuelles oder vergangenes Jahr sein | "Steuerjahr kann nicht in der Zukunft liegen" |
| **Lohneinkommen** | Wenn `employedMainRevenue` gesetzt, muss > 0 sein (außer Arbeitslos) | "Lohneinkommen muss > 0 sein" |
| **Säule 3a Limit** | `provision3aPartner1Deduction` max CHF 7'056 (2024) | "Säule 3a Abzug überschreitet Maximum von CHF 7'056" |
| **Partner 2 Konsistenz** | Wenn `personDataPartner2` gesetzt, muss `maritalStatusTax` = 2 (verheiratet) sein | "Partner 2 kann nur bei verheirateten Personen angegeben werden" |
| **Kinder Konsistenz** | Wenn `childData` gesetzt, muss `maritalStatusTax` = 2 (verheiratet) oder 1 (ledig) sein | "Kinder können nur bei ledigen oder verheirateten Personen angegeben werden" |
| **Adresse Vollständigkeit** | Wenn `addressInformation` gesetzt, müssen `street`, `town`, `swissZipCode` vorhanden sein | "Adresse ist unvollständig (Strasse, Ort, PLZ fehlen)" |
| **Nettoeinkommen Konsistenz** | `netIncome` = `totalAmountRevenue` - `totalAmountDeduction` | "Nettoeinkommen stimmt nicht mit Revenue - Deduction überein" |
| **Vermögen Konsistenz** | `totalAmountAssets` = Summe aller Asset-Felder | "Total Vermögen stimmt nicht mit Summe der Einzelwerte überein" |
| **Kanton Konsistenz** | `header/canton` muss "ZH" sein für Kanton Zürich | "Kanton muss 'ZH' sein für Kanton Zürich" |
| **Gemeinde Validierung** | `taxMunicipality` muss gültige Gemeinde-ID für ZH sein | "Steuergemeinde ungültig für Kanton Zürich" |

### Type-Validierungen

| Type | Validation | Error Message |
|------|------------|---------------|
| `moneyType1` | Integer, 12 digits max, range: -999999999999 to 999999999999 | "Betrag muss Integer zwischen -999999999999 und 999999999999 sein" |
| `moneyType2` | Decimal, 14 digits total, 2 fractions, range: -999999999999.99 to 999999999999.99 | "Betrag muss Decimal mit max. 2 Dezimalstellen sein" |
| `gYear` | Format: YYYY, range: 2020-2026 | "Jahr muss Format YYYY haben und zwischen 2020-2026 liegen" |
| `date` | ISO 8601 format: YYYY-MM-DD | "Datum muss Format YYYY-MM-DD haben" |
| `dateTime` | ISO 8601 format: YYYY-MM-DDTHH:mm:ss | "Datum/Zeit muss Format YYYY-MM-DDTHH:mm:ss haben" |
| `baseNameType` | Max length: 100 chars | "Name darf max. 100 Zeichen lang sein" |
| `jobTitleType` | Max length: 100 chars | "Beruf darf max. 100 Zeichen lang sein" |
| `employerNameType` | Max length: 60 chars | "Arbeitgeber darf max. 60 Zeichen lang sein" |
| `placeOfWorkType` | Max length: 40 chars | "Arbeitsort darf max. 40 Zeichen lang sein" |

---

## 6. Test-Checklist

### Minimal Valides XML (Phase 1)

Ein valides eCH-0119 XML für Phase 1 muss mindestens enthalten:

- [ ] **Header:**
  - [ ] `message/@minorVersion` = 0
  - [ ] `header/taxPeriod` = "2024" (gYear)
  - [ ] `header/source` = 0 (Software)
  - [ ] `header/canton` = "ZH"

- [ ] **Person Data Partner 1:**
  - [ ] `personDataPartner1/partnerPersonIdentification/officialName` (Nachname)
  - [ ] `personDataPartner1/partnerPersonIdentification/firstName` (Vorname)
  - [ ] `personDataPartner1/partnerPersonIdentification/vn` (AHV-Nr, 13-stellig)
  - [ ] `personDataPartner1/addressInformation/street` (Strasse)
  - [ ] `personDataPartner1/addressInformation/town` (Ort)
  - [ ] `personDataPartner1/addressInformation/swissZipCode` (PLZ, 4-stellig)
  - [ ] `personDataPartner1/maritalStatusTax` (Zivilstand)
  - [ ] `personDataPartner1/taxMunicipality` (Steuergemeinde)

- [ ] **Revenue:**
  - [ ] `revenue/employedMainRevenue/partner1Amount` (Lohneinkommen)
  - [ ] `revenue/totalAmountRevenue/cantonalTax` (Gesamteinkommen Kanton)
  - [ ] `revenue/totalAmountRevenue/federalTax` (Gesamteinkommen Bund)

- [ ] **Deduction:**
  - [ ] `deduction/jobExpensesPartner1/cantonalTax` (Berufsauslagen Kanton)
  - [ ] `deduction/jobExpensesPartner1/federalTax` (Berufsauslagen Bund)
  - [ ] `deduction/provision3aPartner1Deduction/cantonalTax` (Säule 3a)
  - [ ] `deduction/provision3aPartner1Deduction/federalTax` (Säule 3a)
  - [ ] `deduction/insuranceAndInterest/cantonalTax` (Versicherungen Kanton)
  - [ ] `deduction/insuranceAndInterest/federalTax` (Versicherungen Bund)
  - [ ] `deduction/totalAmountDeduction/cantonalTax` (Total Abzüge Kanton)
  - [ ] `deduction/totalAmountDeduction/federalTax` (Total Abzüge Bund)

- [ ] **Revenue Calculation:**
  - [ ] `revenueCalculation/netIncome/cantonalTax` (Nettoeinkommen Kanton)
  - [ ] `revenueCalculation/netIncome/federalTax` (Nettoeinkommen Bund)
  - [ ] `revenueCalculation/adjustedNetIncome/cantonalTax` (Bereinigtes Nettoeinkommen Kanton)
  - [ ] `revenueCalculation/adjustedNetIncome/federalTax` (Bereinigtes Nettoeinkommen Bund)
  - [ ] `revenueCalculation/totalAmountFiscalRevenue/cantonalTax` (Steuerbares Einkommen Kanton)
  - [ ] `revenueCalculation/totalAmountFiscalRevenue/federalTax` (Steuerbares Einkommen Bund)

- [ ] **Asset:**
  - [ ] `asset/movablePropertyCashValue/fiscalValue` (Bargeld)
  - [ ] `asset/movablePropertySecuritiesAndAssets/fiscalValue` (Wertschriften)
  - [ ] `asset/totalAmountAssets/fiscalValue` (Total Vermögen)
  - [ ] `asset/totalAmountFiscalAssets/fiscalValue` (Steuerbares Vermögen)

### XML Schema Validierung

- [ ] XML validiert gegen `eCH-0119-4-0-0.xsd`
- [ ] Namespace-Deklarationen korrekt: `xmlns:eCH-0119="http://www.ech.ch/xmlns/eCH-0119/4"`
- [ ] Alle REQUIRED Felder vorhanden
- [ ] Alle `moneyType1` Werte sind Integer (keine Dezimalstellen)
- [ ] Alle `moneyType2` Werte haben max. 2 Dezimalstellen
- [ ] Datum-Formate korrekt (ISO 8601)

### Business-Logic Tests

- [ ] **Test Case 1: Standard Arbeitnehmer (Ledig)**
  - PersonDataPartner1 vollständig
  - employedMainRevenue > 0
  - Standard-Abzüge (jobExpenses, provision3a, insurance)
  - Keine Partner2, keine Kinder

- [ ] **Test Case 2: Verheirateter Arbeitnehmer**
  - PersonDataPartner1 + PersonDataPartner2
  - maritalStatusTax = 2
  - employedMainRevenue für beide Partner

- [ ] **Test Case 3: Arbeitnehmer mit Vermögen**
  - Bargeld > 0
  - Wertschriften (bankkonto + aktien)
  - totalAmountFiscalAssets korrekt berechnet

- [ ] **Test Case 4: Edge Cases**
  - AHV-Nummer Format-Validierung
  - Säule 3a Limit (max 7'056)
  - Leere Felder werden nicht exportiert (minOccurs="0")

---

## 7. Implementation Roadmap

### Phase 1: Minimal Viable Export (P1 Fields) - **PRIORITÄT**

**Zeitaufwand:** 2-3 Tage  
**Coverage:** ~70% der Standard-Arbeitnehmer

#### Schritt 1: TypeScript Interfaces & Types (2h)
- [x] Basis-Types definieren (MoneyType1, TaxAmountType, etc.)
- [x] Header-Interface
- [x] PersonDataPartner1-Interface
- [x] Revenue-Interface (nur employedMainRevenue)
- [x] Deduction-Interface (nur Standard-Abzüge)
- [x] Asset-Interface (nur Bargeld + Wertschriften)
- [x] RevenueCalculation-Interface

#### Schritt 2: Mapping Functions (4h)
- [ ] `mapHeader()` - Header aus TaxReturn + User
- [ ] `mapPersonDataPartner1()` - PersonData aus TaxReturnData + User
- [ ] `mapRevenue()` - Revenue aus TaxReturnData + ComputedTaxReturn
- [ ] `mapDeduction()` - Deduction aus TaxReturnData + ComputedTaxReturn
- [ ] `mapAsset()` - Asset aus TaxReturnData + ComputedTaxReturn
- [ ] `mapRevenueCalculation()` - Berechnete Felder aus ComputedTaxReturn

#### Schritt 3: XML Generation (4h)
- [ ] XML Builder Setup (xmlbuilder2 oder ähnlich)
- [ ] `generateECH0119XML()` - Hauptfunktion
- [ ] Namespace-Deklarationen
- [ ] XML Serialization (pretty-print für Debug)

#### Schritt 4: Validation (2h)
- [ ] Format-Validierung (AHV-Nr, Datum, etc.)
- [ ] Business-Logic-Validierung (Säule 3a Limit, etc.)
- [ ] XSD-Validierung (optional, für später)

#### Schritt 5: API Integration (2h)
- [ ] Endpoint: `GET /v1/tax-returns/{id}/export-ech0119`
- [ ] Controller + Service Integration
- [ ] Error Handling
- [ ] Response (XML als String oder Base64)

#### Schritt 6: Testing (4h)
- [ ] Unit Tests für Mapping Functions
- [ ] Integration Test mit echten TaxReturn-Daten
- [ ] XML Schema Validierung
- [ ] Edge Cases (leere Felder, etc.)

**Total Phase 1:** ~18 Stunden (2-3 Tage)

---

### Phase 2: Extended Support (P2 Fields) - **SPÄTER**

**Zeitaufwand:** 3-4 Tage  
**Coverage:** ~85% der Steuererklärungen

- [ ] PersonDataPartner2 (Verheiratete)
- [ ] ChildData (Kinderabzüge)
- [ ] Social Deductions (Kinder, Partner)
- [ ] Extended Revenue (pension, unemploymentInsurance)
- [ ] Extended Deductions (paymentAlimony, etc.)

---

### Phase 3: Advanced Features (P3 Fields) - **NICHT PRIORITÄT**

**Zeitaufwand:** 5-7 Tage  
**Coverage:** ~95% der Steuererklärungen

- [ ] listOfSecurities (Wertschriften-Verzeichnis)
- [ ] jobExpenses (Detail-Formular)
- [ ] handicapExpenses
- [ ] diseaseAndAccidentExpenses
- [ ] Property (Liegenschaften)

---

## 8. Next Steps

### Immediate Actions (Heute)

1. **Complete Analysis** ✅
   - [x] Finish test checklist
   - [x] Add implementation roadmap
   - [x] Add next steps

2. **Start Implementation**
   - [ ] Create `src/ech0119/` directory structure
   - [ ] Create TypeScript interfaces file
   - [ ] Create mapping functions
   - [ ] Create XML generation function
   - [ ] Create API endpoint

### Code Structure

```
Wetax-app-server-main/
├── src/
│   ├── ech0119/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── mappers.ts            # Mapping functions (WETAX → eCH-0119)
│   │   ├── xml-generator.ts      # XML generation
│   │   ├── validators.ts         # Validation functions
│   │   └── index.ts              # Main export function
│   ├── api/
│   │   ├── api.service.ts        # Add exportECH0119()
│   │   └── api.controller.ts     # Add export endpoint
```

### Dependencies

```json
{
  "xmlbuilder2": "^3.0.0",  // XML generation
  "fast-xml-parser": "^4.3.0"  // Optional: XML validation
}
```

### Testing Strategy

1. **Unit Tests:** Jede Mapping-Funktion einzeln testen
2. **Integration Tests:** Vollständiger Export mit echten Daten
3. **Schema Validation:** XML gegen XSD validieren
4. **Manual Testing:** XML in Steueramt-Software importieren

### Success Criteria

- [ ] XML validiert gegen eCH-0119-4-0-0.xsd
- [ ] Alle P1 Fields korrekt gemappt
- [ ] XML kann von Steueramt-Software importiert werden
- [ ] Error Handling für fehlende Daten
- [ ] Performance: Export < 1 Sekunde

---

## 9. Notes & Considerations

### Kanton Zürich Spezifika

- **Gemeinde-IDs:** Müssen von ZH Steueramt bezogen werden
- **Kantonale Extensions:** Nicht implementiert in Phase 1
- **Steuersätze:** Werden nicht im XML exportiert (nur Daten)

### Datenkonvertierung

- **Datum:** WETAX Format "20.10.2001" → eCH-0119 "2001-10-20"
- **AHV-Nr:** WETAX Format "743.432.4362.394" → eCH-0119 "743.432.4362.394" (gleich)
- **Geldbeträge:** WETAX in Rappen → eCH-0119 in Rappen (gleich)
- **Zivilstand:** WETAX String → eCH-0119 Integer (Mapping nötig)

### Missing Data Handling

- **Optional Fields:** Werden nicht exportiert wenn `undefined` oder `null`
- **Required Fields:** Müssen validiert werden vor Export
- **Default Values:** Keine Defaults setzen, nur vorhandene Daten exportieren

### Performance

- **XML Size:** ~10-50 KB pro Steuererklärung
- **Generation Time:** < 100ms für Standard-Fall
- **Memory:** Minimal (keine großen Datenstrukturen)

---

**Dokument erstellt:** 2024  
**Status:** ✅ Analyse abgeschlossen, bereit für Implementierung  
**Nächster Schritt:** Code-Generierung starten