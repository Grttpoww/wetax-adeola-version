import { computeTaxAmount } from '../computeTaxAmount'
import { test, expect, describe } from '@jest/globals'
import taxReportData from './taxReport.json'
import { TaxReturnData } from '../types'

describe('computeTaxAmount', () => {
  test('should calculate total income from existing test data', () => {
    const result = computeTaxAmount(taxReportData as TaxReturnData)
    expect(result.geldVerdient).toBeGreaterThan(0)
    expect(typeof result.geldVerdient).toBe('number')
  })

  test('should handle geldVerdient data with multiple income sources', () => {
    const testData = {
      ...taxReportData,
      geldVerdient: {
        start: true,
        data: [
          { nettolohn: 50000, arbeitgeber: 'Company A', arbeitsort: 'Zurich' },
          { nettolohn: 20000, arbeitgeber: 'Company B', arbeitsort: 'Basel' },
        ],
      },
    } as TaxReturnData

    const result = computeTaxAmount(testData)
    expect(result.geldVerdient).toBe(70000)
  })

  test('should handle undefined nettolohn values', () => {
    const testData = {
      ...taxReportData,
      geldVerdient: {
        start: true,
        data: [
          { nettolohn: undefined, arbeitgeber: 'Company A', arbeitsort: 'Zurich' },
          { nettolohn: 30000, arbeitgeber: 'Company B', arbeitsort: 'Basel' },
        ],
      },
    } as TaxReturnData

    const result = computeTaxAmount(testData)
    expect(result.geldVerdient).toBe(30000)
  })
})
