import { computeDeductible } from '../computeDeductible'
import { test, expect } from '@jest/globals'
import taxReportData from './taxReport.json'
import { TaxReturnData } from '../types'

test('compute the deductible tax amount', () => {
  const deductible = computeDeductible(taxReportData as TaxReturnData)
  expect(deductible.oevArbeit).toBe(500)
  expect(deductible.autoMotorradArbeitWege).toBe(700)
  expect(deductible.veloArbeit).toBe(700)
  expect(deductible.verpflegungAufArbeit).toBe(1500)
  expect(deductible.schichtarbeit).toBe(1500)
  expect(deductible.wochenaufenthalt).toBe(2000)
  expect(deductible.inAusbildung).toBe(500)
  expect(deductible.saeule3a).toBe(7056)
  expect(deductible.versicherungspraemie).toBe(1000)
  expect(deductible.privateUnfall).toBe(1000)
  expect(deductible.spenden).toBe(500)
})
