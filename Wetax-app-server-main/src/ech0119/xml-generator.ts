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
} from './types'

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
}

/**
 * Builds content element
 */
function buildContent(parent: any, content: ContentType): void {
  const contentEl = parent.ele('content')
  
  if (content.mainForm) {
    buildMainForm(contentEl, content.mainForm)
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
  identificationEl.ele('vn').txt(personData.partnerPersonIdentification.vn)
  
  if (personData.partnerPersonIdentification.dateOfBirth) {
    identificationEl.ele('dateOfBirth').txt(personData.partnerPersonIdentification.dateOfBirth)
  }
  
  if (personData.partnerPersonIdentification.sex !== undefined) {
    identificationEl.ele('sex').txt(personData.partnerPersonIdentification.sex.toString())
  }
  
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

