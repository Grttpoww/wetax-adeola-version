import {
  einkommenssteuerBundCalc,
  calculateEinkommenssteuerStaat,
  calculateVermoegenssteuer,
} from '../computeTaxes'
import { test, expect, describe } from '@jest/globals'

describe('Tax Calculation Functions', () => {
  describe('einkommenssteuerBundCalc', () => {
    test('should return 0 for income <= 15000', () => {
      expect(einkommenssteuerBundCalc(10000)).toBe(0)
      expect(einkommenssteuerBundCalc(15000)).toBe(0)
    })

    test('should calculate correct tax for income between 15001-32800', () => {
      expect(einkommenssteuerBundCalc(20000)).toBeCloseTo(175.55, 2)
      expect(einkommenssteuerBundCalc(32800)).toBeCloseTo(274.11, 2)
    })

    test('should calculate correct tax for higher income brackets', () => {
      expect(einkommenssteuerBundCalc(50000)).toBeCloseTo(790.84, 2)
      expect(einkommenssteuerBundCalc(100000)).toBeCloseTo(4478.9, 2)
    })

    test('should handle edge cases', () => {
      expect(einkommenssteuerBundCalc(0)).toBe(0)
      expect(einkommenssteuerBundCalc(-1000)).toBe(0)
    })
  })

  describe('calculateEinkommenssteuerStaat', () => {
    test('should calculate state income tax for different religions', () => {
      const income = 50000
      const result = calculateEinkommenssteuerStaat(income, 'reformiert')
      expect(result).toBeGreaterThan(0)
    })

    test('should handle different religion multipliers', () => {
      const income = 50000
      const reformiert = calculateEinkommenssteuerStaat(income, 'reformiert')
      const catholic = calculateEinkommenssteuerStaat(income, 'roemischKatholisch')
      expect(reformiert).toBe(catholic) // Both should have same multiplier
    })
  })

  describe('calculateVermoegenssteuer', () => {
    test('should return 0 for wealth <= 77000', () => {
      expect(calculateVermoegenssteuer(50000)).toBe(0)
      expect(calculateVermoegenssteuer(77000)).toBe(0)
    })

    test('should calculate correct wealth tax for different brackets', () => {
      expect(calculateVermoegenssteuer(100000)).toBeCloseTo(11.5, 1)
      expect(calculateVermoegenssteuer(400000)).toBeCloseTo(207.5, 1)
      expect(calculateVermoegenssteuer(1000000)).toBeCloseTo(960.5, 1)
    })

    test('should handle very high wealth amounts', () => {
      expect(calculateVermoegenssteuer(6000000)).toBeCloseTo(10547, 0)
    })
  })
})
