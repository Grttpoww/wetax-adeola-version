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
  listOfSecurities?: ListOfSecuritiesType;
  jobExpenses?: JobExpensesFormType;
  insurancePremiums?: InsurancePremiumsType;
  listOfLiabilities?: ListOfLiabilitiesType;
  benefit?: BenefitType;
  attachedForms?: AttachedFormsType;
  cantonExtension?: CantonExtensionType;
  lastTaxDeclaration?: SwissMunicipalityType;
}

// ============================================================================
// List of Securities Types
// ============================================================================

export interface ListOfSecuritiesType {
  bankAccount?: BankAccountType;
  securityEntry?: SecurityEntryType[];
  eTaxStatement?: ETaxStatementType[];
  cantonExtension?: CantonExtensionType;
  locationAndDate?: string;
  attachedPCListOfSecurities?: number;
  attachedForms?: number;
  attachedFormDA1?: number;
  attachedClearing?: number;
  note?: string;
  carryOverSupplementary1TaxValue?: MoneyType1;
  carryOverSupplementary1RevenueA?: MoneyType1;
  carryOverSupplementary1RevenueB?: MoneyType1;
  carryOverSupplementary2TaxValue?: MoneyType1;
  carryOverSupplementary2RevenueA?: MoneyType1;
  carryOverSupplementary2RevenueB?: MoneyType1;
  carryOverFormDA1TaxValue?: MoneyType1;
  carryOverFormDA1RevenueB?: MoneyType1;
  totalQualifiedInvestments?: MoneyType1;
  totalTaxValue?: TaxAmountType;
  subtotalGrossRevenueA1?: TaxAmountType;
  subtotalGrossRevenueB?: TaxAmountType;
  subtotalGrossRevenueA2?: TaxAmountType;
  totalGrossRevenue?: TaxAmountType;
  withholdingTax?: MoneyType2; // Verrechnungssteuer (moneyType2 = Decimal)
}

export interface BankAccountType {
  cantonExtension?: CantonExtensionType;
  ibanNumber?: string;
  postAccountNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankClearingNumber?: string;
  accountOwner?: string;
}

export interface SecurityEntryType {
  cantonExtension?: CantonExtensionType;
  code?: '00' | '01' | '02' | '03' | '04'; // business assets, usufruct, inherited, donation, qualified investment
  originalCurrency?: string;
  faceValueQuantity?: number;
  securitiesNumber?: string;
  detailedDescription?: string;
  countryOfDepositaryBank?: string; // ISO-3166 ALPHA-2
  addition?: string; // gMonthDay
  divestiture?: string; // gMonthDay
  taxValueEndOfYear?: TaxAmountType;
  grossRevenueA?: TaxAmountType; // mit Verrechnungssteuer
  grossRevenueB?: TaxAmountType; // ohne Verrechnungssteuer
}

export interface ETaxStatementType {
  cantonExtension?: CantonExtensionType;
  mutationJournal?: MutationJournalEntryType[];
  id: string;
  taxValueEndOfYear?: TaxAmountType;
  grossRevenueA?: TaxAmountType;
  grossRevenueB?: TaxAmountType;
}

export interface MutationJournalEntryType {
  cantonExtension?: CantonExtensionType;
  date?: string; // datePartiallyKnownType
  description?: string;
  quantity?: number;
  price?: MoneyType1;
  totalValue?: MoneyType1;
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
  listOfLiabilities?: ListOfLiabilitiesType;
  listOfProperties?: ListOfPropertiesType; // Liegenschaftenverzeichnis
  qualifiedInvestmentsPrivate?: any; // Not implemented in Phase 1
  qualifiedInvestmentsBusiness?: any; // Not implemented in Phase 1
  jobExpenses?: JobExpensesFormType;
  jobOrientedFurtherEducationCost?: any; // Not implemented in Phase 1
  insurancePremiums?: InsurancePremiumsType;
  diseaseAndAccidentExpenses?: any; // Not implemented in Phase 1
  handicapExpenses?: any; // Not implemented in Phase 1
  cantonExtension?: CantonExtensionType;
}

// ============================================================================
// Job Expenses Types
// ============================================================================

export interface JobExpensesFormType {
  jobExpensePartner1?: JobExpensesType;
  jobExpensePartner2?: JobExpensesType;
  cantonExtension?: CantonExtensionType;
}

export interface JobExpensesType {
  ticketCostPublicTransport?: TaxAmountType; // ÖV-Kosten
  bicycleOrSmallMotorbike?: TaxAmountType; // Velo
  detailsMotorvehicle?: CarOrMotorbikeType[];
  detailsMotorvehicleBusiness?: CarOrMotorbikeType[];
  amountMotorvehicle?: TaxAmountType;
  subtotalVehicle?: TaxAmountType; // Fahrkosten Total (ÖV + Velo + Auto)
  cateringSubsidized?: TaxAmountType; // Verpflegung verbilligt
  cateringNonSubsidized?: TaxAmountType; // Verpflegung nicht verbilligt
  cateringShiftWork?: TaxAmountType; // Schichtarbeit Verpflegung
  remainingJobCostFlatrate?: TaxAmountType; // Übrige Berufskosten (Pauschale 3%)
  remainingJobCostEffective?: TaxAmountType; // Übrige Berufskosten (effektiv)
  weekdayStay?: TaxAmountType;
  furtherEducationFlatrate?: TaxAmountType;
  sidelineFlatrate?: TaxAmountType;
  sidelineEffective?: TaxAmountType;
  totalAmountJobExpenses?: TaxAmountType;
  totalIncomeMotorvehicleBusiness?: TaxAmountType;
  cantonExtension?: CantonExtensionType;
  vehicleTypeCar?: boolean;
  vehicleTypeMotorbike?: boolean;
  vehicleLeased?: boolean;
  vehicleTypeBusinessCar?: boolean;
  vehicleTypeBusinessMotorbike?: boolean;
  placeOfWorkAddress?: string;
  cateringShiftWorkNumberOfDays?: number;
  reasonPrivateMotorvehicle?: string[];
}

export interface CarOrMotorbikeType {
  cantonExtension?: CantonExtensionType;
  placeOfWork?: string;
  numberOfWorkdays?: number;
  distance?: number;
  numberOfTrips?: number;
  distancePerYear?: number;
  amountPerDistance?: MoneyType1;
  totalAmountDetailVehicle?: MoneyType1;
}

// ============================================================================
// Insurance Premiums Types
// ============================================================================

export interface InsurancePremiumsType {
  deductionInsuranceAndInterestMarried?: TaxAmountType;
  deductionInsuranceAndInterestSingle?: TaxAmountType;
  deductionChild?: TaxAmountType;
  totalDeductionInsuranceAndInterest?: TaxAmountType;
  finalDeduction?: TaxAmountType; // Wert C = niedrigerer von A und B
  cantonExtension?: CantonExtensionType;
  privateHealthInsurance?: MoneyType1; // Private Krankenversicherungsprämien
  privateAccidentInsurance?: MoneyType1;
  privateLifeAndPensionInsurance?: MoneyType1;
  interestSavings?: MoneyType1; // Zinsen von Sparkapitalien
  subtotalAmount?: MoneyType1; // Zwischentotal
  deductionsPremiumsReduction?: MoneyType1; // Maximaler Abzug (B)
  paidInsuranceAndInterest?: MoneyType1; // Total bezahlte Versicherungsprämien und Zinsen (A)
  deductionChildNumber?: any;
  cantonalTaxDeductionSupportPersonNumber?: number;
  cantonalTaxDeductionSupportPersonAmount?: MoneyType1;
  federalTaxDeductionSupportPersonNumber?: number;
  federalTaxDeductionSupportPersonAmount?: MoneyType1;
}

// ============================================================================
// Liabilities Types
// ============================================================================

export interface ListOfLiabilitiesType {
  privateLiabilities?: LiabilitiesListingType[];
  businessLiabilities?: LiabilitiesListingType[];
  cantonExtension?: CantonExtensionType;
  totalPrivateLiabilities?: MoneyType1;
  totalPrivateLiabilitiesInterest?: MoneyType1;
  totalBusinessLiabilities?: MoneyType1;
  totalBusinessLiabilitiesInterest?: MoneyType1;
  totalAmountLiabilities?: MoneyType1;
  totalAmountLiabilitiesInterest?: MoneyType1;
}

export interface LiabilitiesListingType {
  cantonExtension?: CantonExtensionType;
  creditor?: string;
  creditorAddress?: string;
  interestRate?: number;
  liabilityAmount?: MoneyType1; // Schuldhöhe per 31.12.
  interestAmount?: MoneyType1; // Zinsen im Jahr
}

// ============================================================================
// List of Properties Types (Liegenschaftenverzeichnis)
// ============================================================================

export interface ListOfPropertiesType {
  property?: PropertyType[];
  totalNotionalRentalValue?: MoneyType1;
  totalMaintenanceCosts?: MoneyType1;
  totalMortgageInterest?: MoneyType1;
  totalPropertyCosts?: MoneyType1;
  totalNetPropertyRevenue?: MoneyType1;
  totalTaxValue?: MoneyType1;
}

export interface PropertyType {
  propertyIdentification?: {
    street?: string;
    houseNumber?: string;
    town?: string;
    swissZipCode?: number;
    canton?: string;
  };
  propertyType?: string;
  propertyArea?: number; // m²
  propertyLandArea?: number; // m²
  ownershipShare?: number; // Prozent
  notionalRentalValue?: MoneyType1; // BRUTTO Eigenmietwert
  grossRevenue?: MoneyType1; // BRUTTO
  maintenanceCosts?: MoneyType1; // Pauschalabzug (20% bei pauschal)
  totalPropertyCosts?: MoneyType1; // Unterhalt + Hypothekarzinsen
  netPropertyRevenue?: MoneyType1; // NETTO nach Abzug
  taxValue?: MoneyType1; // Vermögenssteuerwert
  marketValue?: MoneyType1; // Marktwert (optional)
}

// ============================================================================
// Root Message Type
// ============================================================================

export interface ECH0119Message {
  '@minorVersion': number; // Required attribute
  header: ECH0119Header;
  content: ContentType;
}




