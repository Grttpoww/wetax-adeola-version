import {
  base64ToArrayBuffer,
  generateCode,
  calculateWorkingDays,
  calculateAnzahlArbeitstage,
} from '../util'
import { test, expect, describe } from '@jest/globals'

describe('Utility Functions', () => {
  describe('generateCode', () => {
    test('should generate code of specified length', () => {
      const code4 = generateCode(4)
      const code6 = generateCode(6)

      expect(code4).toHaveLength(4)
      expect(code6).toHaveLength(6)
      expect(Number(code4)).toBeGreaterThanOrEqual(1000)
      expect(Number(code4)).toBeLessThan(10000)
      expect(Number(code6)).toBeGreaterThanOrEqual(100000)
      expect(Number(code6)).toBeLessThan(1000000)
    })

    test('should generate different codes on multiple calls', () => {
      const codes = new Set()
      for (let i = 0; i < 10; i++) {
        codes.add(generateCode(4))
      }
      // With random generation, we should get mostly different codes
      expect(codes.size).toBeGreaterThan(1)
    })

    test('should handle edge cases', () => {
      const code1 = generateCode(1)
      expect(code1).toHaveLength(1)
      expect(Number(code1)).toBeGreaterThanOrEqual(1)
      expect(Number(code1)).toBeLessThan(10)
    })
  })

  describe('base64ToArrayBuffer', () => {
    test('should convert base64 string to ArrayBuffer', () => {
      const base64 = 'SGVsbG8gV29ybGQ=' // "Hello World" in base64
      const buffer = base64ToArrayBuffer(base64)

      expect(buffer).toBeInstanceOf(ArrayBuffer)
      expect(buffer.byteLength).toBe(11) // "Hello World" is 11 characters

      const uint8Array = new Uint8Array(buffer)
      const decoded = String.fromCharCode(...uint8Array)
      expect(decoded).toBe('Hello World')
    })

    test('should handle empty base64 string', () => {
      const buffer = base64ToArrayBuffer('')
      expect(buffer).toBeInstanceOf(ArrayBuffer)
      expect(buffer.byteLength).toBe(0)
    })

    test('should handle typical base64 patterns', () => {
      const base64 = 'dGVzdA==' // "test" in base64
      const buffer = base64ToArrayBuffer(base64)

      expect(buffer).toBeInstanceOf(ArrayBuffer)
      expect(buffer.byteLength).toBe(4)

      const uint8Array = new Uint8Array(buffer)
      const decoded = String.fromCharCode(...uint8Array)
      expect(decoded).toBe('test')
    })
  })

  describe('calculateWorkingDays', () => {
    test('should calculate working days between two dates (DD.MM.YYYY format)', () => {
      // 1 week: 01.01.2024 (Monday) to 07.01.2024 (Sunday) = 5 working days
      expect(calculateWorkingDays('01.01.2024', '07.01.2024')).toBe(5)
    })

    test('should calculate working days in YYYY.MM.DD format', () => {
      // Same week as above but in different format
      expect(calculateWorkingDays('2024.01.01', '2024.01.07')).toBe(5)
    })

    test('should exclude weekends', () => {
      // 06.01.2024 (Saturday) to 07.01.2024 (Sunday) = 0 working days
      expect(calculateWorkingDays('06.01.2024', '07.01.2024')).toBe(0)
    })

    test('should handle same day', () => {
      expect(calculateWorkingDays('01.01.2024', '01.01.2024')).toBe(1) // Monday
    })

    test('should handle multiple weeks', () => {
      // Full month of January 2024 has 23 working days
      expect(calculateWorkingDays('01.01.2024', '31.01.2024')).toBe(23)
    })

    test('should return 0 for invalid dates', () => {
      expect(calculateWorkingDays('invalid', 'dates')).toBe(0)
    })
  })

  describe('calculateAnzahlArbeitstage', () => {
    test('should calculate working days minus vacation days', () => {
      // 1 week (5 working days) - 2 vacation days = 3 working days
      expect(calculateAnzahlArbeitstage('01.01.2024', '07.01.2024', 2)).toBe(3)
    })

    test('should handle zero vacation days', () => {
      expect(calculateAnzahlArbeitstage('01.01.2024', '07.01.2024', 0)).toBe(5)
    })

    test('should handle undefined vacation days as zero', () => {
      expect(calculateAnzahlArbeitstage('01.01.2024', '07.01.2024', undefined)).toBe(5)
    })

    test('should not return negative values', () => {
      // More vacation days than working days should return 0
      expect(calculateAnzahlArbeitstage('01.01.2024', '07.01.2024', 10)).toBe(0)
    })

    test('should return undefined when von is missing', () => {
      expect(calculateAnzahlArbeitstage(undefined, '07.01.2024', 2)).toBeUndefined()
    })

    test('should return undefined when bis is missing', () => {
      expect(calculateAnzahlArbeitstage('01.01.2024', undefined, 2)).toBeUndefined()
    })

    test('should handle both date formats', () => {
      // DD.MM.YYYY format
      expect(calculateAnzahlArbeitstage('01.01.2024', '07.01.2024', 1)).toBe(4)
      // YYYY.MM.DD format
      expect(calculateAnzahlArbeitstage('2024.01.01', '2024.01.07', 1)).toBe(4)
    })
  })
})
