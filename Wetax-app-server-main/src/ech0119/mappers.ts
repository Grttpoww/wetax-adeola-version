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
  ContentType,
  PartnerPersonIdentificationType,
  AddressType,
  SwissMunicipalityType,
  PartnerAmountType,
  TaxAmountType,
  PrivateBusinessType,
  ListOfSecuritiesType,
  SecurityEntryType,
  BankAccountType,
  JobExpensesFormType,
  JobExpensesType,
  InsurancePremiumsType,
  ListOfLiabilitiesType,
  LiabilitiesListingType,
  ListOfPropertiesType,
  PropertyType,
  MoneyType1,
} from './types'
import { TaxReturn, TaxReturnData, User, ComputedTaxReturnT } from '../types'
import { Document } from '../documents/types'
import { getCantonFromTaxReturn } from '../cantons/detection'
import { mapAttachments } from './attachment-mapper'
import { CantonRegistry } from '../cantons'
import { formatMoney } from './validator'

/**
 * Maps header information from TaxReturn and User
 * 
 * @param taxReturn - Die Steuererklärung
 * @param user - Der Benutzer
 * @param documents - Optional: Dokumente die als Attachments eingebunden werden sollen
 */
export async function mapHeader(
  taxReturn: TaxReturn,
  user: User,
  documents?: Document[]
): Promise<ECH0119Header> {
  // Kanton dynamisch bestimmen
  const canton = getCantonFromTaxReturn(taxReturn)
  const cantonConfig = CantonRegistry.get(canton)
  
  // Steuerperiode: 1. Januar bis 31. Dezember des Steuerjahres
  const year = taxReturn.year
  const periodFrom = `${year}-01-01`
  const periodTo = `${year}-12-31`
  
  // Transaction Number: Eindeutige ID für diese Übermittlung
  // Format: WETAX-{year}-{taxReturnId}
  const transactionNumber = `WETAX-${year}-${taxReturn._id.toString()}`
  
  const header: ECH0119Header = {
    taxPeriod: year.toString(),
    source: 0, // Software
    canton,
    transactionDate: new Date().toISOString(),
    sourceDescription: 'WETAX Mobile App',
    periodFrom,
    periodTo,
    transactionNumber,
  }
  
  // Attachments hinzufügen, falls vorhanden
  if (documents && documents.length > 0) {
    header.attachment = mapAttachments(taxReturn, documents, canton)
  }
  
  // Kantonale Extension im Header
  if (cantonConfig) {
    header.cantonExtension = { canton }
    
    // Kanton-spezifische Header-Erweiterungen
    if (cantonConfig.extensionHandler?.extendHeader) {
      return cantonConfig.extensionHandler.extendHeader(header, taxReturn)
    }
  }
  
  return header
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
  // Calculate employed main revenue (ONLY Erwerbseinkommen, not totalEinkuenfte!)
  // Erwerbseinkommen = Summe aller nettolohn (Hauptberuf + Nebenerwerb)
  const einkuenfteLohn = data.geldVerdient.data.reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)
  const employedMainRevenue: PartnerAmountType = {
    partner1Amount: einkuenfteLohn > 0 ? formatMoney(einkuenfteLohn) : undefined,
  }
  
  // Securities revenue (Zinsen + Dividenden)
  // bruttoertragA = mit Verrechnungssteuer (schweizerisch)
  // bruttoertragB = ohne Verrechnungssteuer (ausländisch)
  // Total = A + B für beide Steuerarten
  const totalSecuritiesRevenue = (computed.bruttoertragA || 0) + (computed.bruttoerttragB || 0)
  const securitiesRevenue: TaxAmountType | undefined =
    totalSecuritiesRevenue > 0
      ? {
          cantonalTax: formatMoney(totalSecuritiesRevenue),
          federalTax: formatMoney(totalSecuritiesRevenue),
        }
      : undefined
  
  // Property revenue: Brutto und Netto mit Zwischenwerten
  // WICHTIG: propertyNotionalRentalValue = BRUTTO (Eigenmietwert vor Abzug)
  // propertyRemainingRevenue = NETTO (nach Pauschalabzug)
  let propertyNotionalRentalValue: number | undefined
  let propertyRevenueGross: number | undefined
  let propertyDeductionFlatrate: number | undefined
  let propertyRemainingRevenue: number | undefined
  
  if (data.liegenschaften?.data && data.liegenschaften.data.length > 0) {
    let totalBrutto = 0
    let totalPauschalabzug = 0
    let totalNetto = 0
    
    data.liegenschaften.data.forEach((l) => {
      const brutto = l.eigenmietwertOderMietertrag ?? 0
      totalBrutto += brutto
      
      // Pauschalabzug: 20% des Bruttomietertrags (wenn pauschal)
      if (l.unterhaltArt === 'pauschal' && !l.istGeschaeftlich) {
        const pauschalabzug = brutto * 0.2
        totalPauschalabzug += pauschalabzug
        totalNetto += brutto - pauschalabzug
      } else if (l.unterhaltArt === 'effektiv') {
        const effektiv = l.unterhaltBetrag ?? 0
        totalPauschalabzug += effektiv
        totalNetto += brutto - effektiv
      } else {
        totalNetto += brutto
      }
    })
    
    if (totalBrutto > 0) {
      propertyNotionalRentalValue = formatMoney(totalBrutto)
      propertyRevenueGross = formatMoney(totalBrutto)
      propertyDeductionFlatrate = totalPauschalabzug > 0 ? formatMoney(totalPauschalabzug) : undefined
      propertyRemainingRevenue = formatMoney(totalNetto)
    }
  }
  
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
  // Erwerbseinkommen + Wertschriftenertrag + Liegenschaftenertrag (NETTO nach Abzug)
  // WICHTIG: propertyRemainingRevenue ist NETTO, das wird für Total Revenue verwendet
  const liegenschaftenNetto = propertyRemainingRevenue ? Number(propertyRemainingRevenue) : (computed.nettoertragLiegenschaften || 0)
  const totalRevenueCantonal = einkuenfteLohn + totalSecuritiesRevenue + liegenschaftenNetto
  const totalRevenueFederal = einkuenfteLohn + totalSecuritiesRevenue + liegenschaftenNetto
  const totalAmountRevenue: TaxAmountType = {
    cantonalTax: formatMoney(totalRevenueCantonal),
    federalTax: formatMoney(totalRevenueFederal),
  }
  
  return {
    employedMainRevenue: employedMainRevenue.partner1Amount ? employedMainRevenue : undefined,
    securitiesRevenue,
    propertyNotionalRentalValue,
    propertyRevenueGross,
    propertyDeductionFlatrate,
    propertyRemainingRevenue,
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
          cantonalTax: computed.totalBerufsauslagenStaat > 0 ? formatMoney(computed.totalBerufsauslagenStaat) : undefined,
          federalTax: computed.totalBerufsauslagenBund > 0 ? formatMoney(computed.totalBerufsauslagenBund) : undefined,
        }
      : undefined
  
  // Säule 3a (max 7'056 CHF for 2024, but we use 6'500 CHF for safety)
  const provision3aAmount = data.saeule3a?.data?.betrag ?? 0
  const provision3aMax = 6500 // 2024 limit (sicherheitshalber)
  const provision3aEffective = Math.min(provision3aAmount, provision3aMax)
  
  const provision3aPartner1Deduction: TaxAmountType | undefined =
    provision3aEffective > 0
      ? {
          cantonalTax: formatMoney(provision3aEffective),
          federalTax: formatMoney(provision3aEffective),
        }
      : undefined
  
  // Insurance and interest
  const insuranceAndInterest: TaxAmountType | undefined =
    computed.versicherungenTotalStaat > 0 || computed.versicherungenTotalBund > 0
      ? {
          cantonalTax: computed.versicherungenTotalStaat > 0 ? formatMoney(computed.versicherungenTotalStaat) : undefined,
          federalTax: computed.versicherungenTotalBund > 0 ? formatMoney(computed.versicherungenTotalBund) : undefined,
        }
      : undefined
  
  // Further deduction: job-oriented further education
  const furtherDeductionJobOrientedFurtherEducationCost: TaxAmountType | undefined =
    computed.abzugAusbildungStaat > 0 || computed.abzugAusbildungBund > 0
      ? {
          cantonalTax: computed.abzugAusbildungStaat > 0 ? formatMoney(computed.abzugAusbildungStaat) : undefined,
          federalTax: computed.abzugAusbildungBund > 0 ? formatMoney(computed.abzugAusbildungBund) : undefined,
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
          cantonalTax: formatMoney(saeule2Total),
          federalTax: formatMoney(saeule2Total),
        }
      : undefined

  // AHV/IV Säule 2 selbst bezahlt
  const ahvIVSaeule2Selber = data.ahvIVsaeule2Selber?.data?.betrag ?? 0
  const furtherDeductionProvision: TaxAmountType | undefined =
    ahvIVSaeule2Selber > 0
      ? {
          cantonalTax: formatMoney(ahvIVSaeule2Selber),
          federalTax: formatMoney(ahvIVSaeule2Selber),
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
          cantonalTax: formatMoney(alimonyChildTotal),
          federalTax: formatMoney(alimonyChildTotal),
        }
      : undefined

  // Schuldzinsen (amountLiabilitiesInterest)
  const schuldzinsenBetrag = data.schuldzinsen?.data?.betrag ?? 0
  const amountLiabilitiesInterest: TaxAmountType | undefined =
    schuldzinsenBetrag > 0
      ? {
          cantonalTax: formatMoney(schuldzinsenBetrag),
          federalTax: formatMoney(schuldzinsenBetrag),
        }
      : undefined

  // Total deductions
  const totalAmountDeduction: TaxAmountType = {
    cantonalTax: formatMoney(computed.totalAbzuegeStaat),
    federalTax: formatMoney(computed.totalAbzuegeBund),
  }
  
  return {
    jobExpensesPartner1,
    provision3aPartner1Deduction,
    insuranceAndInterest,
    amountLiabilitiesInterest,
    furtherDeductionJobOrientedFurtherEducationCost,
    paymentPensionDeduction,
    furtherDeductionProvision,
    paymentAlimonyChild,
    totalAmountDeduction,
    provision3aPartner1Effective: provision3aEffective > 0 ? formatMoney(provision3aEffective) : undefined,
    paymentPensionTotal: saeule2Total > 0 ? formatMoney(saeule2Total) : undefined,
  }
}

/**
 * Maps revenue calculation from TaxReturnData and ComputedTaxReturn
 */
export function mapRevenueCalculation(data: TaxReturnData, computed: ComputedTaxReturnT): RevenueCalculationType {
  // Total revenue = Erwerbseinkommen + Wertschriftenertrag + Liegenschaftenertrag
  const einkuenfteLohn = data.geldVerdient.data.reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)
  const totalSecuritiesRevenue = (computed.bruttoertragA || 0) + (computed.bruttoerttragB || 0)
  const totalRevenueCantonal = einkuenfteLohn + totalSecuritiesRevenue + (computed.nettoertragLiegenschaften || 0)
  const totalRevenueFederal = einkuenfteLohn + totalSecuritiesRevenue + (computed.nettoertragLiegenschaften || 0)
  
  const totalAmountRevenue: TaxAmountType = {
    cantonalTax: formatMoney(totalRevenueCantonal),
    federalTax: formatMoney(totalRevenueFederal),
  }
  
  // Total deductions
  const totalAmountDeduction: TaxAmountType = {
    cantonalTax: formatMoney(computed.totalAbzuegeStaat),
    federalTax: formatMoney(computed.totalAbzuegeBund),
  }
  
  // Net income
  const netIncome: TaxAmountType = {
    cantonalTax: formatMoney(computed.nettoEinkommenStaat),
    federalTax: formatMoney(computed.nettoEinkommenBund),
  }
  
  // Deduction charity (spenden)
  const deductionCharity: TaxAmountType | undefined =
    computed.spendenStaat || computed.spendenBund
      ? {
          cantonalTax: formatMoney(computed.spendenStaat),
          federalTax: formatMoney(computed.spendenBund),
        }
      : undefined
  
  // Adjusted net income (reineinkommen)
  const adjustedNetIncome: TaxAmountType = {
    cantonalTax: formatMoney(computed.reineinkommenStaat),
    federalTax: formatMoney(computed.reineinkommenBund),
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
          cantonalTax: kinderabzugStaat > 0 ? formatMoney(kinderabzugStaat) : undefined,
          federalTax: kinderabzugBund > 0 ? formatMoney(kinderabzugBund) : undefined,
        }
      : undefined

  const socialDeductionExternalChild: TaxAmountType | undefined =
    kinderabzugAusserhalbStaat > 0 || kinderabzugAusserhalbBund > 0
      ? {
          cantonalTax: kinderabzugAusserhalbStaat > 0 ? formatMoney(kinderabzugAusserhalbStaat) : undefined,
          federalTax: kinderabzugAusserhalbBund > 0 ? formatMoney(kinderabzugAusserhalbBund) : undefined,
        }
      : undefined

  // Social deduction for partner (if married)
  // Note: This is typically calculated, but we don't have a direct field
  // For now, we skip it as it's usually part of the tax calculation

  // Total fiscal revenue (same as adjusted net income for Phase 1)
  const totalAmountFiscalRevenue: TaxAmountType = {
    cantonalTax: formatMoney(computed.reineinkommenStaat),
    federalTax: formatMoney(computed.reineinkommenBund),
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
          fiscalValue: formatMoney(data.bargeld.data.betrag),
        }
      : undefined

  // Edelmetalle (precious metals)
  const movablePropertyHeritageEtc: PrivateBusinessType | undefined =
    data.edelmetalle?.data?.betrag
      ? {
          fiscalValue: formatMoney(data.edelmetalle.data.betrag),
        }
      : undefined
  
  // Securities and assets (from bankkonto + aktien + krypto)
  const movablePropertySecuritiesAndAssets: PrivateBusinessType | undefined =
    computed.totalSteuerwertVermoegen > 0
      ? {
          fiscalValue: formatMoney(computed.totalSteuerwertVermoegen),
        }
      : undefined

  // Motor vehicle (Fahrzeug)
  // Note: Motor vehicles are typically not taxed as assets, but we include the fiscal value if calculated
  const motorfahrzeugFiscalValue = computed.motorfahrzeugeAbzugTotal > 0 
    ? formatMoney(computed.motorfahrzeugeAbzugTotal)
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
    ? formatMoney(data.motorfahrzeug.data.kaufpreis)
    : undefined
  const moveablePropertyVehicleYear = data.motorfahrzeug?.data?.kaufjahr?.toString()
  
  // Total assets (BRUTTO-Vermögen, ohne Schulden)
  // totalVermoegenswerte ist NETTO (mit Schulden), daher müssen wir Liegenschaften separat addieren
  const bruttoVermoegen = 
    (computed.totalSteuerwertVermoegen || 0) +
    (data.bargeld?.data?.betrag || 0) +
    (data.edelmetalle?.data?.betrag || 0) +
    (computed.motorfahrzeugeAbzugTotal || 0) +
    (computed.totalSteuerwertLiegenschaften || 0)
  
  const totalAmountAssets: PrivateBusinessType = {
    fiscalValue: formatMoney(bruttoVermoegen),
  }
  
  // Property (Liegenschaften)
  const propertyHouseOrFlat: PrivateBusinessType | undefined =
    computed.totalSteuerwertLiegenschaften > 0
      ? {
          fiscalValue: formatMoney(computed.totalSteuerwertLiegenschaften),
        }
      : undefined

  // Total fiscal assets (same as total assets for Phase 1)
  const totalAmountFiscalAssets: PrivateBusinessType = {
    fiscalValue: formatMoney(computed.totalVermoegenswerte),
  }
  
  return {
    movablePropertyCashValue,
    movablePropertySecuritiesAndAssets,
    movablePropertyHeritageEtc,
    movablePropertyVehicle,
    propertyHouseOrFlat,
    totalAmountAssets,
    totalAmountFiscalAssets,
    moveablePropertyVehicleDescription,
    moveablePropertyVehiclePurchasePrice,
    moveablePropertyVehicleYear,
  }
}

/**
 * Maps list of securities from TaxReturnData and ComputedTaxReturn
 */
export function mapListOfSecurities(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): ListOfSecuritiesType | undefined {
  const securityEntries: SecurityEntryType[] = []
  
  // Bankkonti mit Zinserträgen
  data.bankkonto?.data?.forEach((konto) => {
    if (konto.zinsbetrag && konto.zinsbetrag > 0) {
      securityEntries.push({
        detailedDescription: `Bankkonto ${konto.bezeichnung ?? ''} - ${konto.bankGesellschaft ?? ''}`,
        securitiesNumber: konto.kontoOderDepotNr,
        countryOfDepositaryBank: konto.staat === 'schweiz' ? 'CH' : konto.staat?.toUpperCase(),
        taxValueEndOfYear: {
          cantonalTax: formatMoney(konto.steuerwertEndeJahr ?? 0),
          federalTax: formatMoney(konto.steuerwertEndeJahr ?? 0),
        },
        grossRevenueA: konto.zinsUeber200 && konto.zinsbetrag
          ? {
              cantonalTax: formatMoney(konto.zinsbetrag),
              federalTax: formatMoney(konto.zinsbetrag),
            }
          : undefined,
        grossRevenueB: !konto.zinsUeber200 && konto.zinsbetrag
          ? {
              cantonalTax: formatMoney(konto.zinsbetrag),
              federalTax: formatMoney(konto.zinsbetrag),
            }
          : undefined,
      })
    }
  })
  
  // Aktien mit Dividenden
  data.aktien?.data?.forEach((aktie) => {
    if (aktie.dividendenertrag && aktie.dividendenertrag > 0) {
      const isSwiss = aktie.staat === 'CH'
      securityEntries.push({
        detailedDescription: `Aktie ${aktie.gesellschaftTitel ?? ''}`,
        securitiesNumber: aktie.valorenNr,
        faceValueQuantity: aktie.stueckzahl,
        countryOfDepositaryBank: aktie.staat?.toUpperCase() || 'CH',
        taxValueEndOfYear: {
          cantonalTax: formatMoney((aktie.stueckzahl ?? 0) * (aktie.steuerwertProStueck ?? 0)),
          federalTax: formatMoney((aktie.stueckzahl ?? 0) * (aktie.steuerwertProStueck ?? 0)),
        },
        grossRevenueA: isSwiss
          ? {
              cantonalTax: formatMoney(aktie.dividendenertrag),
              federalTax: formatMoney(aktie.dividendenertrag),
            }
          : undefined,
        grossRevenueB: !isSwiss
          ? {
              cantonalTax: formatMoney(aktie.dividendenertrag),
              federalTax: formatMoney(aktie.dividendenertrag),
            }
          : undefined,
        code: aktie.istQualifizierteBeteiligung ? '04' : undefined, // qualified investment
      })
    }
  })
  
  // Nur wenn es Einträge gibt
  if (securityEntries.length === 0 && computed.verrechnungssteueranspruch === 0) {
    return undefined
  }
  
  // Verrechnungssteuer berechnen (35% von bruttoertragA)
  const withholdingTax = computed.verrechnungssteueranspruch > 0
    ? Math.round(computed.verrechnungssteueranspruch * 100) / 100 // moneyType2 = 2 Dezimalstellen
    : undefined
  
  // Total tax value
  const totalTaxValue: TaxAmountType = {
    cantonalTax: formatMoney(computed.totalSteuerwertVermoegen),
    federalTax: formatMoney(computed.totalSteuerwertVermoegen),
  }
  
  // Total gross revenue
  const totalGrossRevenue: TaxAmountType = {
    cantonalTax: formatMoney((computed.bruttoertragA || 0) + (computed.bruttoerttragB || 0)),
    federalTax: formatMoney((computed.bruttoertragA || 0) + (computed.bruttoerttragB || 0)),
  }
  
  return {
    securityEntry: securityEntries.length > 0 ? securityEntries : undefined,
    totalTaxValue,
    totalGrossRevenue,
    withholdingTax,
  }
}

/**
 * Maps job expenses with intermediate values
 */
export function mapJobExpenses(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): JobExpensesFormType | undefined {
  const zivilstand = data.personData?.data?.zivilstand
  const isMarried = zivilstand === 'verheiratet'
  
  // Calculate intermediate values
  // NUR ÖV und Velo als Fahrtkosten (Auto ist im Vermögen, implizit Freizeitauto)
  const oevKostenPerson1 = data.oevArbeit?.data?.kosten ?? 0
  const oevKostenPerson2 = isMarried ? (data.oevArbeit?.data?.partner2Kosten ?? 0) : 0
  const veloArbeitPerson1 = data?.veloArbeit?.start ? 700 : 0
  const veloArbeitPerson2 = isMarried && data?.veloArbeit?.data?.partner2VeloArbeit ? 700 : 0
  
  // Fahrkosten Total (NUR ÖV + Velo, KEIN Auto)
  // Limits: Staat 5'200, Bund 3'300 (pro Person)
  const fahrkostenLimitStaat = 5200
  const fahrkostenLimitBund = 3300
  
  const fahrkostenPerson1Staat = Math.min(oevKostenPerson1 + veloArbeitPerson1, fahrkostenLimitStaat)
  const fahrkostenPerson1Bund = Math.min(oevKostenPerson1 + veloArbeitPerson1, fahrkostenLimitBund)
  const fahrkostenPerson2Staat = isMarried ? Math.min(oevKostenPerson2 + veloArbeitPerson2, fahrkostenLimitStaat) : 0
  const fahrkostenPerson2Bund = isMarried ? Math.min(oevKostenPerson2 + veloArbeitPerson2, fahrkostenLimitBund) : 0
  
  const fahrkostenTotalStaat = fahrkostenPerson1Staat + fahrkostenPerson2Staat
  const fahrkostenTotalBund = fahrkostenPerson1Bund + fahrkostenPerson2Bund
  
  // Verpflegung: Separate calculation for person 1 and person 2
  const verpflegungLimit = 3200 // Max deductible per person
  const verpflegungPerson1Tage = data.verpflegungAufArbeit?.data?.anzahlTage ?? 0
  const verpflegungPerson2Tage = isMarried ? (data.verpflegungAufArbeit?.data?.partner2AnzahlTage ?? 0) : 0
  const hasVerbilligung = !!data.essenVerbilligungenVomArbeitgeber?.start
  
  // Person 1 Verpflegung
  const essenNichtVerbilligtPerson1 = data.verpflegungAufArbeit?.start && !hasVerbilligung
    ? Math.min(15 * verpflegungPerson1Tage, verpflegungLimit)
    : 0
  const essenVerbilligungenPerson1 = data.verpflegungAufArbeit?.start && hasVerbilligung
    ? Math.min(7.5 * verpflegungPerson1Tage, 1600)
    : 0
  const verpflegungPerson1 = essenNichtVerbilligtPerson1 + essenVerbilligungenPerson1
  
  // Person 2 Verpflegung (only if married)
  const essenNichtVerbilligtPerson2 = isMarried && data.verpflegungAufArbeit?.start && !hasVerbilligung
    ? Math.min(15 * verpflegungPerson2Tage, verpflegungLimit)
    : 0
  const essenVerbilligungenPerson2 = isMarried && data.verpflegungAufArbeit?.start && hasVerbilligung
    ? Math.min(7.5 * verpflegungPerson2Tage, 1600)
    : 0
  const verpflegungPerson2 = essenNichtVerbilligtPerson2 + essenVerbilligungenPerson2
  
  // Übrige Berufskosten (3% Pauschale, min 2k, max 4k)
  const uebrigeBerufskosten = computed.uebrigeAbzuegeBeruf ?? 0
  
  const jobExpensePartner1: JobExpensesType = {
    ticketCostPublicTransport: oevKostenPerson1 > 0 ? {
      cantonalTax: formatMoney(oevKostenPerson1),
      federalTax: formatMoney(oevKostenPerson1),
    } : undefined,
    bicycleOrSmallMotorbike: veloArbeitPerson1 > 0 ? {
      cantonalTax: formatMoney(veloArbeitPerson1),
      federalTax: formatMoney(veloArbeitPerson1),
    } : undefined,
    subtotalVehicle: fahrkostenTotalStaat > 0 || fahrkostenTotalBund > 0 ? {
      cantonalTax: formatMoney(fahrkostenTotalStaat),
      federalTax: formatMoney(fahrkostenTotalBund),
    } : undefined,
    cateringNonSubsidized: (computed.essenNichtVerbilligt ?? 0) > 0 ? {
      cantonalTax: formatMoney(computed.essenNichtVerbilligt ?? 0),
      federalTax: formatMoney(computed.essenNichtVerbilligt ?? 0),
    } : undefined,
    cateringSubsidized: (computed.essenVerbilligungenVomArbeitgeber ?? 0) > 0 ? {
      cantonalTax: formatMoney(computed.essenVerbilligungenVomArbeitgeber ?? 0),
      federalTax: formatMoney(computed.essenVerbilligungenVomArbeitgeber ?? 0),
    } : undefined,
    cateringShiftWork: (computed.schichtarbeit ?? 0) > 0 ? {
      cantonalTax: formatMoney(computed.schichtarbeit ?? 0),
      federalTax: formatMoney(computed.schichtarbeit ?? 0),
    } : undefined,
    remainingJobCostFlatrate: uebrigeBerufskosten > 0 ? {
      cantonalTax: formatMoney(uebrigeBerufskosten),
      federalTax: formatMoney(uebrigeBerufskosten),
    } : undefined,
    totalAmountJobExpenses: computed.totalBerufsauslagenStaat > 0 || computed.totalBerufsauslagenBund > 0 ? {
      cantonalTax: formatMoney(computed.totalBerufsauslagenStaat),
      federalTax: formatMoney(computed.totalBerufsauslagenBund),
    } : undefined,
  }
  
  return {
    jobExpensePartner1,
  }
}

/**
 * Maps insurance premiums with intermediate values
 */
export function mapInsurancePremiums(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): InsurancePremiumsType | undefined {
  const zivilstand = data.personData?.data?.zivilstand
  const isMarried = zivilstand === 'verheiratet'
  
  // Private Krankenversicherungsprämien
  const privateHealthInsurance = data.versicherungspraemie?.data?.betrag ?? 0
  const privateHealthInsurancePerson2 = isMarried ? (data.versicherungspraemie?.data?.partner2Betrag ?? 0) : 0
  const privateHealthInsuranceTotal = privateHealthInsurance + privateHealthInsurancePerson2
  
  // Private Unfallversicherung
  const privateAccidentInsurance = data.privateUnfall?.data?.betrag ?? 0
  const privateAccidentInsurancePerson2 = isMarried ? (data.privateUnfall?.data?.partner2Betrag ?? 0) : 0
  const privateAccidentInsuranceTotal = privateAccidentInsurance + privateAccidentInsurancePerson2
  
  // Zinsen von Sparkapitalien (aus Bankkonten)
  const interestSavings = data.bankkonto?.data?.reduce((acc, v) => acc + (v.zinsbetrag ?? 0), 0) ?? 0
  
  // Zwischentotal (A)
  const subtotalAmount = privateHealthInsuranceTotal + privateAccidentInsuranceTotal + interestSavings
  
  // Maximaler Abzug (B) - bereits in computed
  const deductionsPremiumsReductionStaat = computed.maxAbzugVersicherungStaat ?? 0
  const deductionsPremiumsReductionBund = computed.maxAbzugVersicherungBund ?? 0
  
  // Total bezahlte Versicherungsprämien und Zinsen (A)
  const paidInsuranceAndInterest = subtotalAmount
  
  // Finaler Abzug (C) = niedrigerer von A und B
  const finalDeductionStaat = Math.min(paidInsuranceAndInterest, deductionsPremiumsReductionStaat)
  const finalDeductionBund = Math.min(paidInsuranceAndInterest, deductionsPremiumsReductionBund)
  
  return {
    privateHealthInsurance: privateHealthInsuranceTotal > 0 ? formatMoney(privateHealthInsuranceTotal) : undefined,
    privateAccidentInsurance: privateAccidentInsuranceTotal > 0 ? formatMoney(privateAccidentInsuranceTotal) : undefined,
    interestSavings: interestSavings > 0 ? formatMoney(interestSavings) : undefined,
    subtotalAmount: subtotalAmount > 0 ? formatMoney(subtotalAmount) : undefined,
    deductionsPremiumsReduction: deductionsPremiumsReductionStaat > 0 ? formatMoney(deductionsPremiumsReductionStaat) : undefined,
    paidInsuranceAndInterest: paidInsuranceAndInterest > 0 ? formatMoney(paidInsuranceAndInterest) : undefined,
    finalDeduction: finalDeductionStaat > 0 || finalDeductionBund > 0 ? {
      cantonalTax: formatMoney(finalDeductionStaat),
      federalTax: formatMoney(finalDeductionBund),
    } : undefined,
  }
}

/**
 * Maps list of liabilities (Schulden)
 */
export function mapListOfLiabilities(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): ListOfLiabilitiesType | undefined {
  if (!data.verschuldet?.start || !data.verschuldet?.data || data.verschuldet.data.length === 0) {
    return undefined
  }
  
  const privateLiabilities: LiabilitiesListingType[] = data.verschuldet.data.map((schuld) => ({
    creditor: schuld.glauebiger,
    creditorAddress: schuld.glauebigerAdresse,
    interestRate: schuld.zinssatz,
    liabilityAmount: schuld.schuldhoehe ? formatMoney(schuld.schuldhoehe) : undefined,
    interestAmount: schuld.zinsenImJahr ? formatMoney(schuld.zinsenImJahr) : undefined,
  }))
  
  const totalPrivateLiabilities = data.verschuldet.data.reduce((acc, v) => acc + (v.schuldhoehe ?? 0), 0)
  const totalPrivateLiabilitiesInterest = data.verschuldet.data.reduce((acc, v) => acc + (v.zinsenImJahr ?? 0), 0)
  
  return {
    privateLiabilities: privateLiabilities.length > 0 ? privateLiabilities : undefined,
    totalPrivateLiabilities: totalPrivateLiabilities > 0 ? formatMoney(totalPrivateLiabilities) : undefined,
    totalPrivateLiabilitiesInterest: totalPrivateLiabilitiesInterest > 0 ? formatMoney(totalPrivateLiabilitiesInterest) : undefined,
    totalAmountLiabilities: totalPrivateLiabilities > 0 ? formatMoney(totalPrivateLiabilities) : undefined,
    totalAmountLiabilitiesInterest: totalPrivateLiabilitiesInterest > 0 ? formatMoney(totalPrivateLiabilitiesInterest) : undefined,
  }
}

/**
 * Maps list of properties (Liegenschaftenverzeichnis) with intermediate values
 */
export function mapListOfProperties(
  data: TaxReturnData,
  computed: ComputedTaxReturnT,
): ListOfPropertiesType | undefined {
  if (!data.liegenschaften?.data || data.liegenschaften.data.length === 0) {
    return undefined
  }
  
  const properties: PropertyType[] = []
  let totalNotionalRentalValue = 0
  let totalMaintenanceCosts = 0
  let totalPropertyCosts = 0
  let totalNetPropertyRevenue = 0
  let totalTaxValue = 0
  
  data.liegenschaften.data.forEach((l) => {
    const bruttoErtrag = l.eigenmietwertOderMietertrag ?? 0
    const vermoegenssteuerwert = l.vermoegenssteuerwert ?? 0
    
    // Pauschalabzug: 20% des Bruttomietertrags (wenn pauschal)
    let unterhalt = 0
    if (l.unterhaltArt === 'pauschal' && !l.istGeschaeftlich) {
      unterhalt = bruttoErtrag * 0.2
    } else if (l.unterhaltArt === 'effektiv') {
      unterhalt = l.unterhaltBetrag ?? 0
    }
    
    // Hypothekarzinsen werden separat ausgewiesen und abgezogen, gehören NICHT zu Property Costs
    // Property Costs = nur Unterhaltskosten (maintenanceCosts)
    const nettoErtrag = bruttoErtrag - unterhalt
    const totalCosts = unterhalt // Nur Unterhalt, keine Hypothekarzinsen
    
    // Adresse aus Liegenschaft oder Personendaten
    const adresse = l.ort || data.personData?.data?.stadt || ''
    const plz = data.personData?.data?.plz || 0
    const strasse = data.personData?.data?.adresse?.split(',')[0] || ''
    
    properties.push({
      propertyIdentification: {
        street: strasse || undefined,
        houseNumber: undefined,
        town: adresse || undefined,
        swissZipCode: plz > 0 ? plz : undefined,
        canton: l.kanton || 'ZH',
      },
      propertyType: l.bezeichnung || 'Eigentumswohnung',
      notionalRentalValue: formatMoney(bruttoErtrag), // BRUTTO
      grossRevenue: formatMoney(bruttoErtrag), // BRUTTO
      maintenanceCosts: unterhalt > 0 ? formatMoney(unterhalt) : undefined, // Pauschalabzug
      totalPropertyCosts: totalCosts > 0 ? formatMoney(totalCosts) : undefined, // Nur Unterhalt, keine Hypothekarzinsen
      netPropertyRevenue: formatMoney(nettoErtrag), // NETTO
      taxValue: formatMoney(vermoegenssteuerwert),
    })
    
    totalNotionalRentalValue += bruttoErtrag
    totalMaintenanceCosts += unterhalt
    totalPropertyCosts += totalCosts // Nur Unterhalt
    totalNetPropertyRevenue += nettoErtrag
    totalTaxValue += vermoegenssteuerwert
  })
  
  // Hypothekarzinsen separat berechnen (werden bereits separat abgezogen, gehören NICHT zu Property Costs)
  const totalMortgageInterest = data.schuldzinsen?.data?.betrag ?? 0
  
  return {
    property: properties.length > 0 ? properties : undefined,
    totalNotionalRentalValue: totalNotionalRentalValue > 0 ? formatMoney(totalNotionalRentalValue) : undefined,
    totalMaintenanceCosts: totalMaintenanceCosts > 0 ? formatMoney(totalMaintenanceCosts) : undefined,
    totalMortgageInterest: totalMortgageInterest > 0 ? formatMoney(totalMortgageInterest) : undefined,
    totalPropertyCosts: totalPropertyCosts > 0 ? formatMoney(totalPropertyCosts) : undefined,
    totalNetPropertyRevenue: totalNetPropertyRevenue > 0 ? formatMoney(totalNetPropertyRevenue) : undefined,
    totalTaxValue: totalTaxValue > 0 ? formatMoney(totalTaxValue) : undefined,
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
  // attachedColumn3a: true wenn 3a-Beleg vorhanden (obligatorisch)
  const has3a = (data.saeule3a?.data?.betrag ?? 0) > 0 || (data.saeule3a?.data?.partner2Betrag ?? 0) > 0
  
  return {
    personDataPartner1: mapPersonDataPartner1(data, user),
    revenue: mapRevenue(data, computed),
    deduction: mapDeduction(data, computed),
    revenueCalculation: mapRevenueCalculation(data, computed),
    asset: mapAsset(data, computed),
    attachedForms: has3a ? {
      attachedColumn3a: true,
    } : undefined,
  }
}

/**
 * Maps content (includes mainForm + additional forms like jobExpenses, insurancePremiums)
 */
export function mapContent(
  taxReturn: TaxReturn,
  data: TaxReturnData,
  user: User,
  computed: ComputedTaxReturnT,
): ContentType {
  return {
    mainForm: mapMainForm(taxReturn, data, user, computed),
    listOfSecurities: mapListOfSecurities(data, computed),
    listOfLiabilities: mapListOfLiabilities(data, computed),
    listOfProperties: mapListOfProperties(data, computed),
    jobExpenses: mapJobExpenses(data, computed),
    insurancePremiums: mapInsurancePremiums(data, computed),
  }
}

