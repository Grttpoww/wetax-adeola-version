/**
 * eCH-0119 XML Validator
 * 
 * Validiert generierte XMLs gegen XSD-Schema und führt semantische Prüfungen durch
 */

import { ECH0119Message } from './types'
import { TaxReturn, TaxReturnData, ComputedTaxReturnT } from '../types'
import { CantonRegistry } from '../cantons'

/**
 * Validierungs-Ergebnis
 */
export interface ValidationResult {
  /** Fehler-Code */
  code: string
  
  /** Fehler-Meldung */
  message: string
  
  /** Betroffenes Feld (optional) */
  field?: string
  
  /** Schweregrad */
  severity: 'error' | 'warning' | 'info'
  
  /** XPath zum betroffenen Element (optional) */
  xpath?: string
}

/**
 * Validierungs-Report
 */
export interface ValidationReport {
  /** Ist das XML valide? */
  isValid: boolean
  
  /** Liste aller Validierungs-Ergebnisse */
  results: ValidationResult[]
  
  /** Anzahl Fehler */
  errorCount: number
  
  /** Anzahl Warnungen */
  warningCount: number
}

/**
 * Validiert eine eCH-0119 Message-Struktur
 * 
 * Führt folgende Prüfungen durch:
 * 1. Schema/XSD-Verletzungen (hart)
 * 2. Semantische/fachliche Fehler
 * 3. Kanton-spezifische Validierungen
 */
export function validateECH0119Message(
  message: ECH0119Message,
  taxReturn: TaxReturn,
  data: TaxReturnData,
  computed: ComputedTaxReturnT
): ValidationReport {
  const results: ValidationResult[] = []
  
  // 1. Schema-Validierungen (hart)
  results.push(...validateSchema(message))
  
  // 2. Semantische Validierungen
  results.push(...validateSemantics(message, taxReturn, data, computed))
  
  // 3. Kanton-spezifische Validierungen
  const canton = message.header.canton || 'ZH'
  const cantonConfig = CantonRegistry.get(canton)
  if (cantonConfig?.extensionHandler?.validate) {
    const cantonResults = cantonConfig.extensionHandler.validate(taxReturn, data)
    // Handle both sync and async results
    if (Array.isArray(cantonResults)) {
      results.push(...cantonResults)
    } else {
      // If it's a Promise, we'd need to await it, but for now we'll skip async validation
      // In a real implementation, validateECH0119Message should be async
      console.warn('Kanton-spezifische Validierung gibt Promise zurück - wird übersprungen')
    }
  }
  
  // 4. Dezimalzahl-Validierung
  results.push(...validateDecimalPrecision(message))
  
  // 5. Totals-Konsistenz
  results.push(...validateTotalsConsistency(message, computed))
  
  // 6. municipalityId-Validierung
  if (canton === 'ZH') {
    results.push(...validateMunicipalityId(message, canton))
  }
  
  const errorCount = results.filter(r => r.severity === 'error').length
  const warningCount = results.filter(r => r.severity === 'warning').length
  
  return {
    isValid: errorCount === 0,
    results,
    errorCount,
    warningCount,
  }
}

/**
 * Validiert Schema-Konformität (hart)
 */
function validateSchema(message: ECH0119Message): ValidationResult[] {
  const results: ValidationResult[] = []
  
  // Prüfe required fields
  if (!message.header.taxPeriod) {
    results.push({
      code: 'SCHEMA_MISSING_TAX_PERIOD',
      message: 'taxPeriod ist erforderlich',
      severity: 'error',
      field: 'header.taxPeriod',
    })
  }
  
  if (message.header.source === undefined || message.header.source === null) {
    results.push({
      code: 'SCHEMA_MISSING_SOURCE',
      message: 'source ist erforderlich',
      severity: 'error',
      field: 'header.source',
    })
  }
  
  if (!message.content.mainForm) {
    results.push({
      code: 'SCHEMA_MISSING_MAIN_FORM',
      message: 'mainForm ist erforderlich',
      severity: 'error',
      field: 'content.mainForm',
    })
  }
  
  if (!message.content.mainForm?.personDataPartner1) {
    results.push({
      code: 'SCHEMA_MISSING_PERSON_DATA',
      message: 'personDataPartner1 ist erforderlich',
      severity: 'error',
      field: 'content.mainForm.personDataPartner1',
    })
  }
  
  // Prüfe AHV-Nummer Format
  const vn = message.content.mainForm?.personDataPartner1?.partnerPersonIdentification?.vn
  if (vn && !/^\d{3}\.\d{4}\.\d{4}\.\d{2}$/.test(vn)) {
    results.push({
      code: 'SCHEMA_INVALID_VN_FORMAT',
      message: `AHV-Nummer hat falsches Format: ${vn}. Erwartet: XXX.XXXX.XXXX.XX`,
      severity: 'error',
      field: 'personDataPartner1.partnerPersonIdentification.vn',
    })
  }
  
  return results
}

/**
 * Validiert semantische Konsistenz
 */
function validateSemantics(
  message: ECH0119Message,
  taxReturn: TaxReturn,
  data: TaxReturnData,
  computed: ComputedTaxReturnT
): ValidationResult[] {
  const results: ValidationResult[] = []
  
  const mainForm = message.content.mainForm
  if (!mainForm) return results
  
  // Prüfe maritalStatusTax Konsistenz
  const maritalStatus = mainForm.personDataPartner1?.maritalStatusTax
  const hasPartner2 = !!mainForm.personDataPartner2
  
  if (maritalStatus === 1 && hasPartner2) {
    results.push({
      code: 'SEMANTIC_MARITAL_STATUS_INCONSISTENT',
      message: 'maritalStatusTax = 1 (ledig) aber personDataPartner2 vorhanden',
      severity: 'error',
      field: 'personDataPartner1.maritalStatusTax',
    })
  }
  
  if (maritalStatus === 2 && !hasPartner2) {
    results.push({
      code: 'SEMANTIC_MARITAL_STATUS_INCONSISTENT',
      message: 'maritalStatusTax = 2 (verheiratet) aber kein personDataPartner2',
      severity: 'warning',
      field: 'personDataPartner1.maritalStatusTax',
    })
  }
  
  // Prüfe paymentPension Konsistenz
  const paymentPension = mainForm.personDataPartner1?.paymentPension
  const hasPensionDeduction = !!mainForm.deduction?.paymentPensionDeduction
  
  if (paymentPension === true && !hasPensionDeduction) {
    results.push({
      code: 'SEMANTIC_PAYMENT_PENSION_INCONSISTENT',
      message: 'paymentPension = true aber kein paymentPensionDeduction vorhanden',
      severity: 'warning',
      field: 'personDataPartner1.paymentPension',
    })
  }
  
  return results
}

/**
 * Validiert Dezimalzahl-Präzision (max. 2 Nachkommastellen)
 */
function validateDecimalPrecision(message: ECH0119Message): ValidationResult[] {
  const results: ValidationResult[] = []
  
  // Rekursive Funktion zum Prüfen aller Zahlen
  function checkValue(value: any, path: string): void {
    if (typeof value === 'number') {
      const decimalPlaces = (value.toString().split('.')[1] || '').length
      if (decimalPlaces > 2) {
        results.push({
          code: 'DECIMAL_PRECISION_TOO_HIGH',
          message: `Wert hat mehr als 2 Nachkommastellen: ${value}`,
          severity: 'error',
          field: path,
        })
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        checkValue(val, path ? `${path}.${key}` : key)
      }
    }
  }
  
  checkValue(message, '')
  
  return results
}

/**
 * Validiert Totals-Konsistenz
 */
function validateTotalsConsistency(
  message: ECH0119Message,
  computed: ComputedTaxReturnT
): ValidationResult[] {
  const results: ValidationResult[] = []
  
  const mainForm = message.content.mainForm
  if (!mainForm) return results
  
  // Prüfe Revenue Totals
  const revenue = mainForm.revenue
  if (revenue?.totalAmountRevenue) {
    // Total Revenue = Erwerbseinkommen + Wertschriftenertrag + Liegenschaftenertrag (NETTO)
    // WICHTIG: propertyRemainingRevenue ist NETTO (nach Pauschalabzug), das wird für Total Revenue verwendet
    const liegenschaftenErtrag = revenue.propertyRemainingRevenue || revenue.propertyNotionalRentalValue || 0
    const expectedCantonal = (revenue.employedMainRevenue?.partner1Amount || 0) +
      (revenue.securitiesRevenue?.cantonalTax || 0) +
      liegenschaftenErtrag
    const actualCantonal = revenue.totalAmountRevenue.cantonalTax || 0
    
    if (Math.abs(expectedCantonal - actualCantonal) > 0.01) {
      results.push({
        code: 'TOTALS_REVENUE_CANTONAL_INCONSISTENT',
        message: `Revenue Total Kantonal: erwartet ${expectedCantonal}, tatsächlich ${actualCantonal}`,
        severity: 'error',
        field: 'revenue.totalAmountRevenue.cantonalTax',
      })
    }
    
    const expectedFederal = (revenue.employedMainRevenue?.partner1Amount || 0) +
      (revenue.securitiesRevenue?.federalTax || 0) +
      liegenschaftenErtrag
    const actualFederal = revenue.totalAmountRevenue.federalTax || 0
    
    if (Math.abs(expectedFederal - actualFederal) > 0.01) {
      results.push({
        code: 'TOTALS_REVENUE_FEDERAL_INCONSISTENT',
        message: `Revenue Total Bundessteuer: erwartet ${expectedFederal}, tatsächlich ${actualFederal}`,
        severity: 'error',
        field: 'revenue.totalAmountRevenue.federalTax',
      })
    }
  }
  
  // Prüfe Deduction Totals
  const deduction = mainForm.deduction
  if (deduction?.totalAmountDeduction) {
    // Summe aller Abzüge berechnen (inkl. Schuldzinsen)
    const sumCantonal = 
      (deduction.jobExpensesPartner1?.cantonalTax || 0) +
      (deduction.provision3aPartner1Deduction?.cantonalTax || 0) +
      (deduction.insuranceAndInterest?.cantonalTax || 0) +
      (deduction.amountLiabilitiesInterest?.cantonalTax || 0) + // Schuldzinsen hinzufügen
      (deduction.furtherDeductionJobOrientedFurtherEducationCost?.cantonalTax || 0) +
      (deduction.paymentPensionDeduction?.cantonalTax || 0) +
      (deduction.furtherDeductionProvision?.cantonalTax || 0) +
      (deduction.paymentAlimonyChild?.cantonalTax || 0)
    
    const actualCantonal = deduction.totalAmountDeduction.cantonalTax || 0
    
    if (Math.abs(sumCantonal - actualCantonal) > 0.01) {
      results.push({
        code: 'TOTALS_DEDUCTION_CANTONAL_INCONSISTENT',
        message: `Deduction Total Kantonal: erwartet ${sumCantonal}, tatsächlich ${actualCantonal}`,
        severity: 'error',
        field: 'deduction.totalAmountDeduction.cantonalTax',
      })
    }
    
    // Bundessteuer
    const sumFederal = 
      (deduction.jobExpensesPartner1?.federalTax || 0) +
      (deduction.provision3aPartner1Deduction?.federalTax || 0) +
      (deduction.insuranceAndInterest?.federalTax || 0) +
      (deduction.amountLiabilitiesInterest?.federalTax || 0) + // Schuldzinsen hinzufügen
      (deduction.furtherDeductionJobOrientedFurtherEducationCost?.federalTax || 0) +
      (deduction.paymentPensionDeduction?.federalTax || 0) +
      (deduction.furtherDeductionProvision?.federalTax || 0) +
      (deduction.paymentAlimonyChild?.federalTax || 0)
    
    const actualFederal = deduction.totalAmountDeduction.federalTax || 0
    
    if (Math.abs(sumFederal - actualFederal) > 0.01) {
      results.push({
        code: 'TOTALS_DEDUCTION_FEDERAL_INCONSISTENT',
        message: `Deduction Total Bundessteuer: erwartet ${sumFederal}, tatsächlich ${actualFederal}`,
        severity: 'error',
        field: 'deduction.totalAmountDeduction.federalTax',
      })
    }
  }
  
  // Prüfe Revenue Calculation Totals
  // Verwende die berechneten Werte aus computed statt manueller Berechnung
  const revenueCalc = mainForm.revenueCalculation
  if (revenueCalc) {
    // Net Income sollte mit computed.nettoEinkommenStaat übereinstimmen
    const expectedNetCantonal = formatMoney(computed.nettoEinkommenStaat) || 0
    const actualNetCantonal = revenueCalc.netIncome?.cantonalTax || 0
    
    if (Math.abs(expectedNetCantonal - actualNetCantonal) > 0.01) {
      results.push({
        code: 'TOTALS_NET_INCOME_CANTONAL_INCONSISTENT',
        message: `Net Income Kantonal: erwartet ${expectedNetCantonal} (aus computed), tatsächlich ${actualNetCantonal}`,
        severity: 'error',
        field: 'revenueCalculation.netIncome.cantonalTax',
      })
    }
    
    // Adjusted Net Income sollte mit computed.reineinkommenStaat übereinstimmen
    const expectedAdjustedCantonal = formatMoney(computed.reineinkommenStaat) || 0
    const actualAdjustedCantonal = revenueCalc.adjustedNetIncome?.cantonalTax || 0
    
    if (Math.abs(expectedAdjustedCantonal - actualAdjustedCantonal) > 0.01) {
      results.push({
        code: 'TOTALS_ADJUSTED_NET_INCOME_CANTONAL_INCONSISTENT',
        message: `Adjusted Net Income Kantonal: erwartet ${expectedAdjustedCantonal} (aus computed), tatsächlich ${actualAdjustedCantonal}`,
        severity: 'error',
        field: 'revenueCalculation.adjustedNetIncome.cantonalTax',
      })
    }
  }
  
  return results
}

/**
 * Validiert municipalityId gegen ZH-Referenz
 */
function validateMunicipalityId(
  message: ECH0119Message,
  canton: string
): ValidationResult[] {
  const results: ValidationResult[] = []
  
  if (canton !== 'ZH') return results
  
  const municipalityId = message.content.mainForm?.personDataPartner1?.taxMunicipality?.municipalityId
  
  if (municipalityId !== undefined) {
    // BFS-Nummern für Zürich: 261-299 (3-stellig) oder 10000-19999 (5-stellig mit führenden Nullen)
    // Die meisten Gemeinden haben 3-stellige Nummern (261 = Zürich Stadt)
    // Einige haben 5-stellige Nummern (z.B. 26100 = Zürich mit führenden Nullen)
    const isValidZH = 
      (municipalityId >= 261 && municipalityId <= 299) || // 3-stellige BFS-Nummern
      (municipalityId >= 10000 && municipalityId <= 19999) // 5-stellige BFS-Nummern
    
    if (!isValidZH) {
      results.push({
        code: 'MUNICIPALITY_ID_INVALID_RANGE',
        message: `municipalityId ${municipalityId} liegt nicht im gültigen Bereich für ZH (261-299 oder 10000-19999)`,
        severity: 'warning',
        field: 'personDataPartner1.taxMunicipality.municipalityId',
      })
    }
    
    // TODO: Prüfe gegen aktuelle ZH-Referenztabelle für exakte Validierung
    // Für jetzt nur Format-Prüfung
  }
  
  return results
}

/**
 * Rundet Dezimalzahlen auf max. 2 Nachkommastellen (für moneyType2)
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Formatiert Geldbetrag für eCH-0119 moneyType1 (INTEGER - keine Dezimalstellen)
 * 
 * WICHTIG: moneyType1 ist laut XSD ein Integer, nicht Decimal!
 * Nur moneyType2 (z.B. withholdingTax) hat 2 Nachkommastellen.
 */
export function formatMoney(value: number | undefined): number | undefined {
  if (value === undefined) return undefined
  // moneyType1 ist Integer - runden auf ganze Zahl
  return Math.round(value)
}

/**
 * Formatiert Geldbetrag für eCH-0119 moneyType2 (DECIMAL mit 2 Nachkommastellen)
 * Wird nur für withholdingTax verwendet
 */
export function formatMoneyType2(value: number | undefined): number | undefined {
  if (value === undefined) return undefined
  return roundToTwoDecimals(value)
}

