/**
 * eCH-0119 Mapping Functions
 * Maps WETAX data structures to eCH-0119 XML structure
 * 
 * Phase 1: P1 fields only
 */

import {
  ECH0119Header,
  PersonDataPartner1,
  RevenueType,
  DeductionType,
  RevenueCalculationType,
  AssetType,
  MainFormType,
  PartnerPersonIdentificationType,
  AddressType,
  SwissMunicipalityType,
  PartnerAmountType,
  TaxAmountType,
  PrivateBusinessType,
} from './types'
import { TaxReturn, TaxReturnData, User, ComputedTaxReturnT } from '../types'

/**
 * Maps header information from TaxReturn and User
 */
export function mapHeader(taxReturn: TaxReturn, user: User): ECH0119Header {
  return {
    taxPeriod: taxReturn.year.toString(),
    source: 0, // Software
    canton: 'ZH', // Kanton Zürich
    transactionDate: new Date().toISOString(),
    sourceDescription: 'WETAX Mobile App',
  }
}

/**
 * Parses address string into street and house number
 * Example: "Gossauerstrasse 42" -> { street: "Gossauerstrasse", houseNumber: "42" }
 */
function parseAddress(address: string | undefined): { street?: string; houseNumber?: string } {
  if (!address) return {}
  
  // Try to extract house number (last word that's numeric)
  const parts = address.trim().split(/\s+/)
  const lastPart = parts[parts.length - 1]
  
  if (/^\d+[a-z]?$/.test(lastPart)) {
    // Last part is a number (possibly with letter)
    return {
      street: parts.slice(0, -1).join(' '),
      houseNumber: lastPart,
    }
  }
  
  // No house number found, return entire address as street
  return { street: address }
}

/**
 * Converts date from WETAX format "20.10.2001" to ISO 8601 "2001-10-20"
 */
function convertDateToISO(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined
  
  // Format: "20.10.2001" -> "2001-10-20"
  const parts = dateStr.split('.')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  return undefined
}

/**
 * Maps marital status from WETAX string to eCH-0119 integer
 */
function mapMaritalStatus(zivilstand: string | undefined): number | undefined {
  if (!zivilstand) return undefined
  
  const mapping: Record<string, number> = {
    ledig: 1,
    verheiratet: 2,
    geschieden: 3,
    verwitwet: 4,
  }
  
  return mapping[zivilstand.toLowerCase()]
}

/**
 * Maps religion from WETAX string to eCH-0119 integer
 */
function mapReligion(konfession: string | undefined): number | undefined {
  if (!konfession) return undefined
  
  const mapping: Record<string, number> = {
    'römisch-katholisch': 1,
    'evangelisch-reformiert': 2,
    'christkatholisch': 3,
    'israelitisch': 4,
    'andere': 5,
    'keine': 6,
  }
  
  return mapping[konfession.toLowerCase()]
}

/**
 * Maps person data from TaxReturnData and User
 */
export function mapPersonDataPartner1(
  data: TaxReturnData,
  user: User,
): PersonDataPartner1 {
  const personData = data.personData?.data
  const address = parseAddress(personData?.adresse)
  
  const partnerPersonIdentification: PartnerPersonIdentificationType = {
    officialName: personData?.nachname || '',
    firstName: personData?.vorname || '',
    vn: user.ahvNummer,
    dateOfBirth: convertDateToISO(personData?.geburtsdatum),
  }
  
  const addressInformation: AddressType | undefined = personData?.adresse
    ? {
        street: address.street,
        houseNumber: address.houseNumber,
        town: personData.stadt,
        swissZipCode: personData.plz?.toString(),
        country: personData.land === 'schweiz' ? 'CH' : personData.land,
      }
    : undefined
  
  const taxMunicipality: SwissMunicipalityType | undefined = personData?.taxMunicipality
    ? {
        municipalityId: parseInt(personData.taxMunicipality, 10),
        cantonAbbreviation: 'ZH',
      }
    : undefined
  
  // Phone number from user
  const phoneNumberPrivate = user.phoneNumber
    ? {
        phoneNumber: user.phoneNumber,
      }
    : undefined

  // Payment pension (if saeule2 is active)
  const paymentPension = data.saeule2?.start ? true : undefined

  return {
    partnerPersonIdentification,
    addressInformation,
    maritalStatusTax: mapMaritalStatus(personData?.zivilstand),
    religion: mapReligion(personData?.konfession),
    job: personData?.beruf,
    employer: data.geldVerdient?.data?.[0]?.arbeitgeber,
    placeOfWork: data.geldVerdient?.data?.[0]?.arbeitsort,
    phoneNumberPrivate,
    paymentPension,
    taxMunicipality,
  }
}

/**
 * Maps revenue from TaxReturnData and ComputedTaxReturn
 */
export function mapRevenue(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): RevenueType {
  // Calculate employed main revenue (sum of all nettolohn)
  const employedMainRevenue: PartnerAmountType = {
    partner1Amount: computed.totalEinkuenfte > 0 ? computed.totalEinkuenfte : undefined,
  }
  
  // Securities revenue (from computed values)
  const securitiesRevenue: TaxAmountType | undefined =
    computed.bruttoertragA > 0 || computed.bruttoerttragB > 0
      ? {
          cantonalTax: computed.bruttoertragA > 0 ? computed.bruttoertragA : undefined,
          federalTax: computed.bruttoerttragB > 0 ? computed.bruttoerttragB : undefined,
        }
      : undefined
  
  // Unemployment insurance (erwerbsausfallentschaedigung)
  // Note: We have the field but no amount stored, so we skip it for now
  // If we get the amount later, we can add:
  // unemploymentInsurance: data.erwerbsausfallentschaedigung?.data?.betrag ? { partner1Amount: ... } : undefined

  // Child allowances - calculated from children
  const anzahlKinderImHaushalt = data.kinderImHaushalt?.data?.length ?? 0
  const anzahlKinderAusserhalb = data.kinderAusserhalb?.data?.length ?? 0
  const totalKinder = anzahlKinderImHaushalt + anzahlKinderAusserhalb
  // Note: Child allowances are typically not revenue but social deductions
  // We'll handle them in revenueCalculation as socialDeduction

  // Total revenue (sum of all revenue types)
  const totalAmountRevenue: TaxAmountType = {
    cantonalTax: computed.totalEinkuenfte + (computed.bruttoertragA || 0),
    federalTax: computed.totalEinkuenfte + (computed.bruttoerttragB || 0),
  }
  
  return {
    employedMainRevenue: employedMainRevenue.partner1Amount ? employedMainRevenue : undefined,
    securitiesRevenue,
    totalAmountRevenue,
  }
}

/**
 * Maps deductions from TaxReturnData and ComputedTaxReturn
 */
export function mapDeduction(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): DeductionType {
  // Job expenses
  const jobExpensesPartner1: TaxAmountType | undefined =
    computed.totalBerufsauslagenStaat > 0 || computed.totalBerufsauslagenBund > 0
      ? {
          cantonalTax: computed.totalBerufsauslagenStaat > 0 ? computed.totalBerufsauslagenStaat : undefined,
          federalTax: computed.totalBerufsauslagenBund > 0 ? computed.totalBerufsauslagenBund : undefined,
        }
      : undefined
  
  // Säule 3a (max 7'056 CHF for 2024)
  const provision3aAmount = data.saeule3a?.data?.betrag ?? 0
  const provision3aMax = 7056 // 2024 limit
  const provision3aEffective = Math.min(provision3aAmount, provision3aMax)
  
  const provision3aPartner1Deduction: TaxAmountType | undefined =
    provision3aEffective > 0
      ? {
          cantonalTax: provision3aEffective,
          federalTax: provision3aEffective,
        }
      : undefined
  
  // Insurance and interest
  const insuranceAndInterest: TaxAmountType | undefined =
    computed.versicherungenTotalStaat > 0 || computed.versicherungenTotalBund > 0
      ? {
          cantonalTax: computed.versicherungenTotalStaat > 0 ? computed.versicherungenTotalStaat : undefined,
          federalTax: computed.versicherungenTotalBund > 0 ? computed.versicherungenTotalBund : undefined,
        }
      : undefined
  
  // Further deduction: job-oriented further education
  const furtherDeductionJobOrientedFurtherEducationCost: TaxAmountType | undefined =
    computed.abzugAusbildungStaat > 0 || computed.abzugAusbildungBund > 0
      ? {
          cantonalTax: computed.abzugAusbildungStaat > 0 ? computed.abzugAusbildungStaat : undefined,
          federalTax: computed.abzugAusbildungBund > 0 ? computed.abzugAusbildungBund : undefined,
        }
      : undefined

  // Payment pension deduction (Säule 2)
  // Sum of ordentlichBetrag and einkaufBetrag
  const saeule2Ordentlich = data.saeule2?.data?.ordentlichBetrag ?? 0
  const saeule2Einkauf = data.saeule2?.data?.einkaufBetrag ?? 0
  const saeule2Total = saeule2Ordentlich + saeule2Einkauf
  const paymentPensionDeduction: TaxAmountType | undefined =
    saeule2Total > 0
      ? {
          cantonalTax: saeule2Total,
          federalTax: saeule2Total,
        }
      : undefined

  // AHV/IV Säule 2 selbst bezahlt
  const ahvIVSaeule2Selber = data.ahvIVsaeule2Selber?.data?.betrag ?? 0
  const furtherDeductionProvision: TaxAmountType | undefined =
    ahvIVSaeule2Selber > 0
      ? {
          cantonalTax: ahvIVSaeule2Selber,
          federalTax: ahvIVSaeule2Selber,
        }
      : undefined

  // Payment alimony child (from kinderImHaushalt)
  const alimonyChildTotal = (data.kinderImHaushalt?.data ?? []).reduce(
    (sum, kind) => sum + (kind.unterhaltsbeitragProJahr ?? 0),
    0,
  )
  const paymentAlimonyChild: TaxAmountType | undefined =
    alimonyChildTotal > 0
      ? {
          cantonalTax: alimonyChildTotal,
          federalTax: alimonyChildTotal,
        }
      : undefined

  // Note: amountLiabilitiesInterest - we don't have interest amount stored, only boolean "verschuldet"
  // If we get the interest amount later, we can add it here

  // Total deductions
  const totalAmountDeduction: TaxAmountType = {
    cantonalTax: computed.totalAbzuegeStaat,
    federalTax: computed.totalAbzuegeBund,
  }
  
  return {
    jobExpensesPartner1,
    provision3aPartner1Deduction,
    insuranceAndInterest,
    furtherDeductionJobOrientedFurtherEducationCost,
    paymentPensionDeduction,
    furtherDeductionProvision,
    paymentAlimonyChild,
    totalAmountDeduction,
    provision3aPartner1Effective: provision3aEffective > 0 ? provision3aEffective : undefined,
    paymentPensionTotal: saeule2Total > 0 ? saeule2Total : undefined,
  }
}

/**
 * Maps revenue calculation from TaxReturnData and ComputedTaxReturn
 */
export function mapRevenueCalculation(data: TaxReturnData, computed: ComputedTaxReturnT): RevenueCalculationType {
  // Total revenue
  const totalAmountRevenue: TaxAmountType = {
    cantonalTax: computed.totalEinkuenfte + (computed.bruttoertragA || 0),
    federalTax: computed.totalEinkuenfte + (computed.bruttoerttragB || 0),
  }
  
  // Total deductions
  const totalAmountDeduction: TaxAmountType = {
    cantonalTax: computed.totalAbzuegeStaat,
    federalTax: computed.totalAbzuegeBund,
  }
  
  // Net income
  const netIncome: TaxAmountType = {
    cantonalTax: computed.nettoEinkommenStaat,
    federalTax: computed.nettoEinkommenBund,
  }
  
  // Deduction charity (spenden)
  const deductionCharity: TaxAmountType | undefined =
    computed.spendenStaat || computed.spendenBund
      ? {
          cantonalTax: computed.spendenStaat,
          federalTax: computed.spendenBund,
        }
      : undefined
  
  // Adjusted net income (reineinkommen)
  const adjustedNetIncome: TaxAmountType = {
    cantonalTax: computed.reineinkommenStaat,
    federalTax: computed.reineinkommenBund,
  }
  
  // Social deductions for children
  const anzahlKinderImHaushalt = data.kinderImHaushalt?.data?.length ?? 0
  const anzahlKinderAusserhalb = data.kinderAusserhalb?.data?.length ?? 0
  
  // Kinderabzüge: 9'300 CHF pro Kind für Staatssteuer, 6'800 CHF pro Kind für Bundessteuer
  const kinderabzugStaat = anzahlKinderImHaushalt * 9300
  const kinderabzugBund = anzahlKinderImHaushalt * 6800
  const kinderabzugAusserhalbStaat = anzahlKinderAusserhalb * 9300
  const kinderabzugAusserhalbBund = anzahlKinderAusserhalb * 6800

  const socialDeductionHomeChild: TaxAmountType | undefined =
    kinderabzugStaat > 0 || kinderabzugBund > 0
      ? {
          cantonalTax: kinderabzugStaat > 0 ? kinderabzugStaat : undefined,
          federalTax: kinderabzugBund > 0 ? kinderabzugBund : undefined,
        }
      : undefined

  const socialDeductionExternalChild: TaxAmountType | undefined =
    kinderabzugAusserhalbStaat > 0 || kinderabzugAusserhalbBund > 0
      ? {
          cantonalTax: kinderabzugAusserhalbStaat > 0 ? kinderabzugAusserhalbStaat : undefined,
          federalTax: kinderabzugAusserhalbBund > 0 ? kinderabzugAusserhalbBund : undefined,
        }
      : undefined

  // Social deduction for partner (if married)
  // Note: This is typically calculated, but we don't have a direct field
  // For now, we skip it as it's usually part of the tax calculation

  // Total fiscal revenue (same as adjusted net income for Phase 1)
  const totalAmountFiscalRevenue: TaxAmountType = {
    cantonalTax: computed.reineinkommenStaat,
    federalTax: computed.reineinkommenBund,
  }
  
  return {
    totalAmountRevenue,
    totalAmountDeduction,
    netIncome,
    deductionCharity,
    adjustedNetIncome,
    socialDeductionHomeChild,
    socialDeductionExternalChild,
    totalAmountFiscalRevenue,
  }
}

/**
 * Maps assets from TaxReturnData and ComputedTaxReturn
 */
export function mapAsset(data: TaxReturnData, computed: ComputedTaxReturnT): AssetType {
  // Cash value (bargeld)
  const movablePropertyCashValue: PrivateBusinessType | undefined =
    data.bargeld?.data?.betrag
      ? {
          fiscalValue: data.bargeld.data.betrag,
        }
      : undefined

  // Edelmetalle (precious metals)
  const movablePropertyHeritageEtc: PrivateBusinessType | undefined =
    data.edelmetalle?.data?.betrag
      ? {
          fiscalValue: data.edelmetalle.data.betrag,
        }
      : undefined
  
  // Securities and assets (from bankkonto + aktien + krypto)
  const movablePropertySecuritiesAndAssets: PrivateBusinessType | undefined =
    computed.totalSteuerwertVermoegen > 0
      ? {
          fiscalValue: computed.totalSteuerwertVermoegen,
        }
      : undefined

  // Motor vehicle (Fahrzeug)
  // Note: Motor vehicles are typically not taxed as assets, but we include the fiscal value if calculated
  const motorfahrzeugFiscalValue = computed.motorfahrzeugeAbzugTotal > 0 
    ? computed.motorfahrzeugeAbzugTotal 
    : undefined
  
  const movablePropertyVehicle: PrivateBusinessType | undefined =
    motorfahrzeugFiscalValue
      ? {
          fiscalValue: motorfahrzeugFiscalValue,
        }
      : undefined

  // Vehicle details if available
  const moveablePropertyVehicleDescription = data.motorfahrzeug?.data?.bezeichung
  const moveablePropertyVehiclePurchasePrice = data.motorfahrzeug?.data?.kaufpreis
  const moveablePropertyVehicleYear = data.motorfahrzeug?.data?.kaufjahr?.toString()
  
  // Total assets
  const totalAmountAssets: PrivateBusinessType = {
    fiscalValue: computed.totalVermoegenswerte,
  }
  
  // Total fiscal assets (same as total assets for Phase 1)
  const totalAmountFiscalAssets: PrivateBusinessType = {
    fiscalValue: computed.totalVermoegenswerte,
  }
  
  return {
    movablePropertyCashValue,
    movablePropertySecuritiesAndAssets,
    movablePropertyHeritageEtc,
    movablePropertyVehicle,
    totalAmountAssets,
    totalAmountFiscalAssets,
    moveablePropertyVehicleDescription,
    moveablePropertyVehiclePurchasePrice,
    moveablePropertyVehicleYear,
  }
}

/**
 * Maps main form from TaxReturn, TaxReturnData, User, and ComputedTaxReturn
 */
export function mapMainForm(
  taxReturn: TaxReturn,
  data: TaxReturnData,
  user: User,
  computed: ComputedTaxReturnT,
): MainFormType {
  return {
    personDataPartner1: mapPersonDataPartner1(data, user),
    revenue: mapRevenue(data, computed),
    deduction: mapDeduction(data, computed),
    revenueCalculation: mapRevenueCalculation(data, computed),
    asset: mapAsset(data, computed),
  }
}

