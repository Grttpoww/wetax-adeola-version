/**
 * eCH-0119 TypeScript Interfaces
 * Based on eCH-0119-4-0-0.xsd schema
 * 
 * Phase 1: Minimal Viable Export (P1 fields only)
 */

// ============================================================================
// Basis-Types (aus XSD)
// ============================================================================

/**
 * moneyType1: Integer, max 12 digits, can be negative
 * Range: -999999999999 to 999999999999
 */
export type MoneyType1 = number;

/**
 * moneyType2: Decimal with 2 fractions (für Verrechnungssteuer)
 * Range: -999999999999.99 to 999999999999.99
 */
export type MoneyType2 = number;

/**
 * Partner Amount: Separate amounts for Partner 1 and Partner 2
 */
export interface PartnerAmountType {
  partner1Amount?: MoneyType1;
  partner2Amount?: MoneyType1;
}

/**
 * Tax Amount: Separate amounts for Cantonal and Federal tax
 */
export interface TaxAmountType {
  cantonalTax?: MoneyType1;
  federalTax?: MoneyType1;
}

/**
 * Private/Business Type: Fiscal value and business portion
 */
export interface PrivateBusinessType {
  fiscalValue?: MoneyType1;
  businessPortion?: MoneyType1;
}

// ============================================================================
// Header Types
// ============================================================================

export interface ECH0119Header {
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

export interface AttachmentType {
  file: AttachmentFileType[];
  documentIdentification?: DocumentIdentificationType;
  cantonExtension?: CantonExtensionType;
  title: string;
  documentFormat: string;
  attachedToNumber?: string;
}

export interface AttachmentFileType {
  cantonExtension?: CantonExtensionType;
  pathFileName: string;
  internalSortOrder: number;
}

export interface DocumentIdentificationType {
  cantonExtension?: CantonExtensionType;
  documentCanton: string; // "ZH" or "CH"
  documentType: string;
}

export interface CantonExtensionType {
  canton: string; // cantonFlAbbreviationType
}

// ============================================================================
// Person Data Types
// ============================================================================

export interface PersonDataPartner1 {
  partnerPersonIdentification: PartnerPersonIdentificationType;
  addressInformation?: AddressType;
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

export interface PartnerPersonIdentificationType {
  cantonExtension?: CantonExtensionType;
  officialName: string; // baseNameType
  firstName: string; // baseNameType
  sex?: number; // 1=männlich, 2=weiblich
  dateOfBirth?: string; // datePartiallyKnownType, ISO 8601 date
  vn: string; // vnType, 13-stellige AHV-Nr
  otherPersonId?: NamedPersonIdType[];
}

export interface AddressType {
  street?: string;
  houseNumber?: string;
  town?: string;
  swissZipCode?: string;
  country?: string;
}

export interface SwissMunicipalityType {
  municipalityId?: number;
  municipalityName?: string;
  cantonAbbreviation?: string;
}

export interface PhoneNumberType {
  phoneNumberCategory?: number;
  phoneNumber?: string;
}

export interface NamedPersonIdType {
  personIdCategory?: string;
  personId?: string;
}

// ============================================================================
// Revenue Types
// ============================================================================

export interface RevenueType {
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

export interface Insurance100Type {
  cantonExtension?: CantonExtensionType;
  partner1Insurance?: 0 | 1; // 0=AHV, 1=IV
  partner2Insurance?: 0 | 1;
}

export interface PensionType {
  cantonExtension?: CantonExtensionType;
  amount100?: MoneyType1;
  percentage?: number; // 0-100
  amountFinal?: MoneyType1;
}

// ============================================================================
// Deduction Types
// ============================================================================

export interface DeductionType {
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

export interface RevenueCalculationType {
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

export interface AssetType {
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

export interface MoveablePropertyLifeInsuranceType {
  cantonExtension?: CantonExtensionType;
  lifeInsuranceCompany?: string;
  lifeInsuranceFixtureYear?: string; // gYear
  lifeInsuranceExpirationYear?: string; // gYear
  lifeInsuranceFiscalValue?: MoneyType1;
}

// ============================================================================
// Main Form Type
// ============================================================================

export interface MainFormType {
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

export interface RepresentativePersonType {
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  officialName?: string;
  firstName?: string;
  organisationName?: string;
  phoneNumber?: PhoneNumberType;
  uid?: UidStructureType;
}

export interface PersonDataPartner2Type {
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

export interface ChildDataType {
  personIdentification?: PersonIdentificationType;
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  homeOrExternal?: boolean; // false=home, true=external
  schoolOrCompany?: string;
  correctTo?: string; // ISO 8601 date
  alimonyOtherPerson?: boolean;
}

export interface DisabledPersonSupportType {
  personIdentification?: PersonIdentificationType;
  addressInformation?: AddressType;
  cantonExtension?: CantonExtensionType;
  homeOrExternal?: boolean;
  supportAmount?: MoneyType1;
}

export interface BenefitType {
  payment?: PaymentType[];
  restBenefitPaymentReceived?: RestBenefitType;
  restBenefitPaidOut?: RestBenefitType;
  cantonExtension?: CantonExtensionType;
  benefitNote?: string;
  paymentAmountTotal?: MoneyType1;
}

export interface PaymentType {
  cantonExtension?: CantonExtensionType;
  paymentReason?: number[]; // 1=AHV/IV, 2=Freizügigkeit, 3=Death/Invalidity, 4=Pillar 2, 5=Pillar 3a, 6=Other
  paymentDate?: string; // ISO 8601 date
  paymentAmount?: MoneyType1;
}

export interface RestBenefitType {
  personidentification?: PersonIdentificationType;
  adress?: AddressType;
  cantonExtension?: CantonExtensionType;
  relation?: string;
  restSource?: 1 | 2 | 3 | 4; // 1=donation, 2=advancement, 3=inheritance, 4=share in community
  date?: string; // gMonthDay
  amount?: MoneyType1;
}

export interface AttachedFormsType {
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

export interface PersonIdentificationType {
  // eCH-0044f:personIdentificationType
  // Simplified for Phase 1
  [key: string]: any;
}

export interface UidStructureType {
  // eCH-0097:uidStructureType
  // Simplified for Phase 1
  [key: string]: any;
}

// ============================================================================
// Content Type
// ============================================================================

export interface ContentType {
  mainForm?: MainFormType;
  listOfSecurities?: any; // Not implemented in Phase 1
  listOfLiabilities?: any; // Not implemented in Phase 1
  qualifiedInvestmentsPrivate?: any; // Not implemented in Phase 1
  qualifiedInvestmentsBusiness?: any; // Not implemented in Phase 1
  jobExpenses?: any; // Not implemented in Phase 1
  jobOrientedFurtherEducationCost?: any; // Not implemented in Phase 1
  insurancePremiums?: any; // Not implemented in Phase 1
  diseaseAndAccidentExpenses?: any; // Not implemented in Phase 1
  handicapExpenses?: any; // Not implemented in Phase 1
  cantonExtension?: CantonExtensionType;
}

// ============================================================================
// Root Message Type
// ============================================================================

export interface ECH0119Message {
  '@minorVersion': number; // Required attribute
  header: ECH0119Header;
  content: ContentType;
}



