/**
 * eCH-0119 XML Generator
 * Generates XML from eCH-0119 data structures
 * 
 * Uses xmlbuilder2 for XML generation
 */

import { create } from 'xmlbuilder2'
import {
  ECH0119Message,
  ECH0119Header,
  PersonDataPartner1,
  RevenueType,
  DeductionType,
  RevenueCalculationType,
  AssetType,
  MainFormType,
  ContentType,
  PartnerAmountType,
  TaxAmountType,
  PrivateBusinessType,
  AddressType,
  SwissMunicipalityType,
  ListOfSecuritiesType,
  SecurityEntryType,
  JobExpensesFormType,
  JobExpensesType,
  InsurancePremiumsType,
  ListOfLiabilitiesType,
  LiabilitiesListingType,
  ListOfPropertiesType,
  PropertyType,
  AttachedFormsType,
} from './types'
import { formatMoneyType2 } from './validator'

/**
 * Generates XML string from eCH-0119 message structure
 */
export function generateECH0119XML(message: ECH0119Message): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
  
  // Root element with namespaces
  const messageEl = root
    .ele('message', {
      xmlns: 'http://www.ech.ch/xmlns/eCH-0119/4',
      'xmlns:eCH-0007f': 'http://www.ech.ch/xmlns/eCH-0007-f/6',
      'xmlns:eCH-0011f': 'http://www.ech.ch/xmlns/eCH-0011-f/8',
      'xmlns:eCH-0044f': 'http://www.ech.ch/xmlns/eCH-0044-f/4',
      'xmlns:eCH-0046f': 'http://www.ech.ch/xmlns/eCH-0046-f/5',
      'xmlns:eCH-0097': 'http://www.ech.ch/xmlns/eCH-0097/5',
      minorVersion: message['@minorVersion'].toString(),
    })
  
  // Header
  buildHeader(messageEl, message.header)
  
  // Content
  buildContent(messageEl, message.content)
  
  // Generate XML string with pretty formatting
  return root.end({ prettyPrint: true })
}

/**
 * Builds header element
 */
function buildHeader(parent: any, header: ECH0119Header): void {
  const headerEl = parent.ele('header')
  
  if (header.taxPeriod) {
    headerEl.ele('taxPeriod').txt(header.taxPeriod)
  }
  
  if (header.source !== undefined) {
    headerEl.ele('source').txt(header.source.toString())
  }
  
  if (header.canton) {
    headerEl.ele('canton').txt(header.canton)
  }
  
  if (header.transactionDate) {
    headerEl.ele('transactionDate').txt(header.transactionDate)
  }
  
  if (header.sourceDescription) {
    headerEl.ele('sourceDescription').txt(header.sourceDescription)
  }
  
  if (header.periodFrom) {
    headerEl.ele('periodFrom').txt(header.periodFrom)
  }
  
  if (header.periodTo) {
    headerEl.ele('periodTo').txt(header.periodTo)
  }
  
  if (header.transactionNumber) {
    headerEl.ele('transactionNumber').txt(header.transactionNumber)
  }
  
  // Canton Extension (ZH-spezifische Erweiterungen wie documentList)
  if (header.cantonExtension) {
    buildCantonExtension(headerEl, header.cantonExtension)
  }
}

/**
 * Builds canton extension element (ZH-spezifische Erweiterungen)
 */
function buildCantonExtension(parent: any, extension: any): void {
  const extensionEl = parent.ele('cantonExtension')
  
  // Canton code
  if (extension.canton) {
    extensionEl.ele('canton').txt(extension.canton)
  }
  
  // Document List (ZH-spezifisch)
  if (extension.documentList && Array.isArray(extension.documentList)) {
    extension.documentList.forEach((doc: any) => {
      const docEl = extensionEl.ele('documentList')
      
      if (doc.documentIdentification) {
        const docIdEl = docEl.ele('documentIdentification')
        if (doc.documentIdentification.documentCanton) {
          docIdEl.ele('documentCanton').txt(doc.documentIdentification.documentCanton)
        }
        if (doc.documentIdentification.documentType) {
          docIdEl.ele('documentType').txt(doc.documentIdentification.documentType)
        }
      }
      
      if (doc.attachmentFile && Array.isArray(doc.attachmentFile)) {
        doc.attachmentFile.forEach((file: any) => {
          const fileEl = docEl.ele('attachmentFile')
          if (file.pathFileName) {
            fileEl.ele('pathFileName').txt(file.pathFileName)
          }
          if (file.internalSortOrder !== undefined) {
            fileEl.ele('internalSortOrder').txt(file.internalSortOrder.toString())
          }
        })
      }
    })
  }
}

/**
 * Builds content element
 * Reihenfolge gemäss XSD: mainForm, listOfSecurities, listOfLiabilities, qualifiedInvestments, jobExpenses, insurancePremiums, etc.
 */
function buildContent(parent: any, content: ContentType): void {
  const contentEl = parent.ele('content')
  
  // 1. mainForm (zuerst)
  if (content.mainForm) {
    buildMainForm(contentEl, content.mainForm)
  }
  
  // 2. listOfSecurities (wenn vorhanden)
  if (content.listOfSecurities) {
    buildListOfSecurities(contentEl, content.listOfSecurities)
  }
  
  // 3. listOfLiabilities (Schulden)
  if (content.listOfLiabilities) {
    buildListOfLiabilities(contentEl, content.listOfLiabilities)
  }
  
  // 4. listOfProperties (Liegenschaftenverzeichnis)
  if (content.listOfProperties) {
    buildListOfProperties(contentEl, content.listOfProperties)
  }
  
  // 5. jobExpenses (Berufsauslagen mit Zwischenwerten)
  if (content.jobExpenses) {
    buildJobExpenses(contentEl, content.jobExpenses)
  }
  
  // 6. insurancePremiums (Versicherungsprämien mit Zwischenwerten)
  if (content.insurancePremiums) {
    buildInsurancePremiums(contentEl, content.insurancePremiums)
  }
}

/**
 * Builds main form element
 */
function buildMainForm(parent: any, mainForm: MainFormType): void {
  const mainFormEl = parent.ele('mainForm')
  
  // Person Data Partner 1 (required)
  buildPersonDataPartner1(mainFormEl, mainForm.personDataPartner1)
  
  // Revenue
  if (mainForm.revenue) {
    buildRevenue(mainFormEl, mainForm.revenue)
  }
  
  // Deduction
  if (mainForm.deduction) {
    buildDeduction(mainFormEl, mainForm.deduction)
  }
  
  // Revenue Calculation
  if (mainForm.revenueCalculation) {
    buildRevenueCalculation(mainFormEl, mainForm.revenueCalculation)
  }
  
  // Asset
  if (mainForm.asset) {
    buildAsset(mainFormEl, mainForm.asset)
  }
  
  // Attached Forms (z.B. attachedColumn3a für 3a-Beleg)
  if (mainForm.attachedForms) {
    buildAttachedForms(mainFormEl, mainForm.attachedForms)
  }
}

/**
 * Builds attached forms element
 */
function buildAttachedForms(parent: any, attachedForms: AttachedFormsType): void {
  const attachedFormsEl = parent.ele('attachedForms')
  
  if (attachedForms.attachedColumn3a !== undefined) {
    attachedFormsEl.ele('attachedColumn3a').txt(attachedForms.attachedColumn3a.toString())
  }
  
  if (attachedForms.attachedWageStatement !== undefined) {
    attachedFormsEl.ele('attachedWageStatement').txt(attachedForms.attachedWageStatement.toString())
  }
  
  if (attachedForms.attachedListOfAssets !== undefined) {
    attachedFormsEl.ele('attachedListOfAssets').txt(attachedForms.attachedListOfAssets.toString())
  }
  
  if (attachedForms.attachedExpenses !== undefined) {
    attachedFormsEl.ele('attachedExpenses').txt(attachedForms.attachedExpenses.toString())
  }
}

/**
 * Builds person data partner 1 element
 */
function buildPersonDataPartner1(parent: any, personData: PersonDataPartner1): void {
  const personDataEl = parent.ele('personDataPartner1')
  
  // Partner Person Identification (required)
  const identificationEl = personDataEl.ele('partnerPersonIdentification')
  identificationEl.ele('officialName').txt(personData.partnerPersonIdentification.officialName)
  identificationEl.ele('firstName').txt(personData.partnerPersonIdentification.firstName)

  // IMPORTANT: element order must match XSD sequence:
  // cantonExtension?, officialName, firstName, sex?, dateOfBirth?, vn, otherPersonId*
  if (personData.partnerPersonIdentification.sex !== undefined) {
    identificationEl.ele('sex').txt(personData.partnerPersonIdentification.sex.toString())
  }

  if (personData.partnerPersonIdentification.dateOfBirth) {
    identificationEl.ele('dateOfBirth').txt(personData.partnerPersonIdentification.dateOfBirth)
  }

  identificationEl.ele('vn').txt(personData.partnerPersonIdentification.vn)
  
  // Address Information
  if (personData.addressInformation) {
    buildAddress(personDataEl, personData.addressInformation)
  }
  
  // Marital Status
  if (personData.maritalStatusTax !== undefined) {
    personDataEl.ele('maritalStatusTax').txt(personData.maritalStatusTax.toString())
  }
  
  // Religion
  if (personData.religion !== undefined) {
    personDataEl.ele('religion').txt(personData.religion.toString())
  }
  
  // Job
  if (personData.job) {
    personDataEl.ele('job').txt(personData.job)
  }
  
  // Employer
  if (personData.employer) {
    personDataEl.ele('employer').txt(personData.employer)
  }
  
  // Place of Work
  if (personData.placeOfWork) {
    personDataEl.ele('placeOfWork').txt(personData.placeOfWork)
  }
  
  // Phone Number Private
  if (personData.phoneNumberPrivate) {
    const phoneEl = personDataEl.ele('phoneNumberPrivate')
    if (personData.phoneNumberPrivate.phoneNumber) {
      phoneEl.ele('phoneNumber').txt(personData.phoneNumberPrivate.phoneNumber)
    }
  }
  
  // Phone Number Business
  if (personData.phoneNumberBusiness) {
    const phoneEl = personDataEl.ele('phoneNumberBusiness')
    if (personData.phoneNumberBusiness.phoneNumber) {
      phoneEl.ele('phoneNumber').txt(personData.phoneNumberBusiness.phoneNumber)
    }
  }
  
  // Payment Pension
  if (personData.paymentPension !== undefined) {
    personDataEl.ele('paymentPension').txt(personData.paymentPension.toString())
  }
  
  // Tax Municipality
  if (personData.taxMunicipality) {
    buildSwissMunicipality(personDataEl, personData.taxMunicipality, 'taxMunicipality')
  }
}

/**
 * Builds address element
 */
function buildAddress(parent: any, address: AddressType, elementName: string = 'addressInformation'): void {
  const addressEl = parent.ele(elementName)
  
  if (address.street) {
    addressEl.ele('street').txt(address.street)
  }
  
  if (address.houseNumber) {
    addressEl.ele('houseNumber').txt(address.houseNumber)
  }
  
  if (address.town) {
    addressEl.ele('town').txt(address.town)
  }
  
  if (address.swissZipCode) {
    addressEl.ele('swissZipCode').txt(address.swissZipCode)
  }
  
  if (address.country) {
    addressEl.ele('country').txt(address.country)
  }
}

/**
 * Builds Swiss municipality element
 */
function buildSwissMunicipality(parent: any, municipality: SwissMunicipalityType, elementName: string): void {
  const municipalityEl = parent.ele(elementName)
  
  if (municipality.municipalityId !== undefined) {
    municipalityEl.ele('municipalityId').txt(municipality.municipalityId.toString())
  }
  
  if (municipality.municipalityName) {
    municipalityEl.ele('municipalityName').txt(municipality.municipalityName)
  }
  
  if (municipality.cantonAbbreviation) {
    municipalityEl.ele('cantonAbbreviation').txt(municipality.cantonAbbreviation)
  }
}

/**
 * Builds revenue element
 */
function buildRevenue(parent: any, revenue: RevenueType): void {
  const revenueEl = parent.ele('revenue')
  
  // Employed Main Revenue
  if (revenue.employedMainRevenue) {
    buildPartnerAmount(revenueEl, revenue.employedMainRevenue, 'employedMainRevenue')
  }
  
  // Securities Revenue
  if (revenue.securitiesRevenue) {
    buildTaxAmount(revenueEl, revenue.securitiesRevenue, 'securitiesRevenue')
  }
  
  // Property Notional Rental Value (Eigenmietwert) - BRUTTO
  if (revenue.propertyNotionalRentalValue !== undefined) {
    revenueEl.ele('propertyNotionalRentalValue').txt(revenue.propertyNotionalRentalValue.toString())
  }
  
  // Property Revenue Gross (Brutto)
  if (revenue.propertyRevenueGross !== undefined) {
    revenueEl.ele('propertyRevenueGross').txt(revenue.propertyRevenueGross.toString())
  }
  
  // Property Deduction Flatrate (Pauschalabzug 20%)
  if (revenue.propertyDeductionFlatrate !== undefined) {
    revenueEl.ele('propertyDeductionFlatrate').txt(revenue.propertyDeductionFlatrate.toString())
  }
  
  // Property Remaining Revenue (Netto nach Abzug)
  if (revenue.propertyRemainingRevenue !== undefined) {
    revenueEl.ele('propertyRemainingRevenue').txt(revenue.propertyRemainingRevenue.toString())
  }
  
  // Total Amount Revenue
  if (revenue.totalAmountRevenue) {
    buildTaxAmount(revenueEl, revenue.totalAmountRevenue, 'totalAmountRevenue')
  }
}

/**
 * Builds deduction element
 */
function buildDeduction(parent: any, deduction: DeductionType): void {
  const deductionEl = parent.ele('deduction')
  
  // Job Expenses Partner 1
  if (deduction.jobExpensesPartner1) {
    buildTaxAmount(deductionEl, deduction.jobExpensesPartner1, 'jobExpensesPartner1')
  }
  
  // Provision 3a Partner 1
  if (deduction.provision3aPartner1Deduction) {
    buildTaxAmount(deductionEl, deduction.provision3aPartner1Deduction, 'provision3aPartner1Deduction')
  }
  
  // Insurance and Interest
  if (deduction.insuranceAndInterest) {
    buildTaxAmount(deductionEl, deduction.insuranceAndInterest, 'insuranceAndInterest')
  }
  
  // Amount Liabilities Interest (Schuldzinsen)
  if (deduction.amountLiabilitiesInterest) {
    buildTaxAmount(deductionEl, deduction.amountLiabilitiesInterest, 'amountLiabilitiesInterest')
  }
  
  // Further Deduction: Job-Oriented Further Education Cost
  if (deduction.furtherDeductionJobOrientedFurtherEducationCost) {
    buildTaxAmount(
      deductionEl,
      deduction.furtherDeductionJobOrientedFurtherEducationCost,
      'furtherDeductionJobOrientedFurtherEducationCost',
    )
  }

  // Payment Pension Deduction
  if (deduction.paymentPensionDeduction) {
    buildTaxAmount(deductionEl, deduction.paymentPensionDeduction, 'paymentPensionDeduction')
  }

  // Further Deduction Provision (AHV/IV Säule 2)
  if (deduction.furtherDeductionProvision) {
    buildTaxAmount(deductionEl, deduction.furtherDeductionProvision, 'furtherDeductionProvision')
  }

  // Payment Alimony Child
  if (deduction.paymentAlimonyChild) {
    buildTaxAmount(deductionEl, deduction.paymentAlimonyChild, 'paymentAlimonyChild')
  }
  
  // Total Amount Deduction
  if (deduction.totalAmountDeduction) {
    buildTaxAmount(deductionEl, deduction.totalAmountDeduction, 'totalAmountDeduction')
  }
  
  // Provision 3a Effective
  if (deduction.provision3aPartner1Effective !== undefined) {
    deductionEl.ele('provision3aPartner1Effective').txt(deduction.provision3aPartner1Effective.toString())
  }

  // Payment Pension Total
  if (deduction.paymentPensionTotal !== undefined) {
    deductionEl.ele('paymentPensionTotal').txt(deduction.paymentPensionTotal.toString())
  }
}

/**
 * Builds revenue calculation element
 */
function buildRevenueCalculation(parent: any, revenueCalc: RevenueCalculationType): void {
  const revenueCalcEl = parent.ele('revenueCalculation')
  
  // Total Amount Revenue
  if (revenueCalc.totalAmountRevenue) {
    buildTaxAmount(revenueCalcEl, revenueCalc.totalAmountRevenue, 'totalAmountRevenue')
  }
  
  // Total Amount Deduction
  if (revenueCalc.totalAmountDeduction) {
    buildTaxAmount(revenueCalcEl, revenueCalc.totalAmountDeduction, 'totalAmountDeduction')
  }
  
  // Net Income
  if (revenueCalc.netIncome) {
    buildTaxAmount(revenueCalcEl, revenueCalc.netIncome, 'netIncome')
  }
  
  // Deduction Charity
  if (revenueCalc.deductionCharity) {
    buildTaxAmount(revenueCalcEl, revenueCalc.deductionCharity, 'deductionCharity')
  }
  
  // Adjusted Net Income
  if (revenueCalc.adjustedNetIncome) {
    buildTaxAmount(revenueCalcEl, revenueCalc.adjustedNetIncome, 'adjustedNetIncome')
  }

  // Social Deduction Home Child
  if (revenueCalc.socialDeductionHomeChild) {
    buildTaxAmount(revenueCalcEl, revenueCalc.socialDeductionHomeChild, 'socialDeductionHomeChild')
  }

  // Social Deduction External Child
  if (revenueCalc.socialDeductionExternalChild) {
    buildTaxAmount(revenueCalcEl, revenueCalc.socialDeductionExternalChild, 'socialDeductionExternalChild')
  }
  
  // Total Amount Fiscal Revenue
  if (revenueCalc.totalAmountFiscalRevenue) {
    buildTaxAmount(revenueCalcEl, revenueCalc.totalAmountFiscalRevenue, 'totalAmountFiscalRevenue')
  }
}

/**
 * Builds asset element
 */
function buildAsset(parent: any, asset: AssetType): void {
  const assetEl = parent.ele('asset')
  
  // Movable Property Cash Value
  if (asset.movablePropertyCashValue) {
    buildPrivateBusiness(assetEl, asset.movablePropertyCashValue, 'movablePropertyCashValue')
  }
  
  // Movable Property Securities and Assets
  if (asset.movablePropertySecuritiesAndAssets) {
    buildPrivateBusiness(assetEl, asset.movablePropertySecuritiesAndAssets, 'movablePropertySecuritiesAndAssets')
  }

  // Movable Property Heritage Etc (Edelmetalle)
  if (asset.movablePropertyHeritageEtc) {
    buildPrivateBusiness(assetEl, asset.movablePropertyHeritageEtc, 'movablePropertyHeritageEtc')
  }

  // Movable Property Vehicle
  if (asset.movablePropertyVehicle) {
    buildPrivateBusiness(assetEl, asset.movablePropertyVehicle, 'movablePropertyVehicle')
  }
  
  // Property House or Flat (Liegenschaften)
  if (asset.propertyHouseOrFlat) {
    buildPrivateBusiness(assetEl, asset.propertyHouseOrFlat, 'propertyHouseOrFlat')
  }

  // Vehicle Details
  if (asset.moveablePropertyVehicleDescription) {
    assetEl.ele('moveablePropertyVehicleDescription').txt(asset.moveablePropertyVehicleDescription)
  }

  if (asset.moveablePropertyVehiclePurchasePrice !== undefined) {
    assetEl.ele('moveablePropertyVehiclePurchasePrice').txt(asset.moveablePropertyVehiclePurchasePrice.toString())
  }

  if (asset.moveablePropertyVehicleYear) {
    assetEl.ele('moveablePropertyVehicleYear').txt(asset.moveablePropertyVehicleYear)
  }
  
  // Total Amount Assets
  if (asset.totalAmountAssets) {
    buildPrivateBusiness(assetEl, asset.totalAmountAssets, 'totalAmountAssets')
  }
  
  // Total Amount Fiscal Assets
  if (asset.totalAmountFiscalAssets) {
    buildPrivateBusiness(assetEl, asset.totalAmountFiscalAssets, 'totalAmountFiscalAssets')
  }
}

/**
 * Builds list of securities element
 */
function buildListOfSecurities(parent: any, listOfSecurities: ListOfSecuritiesType): void {
  const listEl = parent.ele('listOfSecurities')
  
  // Bank Account
  if (listOfSecurities.bankAccount) {
    const bankEl = listEl.ele('bankAccount')
    if (listOfSecurities.bankAccount.ibanNumber) {
      bankEl.ele('ibanNumber').txt(listOfSecurities.bankAccount.ibanNumber)
    }
    if (listOfSecurities.bankAccount.bankAccountNumber) {
      bankEl.ele('bankAccountNumber').txt(listOfSecurities.bankAccount.bankAccountNumber)
    }
    if (listOfSecurities.bankAccount.bankName) {
      bankEl.ele('bankName').txt(listOfSecurities.bankAccount.bankName)
    }
    if (listOfSecurities.bankAccount.accountOwner) {
      bankEl.ele('accountOwner').txt(listOfSecurities.bankAccount.accountOwner)
    }
  }
  
  // Security Entries
  if (listOfSecurities.securityEntry && listOfSecurities.securityEntry.length > 0) {
    listOfSecurities.securityEntry.forEach((entry) => {
      buildSecurityEntry(listEl, entry)
    })
  }
  
  // Total Tax Value
  if (listOfSecurities.totalTaxValue) {
    buildTaxAmount(listEl, listOfSecurities.totalTaxValue, 'totalTaxValue')
  }
  
  // Total Gross Revenue
  if (listOfSecurities.totalGrossRevenue) {
    buildTaxAmount(listEl, listOfSecurities.totalGrossRevenue, 'totalGrossRevenue')
  }
  
  // Withholding Tax (Verrechnungssteuer) - moneyType2 (Decimal)
  if (listOfSecurities.withholdingTax !== undefined) {
    const withholdingTaxFormatted = formatMoneyType2(listOfSecurities.withholdingTax)
    if (withholdingTaxFormatted !== undefined) {
      listEl.ele('withholdingTax').txt(withholdingTaxFormatted.toString())
    }
  }
}

/**
 * Builds security entry element
 */
function buildSecurityEntry(parent: any, entry: SecurityEntryType): void {
  const entryEl = parent.ele('securityEntry')
  
  if (entry.code) {
    entryEl.ele('code').txt(entry.code)
  }
  if (entry.originalCurrency) {
    entryEl.ele('originalCurrency').txt(entry.originalCurrency)
  }
  if (entry.faceValueQuantity !== undefined) {
    entryEl.ele('faceValueQuantity').txt(entry.faceValueQuantity.toString())
  }
  if (entry.securitiesNumber) {
    entryEl.ele('securitiesNumber').txt(entry.securitiesNumber)
  }
  if (entry.detailedDescription) {
    entryEl.ele('detailedDescription').txt(entry.detailedDescription)
  }
  if (entry.countryOfDepositaryBank) {
    entryEl.ele('countryOfDepositaryBank').txt(entry.countryOfDepositaryBank)
  }
  if (entry.taxValueEndOfYear) {
    buildTaxAmount(entryEl, entry.taxValueEndOfYear, 'taxValueEndOfYear')
  }
  if (entry.grossRevenueA) {
    buildTaxAmount(entryEl, entry.grossRevenueA, 'grossRevenueA')
  }
  if (entry.grossRevenueB) {
    buildTaxAmount(entryEl, entry.grossRevenueB, 'grossRevenueB')
  }
}

/**
 * Builds partner amount element
 */
function buildPartnerAmount(parent: any, amount: PartnerAmountType, elementName: string): void {
  const amountEl = parent.ele(elementName)
  
  if (amount.partner1Amount !== undefined) {
    amountEl.ele('partner1Amount').txt(amount.partner1Amount.toString())
  }
  
  if (amount.partner2Amount !== undefined) {
    amountEl.ele('partner2Amount').txt(amount.partner2Amount.toString())
  }
}

/**
 * Builds tax amount element (cantonal + federal)
 */
function buildTaxAmount(parent: any, amount: TaxAmountType, elementName: string): void {
  const amountEl = parent.ele(elementName)
  
  if (amount.cantonalTax !== undefined) {
    amountEl.ele('cantonalTax').txt(amount.cantonalTax.toString())
  }
  
  if (amount.federalTax !== undefined) {
    amountEl.ele('federalTax').txt(amount.federalTax.toString())
  }
}

/**
 * Builds private/business type element
 */
function buildPrivateBusiness(parent: any, business: PrivateBusinessType, elementName: string): void {
  const businessEl = parent.ele(elementName)
  
  if (business.fiscalValue !== undefined) {
    businessEl.ele('fiscalValue').txt(business.fiscalValue.toString())
  }
  
  if (business.businessPortion !== undefined) {
    businessEl.ele('businessPortion').txt(business.businessPortion.toString())
  }
}

/**
 * Builds job expenses element with intermediate values
 */
function buildJobExpenses(parent: any, jobExpenses: JobExpensesFormType): void {
  const jobExpensesEl = parent.ele('jobExpenses')
  
  if (jobExpenses.jobExpensePartner1) {
    buildJobExpenseType(jobExpensesEl, jobExpenses.jobExpensePartner1, 'jobExpensePartner1')
  }
  
  if (jobExpenses.jobExpensePartner2) {
    buildJobExpenseType(jobExpensesEl, jobExpenses.jobExpensePartner2, 'jobExpensePartner2')
  }
}

/**
 * Builds job expense type element
 */
function buildJobExpenseType(parent: any, jobExpense: JobExpensesType, elementName: string): void {
  const jobExpenseEl = parent.ele(elementName)
  
  // Fahrtkosten: ÖV
  if (jobExpense.ticketCostPublicTransport) {
    buildTaxAmount(jobExpenseEl, jobExpense.ticketCostPublicTransport, 'ticketCostPublicTransport')
  }
  
  // Fahrtkosten: Velo
  if (jobExpense.bicycleOrSmallMotorbike) {
    buildTaxAmount(jobExpenseEl, jobExpense.bicycleOrSmallMotorbike, 'bicycleOrSmallMotorbike')
  }
  
  // Fahrtkosten: Total (subtotalVehicle)
  if (jobExpense.subtotalVehicle) {
    buildTaxAmount(jobExpenseEl, jobExpense.subtotalVehicle, 'subtotalVehicle')
  }
  
  // Verpflegung: Nicht verbilligt
  if (jobExpense.cateringNonSubsidized) {
    buildTaxAmount(jobExpenseEl, jobExpense.cateringNonSubsidized, 'cateringNonSubsidized')
  }
  
  // Verpflegung: Verbilligt
  if (jobExpense.cateringSubsidized) {
    buildTaxAmount(jobExpenseEl, jobExpense.cateringSubsidized, 'cateringSubsidized')
  }
  
  // Verpflegung: Schichtarbeit
  if (jobExpense.cateringShiftWork) {
    buildTaxAmount(jobExpenseEl, jobExpense.cateringShiftWork, 'cateringShiftWork')
  }
  
  // Übrige Berufskosten (3% Pauschale)
  if (jobExpense.remainingJobCostFlatrate) {
    buildTaxAmount(jobExpenseEl, jobExpense.remainingJobCostFlatrate, 'remainingJobCostFlatrate')
  }
  
  // Total Berufsauslagen
  if (jobExpense.totalAmountJobExpenses) {
    buildTaxAmount(jobExpenseEl, jobExpense.totalAmountJobExpenses, 'totalAmountJobExpenses')
  }
}

/**
 * Builds insurance premiums element with intermediate values
 */
function buildInsurancePremiums(parent: any, insurance: InsurancePremiumsType): void {
  const insuranceEl = parent.ele('insurancePremiums')
  
  // Private Krankenversicherungsprämien
  if (insurance.privateHealthInsurance !== undefined) {
    insuranceEl.ele('privateHealthInsurance').txt(insurance.privateHealthInsurance.toString())
  }
  
  // Private Unfallversicherung
  if (insurance.privateAccidentInsurance !== undefined) {
    insuranceEl.ele('privateAccidentInsurance').txt(insurance.privateAccidentInsurance.toString())
  }
  
  // Zinsen von Sparkapitalien
  if (insurance.interestSavings !== undefined) {
    insuranceEl.ele('interestSavings').txt(insurance.interestSavings.toString())
  }
  
  // Zwischentotal
  if (insurance.subtotalAmount !== undefined) {
    insuranceEl.ele('subtotalAmount').txt(insurance.subtotalAmount.toString())
  }
  
  // Maximaler Abzug (B)
  if (insurance.deductionsPremiumsReduction !== undefined) {
    insuranceEl.ele('deductionsPremiumsReduction').txt(insurance.deductionsPremiumsReduction.toString())
  }
  
  // Total bezahlte Versicherungsprämien und Zinsen (A)
  if (insurance.paidInsuranceAndInterest !== undefined) {
    insuranceEl.ele('paidInsuranceAndInterest').txt(insurance.paidInsuranceAndInterest.toString())
  }
  
  // Finaler Abzug (C = niedrigerer von A und B)
  if (insurance.finalDeduction) {
    buildTaxAmount(insuranceEl, insurance.finalDeduction, 'finalDeduction')
  }
}

/**
 * Builds list of properties element (Liegenschaftenverzeichnis)
 */
function buildListOfProperties(parent: any, properties: ListOfPropertiesType): void {
  const propertiesEl = parent.ele('listOfProperties')
  
  // Individual properties
  if (properties.property && properties.property.length > 0) {
    for (const prop of properties.property) {
      const propEl = propertiesEl.ele('property')
      
      // Property Identification
      if (prop.propertyIdentification) {
        const identEl = propEl.ele('propertyIdentification')
        if (prop.propertyIdentification.street) {
          identEl.ele('street').txt(prop.propertyIdentification.street)
        }
        if (prop.propertyIdentification.houseNumber) {
          identEl.ele('houseNumber').txt(prop.propertyIdentification.houseNumber)
        }
        if (prop.propertyIdentification.town) {
          identEl.ele('town').txt(prop.propertyIdentification.town)
        }
        if (prop.propertyIdentification.swissZipCode) {
          identEl.ele('swissZipCode').txt(prop.propertyIdentification.swissZipCode.toString())
        }
        if (prop.propertyIdentification.canton) {
          identEl.ele('canton').txt(prop.propertyIdentification.canton)
        }
      }
      
      // Property Type
      if (prop.propertyType) {
        propEl.ele('propertyType').txt(prop.propertyType)
      }
      
      // Property Area
      if (prop.propertyArea !== undefined) {
        propEl.ele('propertyArea').txt(prop.propertyArea.toString())
      }
      
      // Property Land Area
      if (prop.propertyLandArea !== undefined) {
        propEl.ele('propertyLandArea').txt(prop.propertyLandArea.toString())
      }
      
      // Ownership Share
      if (prop.ownershipShare !== undefined) {
        propEl.ele('ownershipShare').txt(prop.ownershipShare.toString())
      }
      
      // Notional Rental Value (BRUTTO)
      if (prop.notionalRentalValue !== undefined) {
        propEl.ele('notionalRentalValue').txt(prop.notionalRentalValue.toString())
      }
      
      // Gross Revenue (BRUTTO)
      if (prop.grossRevenue !== undefined) {
        propEl.ele('grossRevenue').txt(prop.grossRevenue.toString())
      }
      
      // Maintenance Costs (Pauschalabzug)
      if (prop.maintenanceCosts !== undefined) {
        propEl.ele('maintenanceCosts').txt(prop.maintenanceCosts.toString())
      }
      
      // Total Property Costs
      if (prop.totalPropertyCosts !== undefined) {
        propEl.ele('totalPropertyCosts').txt(prop.totalPropertyCosts.toString())
      }
      
      // Net Property Revenue (NETTO)
      if (prop.netPropertyRevenue !== undefined) {
        propEl.ele('netPropertyRevenue').txt(prop.netPropertyRevenue.toString())
      }
      
      // Tax Value
      if (prop.taxValue !== undefined) {
        propEl.ele('taxValue').txt(prop.taxValue.toString())
      }
      
      // Market Value (optional)
      if (prop.marketValue !== undefined) {
        propEl.ele('marketValue').txt(prop.marketValue.toString())
      }
    }
  }
  
  // Totals
  if (properties.totalNotionalRentalValue !== undefined) {
    propertiesEl.ele('totalNotionalRentalValue').txt(properties.totalNotionalRentalValue.toString())
  }
  if (properties.totalMaintenanceCosts !== undefined) {
    propertiesEl.ele('totalMaintenanceCosts').txt(properties.totalMaintenanceCosts.toString())
  }
  if (properties.totalMortgageInterest !== undefined) {
    propertiesEl.ele('totalMortgageInterest').txt(properties.totalMortgageInterest.toString())
  }
  if (properties.totalPropertyCosts !== undefined) {
    propertiesEl.ele('totalPropertyCosts').txt(properties.totalPropertyCosts.toString())
  }
  if (properties.totalNetPropertyRevenue !== undefined) {
    propertiesEl.ele('totalNetPropertyRevenue').txt(properties.totalNetPropertyRevenue.toString())
  }
  if (properties.totalTaxValue !== undefined) {
    propertiesEl.ele('totalTaxValue').txt(properties.totalTaxValue.toString())
  }
}

/**
 * Builds list of liabilities element
 */
function buildListOfLiabilities(parent: any, liabilities: ListOfLiabilitiesType): void {
  const liabilitiesEl = parent.ele('listOfLiabilities')
  
  // Private Liabilities
  if (liabilities.privateLiabilities && liabilities.privateLiabilities.length > 0) {
    liabilities.privateLiabilities.forEach((liability) => {
      buildLiabilitiesListing(liabilitiesEl, liability, 'privateLiabilities')
    })
  }
  
  // Total Private Liabilities
  if (liabilities.totalPrivateLiabilities !== undefined) {
    liabilitiesEl.ele('totalPrivateLiabilities').txt(liabilities.totalPrivateLiabilities.toString())
  }
  
  // Total Private Liabilities Interest
  if (liabilities.totalPrivateLiabilitiesInterest !== undefined) {
    liabilitiesEl.ele('totalPrivateLiabilitiesInterest').txt(liabilities.totalPrivateLiabilitiesInterest.toString())
  }
  
  // Total Amount Liabilities
  if (liabilities.totalAmountLiabilities !== undefined) {
    liabilitiesEl.ele('totalAmountLiabilities').txt(liabilities.totalAmountLiabilities.toString())
  }
  
  // Total Amount Liabilities Interest
  if (liabilities.totalAmountLiabilitiesInterest !== undefined) {
    liabilitiesEl.ele('totalAmountLiabilitiesInterest').txt(liabilities.totalAmountLiabilitiesInterest.toString())
  }
}

/**
 * Builds liabilities listing element
 */
function buildLiabilitiesListing(parent: any, liability: LiabilitiesListingType, elementName: string): void {
  const liabilityEl = parent.ele(elementName)
  
  if (liability.creditor) {
    liabilityEl.ele('creditor').txt(liability.creditor)
  }
  
  if (liability.creditorAddress) {
    liabilityEl.ele('creditorAddress').txt(liability.creditorAddress)
  }
  
  if (liability.interestRate !== undefined) {
    liabilityEl.ele('interestRate').txt(liability.interestRate.toString())
  }
  
  if (liability.liabilityAmount !== undefined) {
    liabilityEl.ele('liabilityAmount').txt(liability.liabilityAmount.toString())
  }
  
  if (liability.interestAmount !== undefined) {
    liabilityEl.ele('interestAmount').txt(liability.interestAmount.toString())
  }
}

