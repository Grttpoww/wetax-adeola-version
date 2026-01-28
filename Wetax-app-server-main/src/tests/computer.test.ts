import { computeTaxReturn } from '../computer'
import { test, expect, describe, beforeAll } from '@jest/globals'
import taxReportData from './taxReport.json'
import { TaxReturnData } from '../types'
import { loadMunicipalityTaxRates } from '../data/municipalityTaxRates'
import { MunicipalityTaxRatesCache } from '../types'

describe('computeTaxReturn (Main Computer)', () => {
  let municipalityRatesCache: MunicipalityTaxRatesCache

  beforeAll(() => {
    municipalityRatesCache = loadMunicipalityTaxRates()
  })

  test('should compute all tax return calculations', () => {
    const result = computeTaxReturn(taxReportData as TaxReturnData, municipalityRatesCache)

    // Check that all required computed fields exist
    expect(result).toHaveProperty('totalEinkuenfte')
    expect(result).toHaveProperty('haupterwerb')
    expect(result).toHaveProperty('nebenerwerb')
    expect(result).toHaveProperty('totalAusbildungsKosten')
    expect(result).toHaveProperty('einkommenssteuerBund')
    expect(result).toHaveProperty('einkommenssteuerStaat')
    expect(result).toHaveProperty('vermoegenssteuerCalc')

    // Check that computed values are numbers
    expect(typeof result.totalEinkuenfte).toBe('number')
    expect(typeof result.haupterwerb).toBe('number')
    expect(typeof result.nebenerwerb).toBe('number')
    expect(typeof result.einkommenssteuerBund).toBe('number')
    expect(typeof result.einkommenssteuerStaat).toBe('number')
    expect(typeof result.vermoegenssteuerCalc).toBe('number')
  })

  test('should calculate income correctly', () => {
    const result = computeTaxReturn(taxReportData as TaxReturnData, municipalityRatesCache)

    expect(result.totalEinkuenfte).toBeGreaterThan(0)
    expect(result.haupterwerb).toBeGreaterThan(0)
    expect(result.nebenerwerb).toBeGreaterThanOrEqual(0)
    expect(result.totalEinkuenfte).toBe(result.haupterwerb + (result.nebenerwerb || 0))
  })

  test('should calculate tax amounts correctly', () => {
    const result = computeTaxReturn(taxReportData as TaxReturnData, municipalityRatesCache)

    expect(result.einkommenssteuerBund).toBeGreaterThanOrEqual(0)
    expect(result.einkommenssteuerStaat).toBeGreaterThanOrEqual(0)
    expect(result.vermoegenssteuerCalc).toBeGreaterThanOrEqual(0)
  })

  test('should handle education costs calculation', () => {
    const result = computeTaxReturn(taxReportData as TaxReturnData, municipalityRatesCache)

    expect(result.totalAusbildungsKosten).toBeGreaterThanOrEqual(0)
    expect(result.selbstgetrageneKostenAusbildung).toBeGreaterThanOrEqual(0)
    expect(result.abzugAusbildungStaat).toBeGreaterThanOrEqual(0)
    expect(result.abzugAusbildungBund).toBeGreaterThanOrEqual(0)
  })
})
