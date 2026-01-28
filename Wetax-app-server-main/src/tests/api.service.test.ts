import { jest } from '@jest/globals'
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { ObjectId } from 'mongodb'

// Mock dependencies
jest.mock('../db')
jest.mock('../jwt')
jest.mock('../twilio')
jest.mock('../api/openai')

import {
  formatNumberWithSpaces,
  formatNumberWithSpacesDecimal,
  formatTextWithSpaces,
  getTaxAmount,
} from '../api/api.service'
import { TaxReturn, User, TaxAmount } from '../types'
import taxReportData from './taxReport.json'
import { loadMunicipalityTaxRates } from '../data/municipalityTaxRates'
import { beforeAll } from '@jest/globals'

describe('API Service Functions', () => {
  beforeAll(() => {
    // Load municipality rates cache before running tests
    loadMunicipalityTaxRates()
  })
  describe('formatNumberWithSpaces', () => {
    test('should format numbers with spaces between digits', () => {
      expect(formatNumberWithSpaces(12345)).toBe('1 2 3 4 5')
      expect(formatNumberWithSpaces(100)).toBe('1 0 0')
      expect(formatNumberWithSpaces(0)).toBe('0')
    })

    test('should handle null and undefined', () => {
      expect(formatNumberWithSpaces(null as any)).toBe('')
      expect(formatNumberWithSpaces(undefined as any)).toBe('')
    })

    test('should round decimal numbers and format', () => {
      expect(formatNumberWithSpaces(123.45)).toBe('1 2 3')
      expect(formatNumberWithSpaces(123.67)).toBe('1 2 4')
    })
  })

  describe('formatNumberWithSpacesDecimal', () => {
    test('should format decimal numbers with spaces', () => {
      expect(formatNumberWithSpacesDecimal(12.34)).toBe('1 2 . 3 4')
      expect(formatNumberWithSpacesDecimal(0.5)).toBe('0 . 5 0')
    })

    test('should handle whole numbers', () => {
      expect(formatNumberWithSpacesDecimal(100)).toBe('1 0 0 . 0 0')
    })
  })

  describe('formatTextWithSpaces', () => {
    test('should format text with spaces between characters', () => {
      expect(formatTextWithSpaces('ABC')).toBe('A B C')
      expect(formatTextWithSpaces('Test123')).toBe('T e s t 1 2 3')
      expect(formatTextWithSpaces('')).toBe('')
    })

    test('should handle null and undefined', () => {
      expect(formatTextWithSpaces(null as any)).toBe('')
      expect(formatTextWithSpaces(undefined)).toBe('')
    })
  })

  describe('getTaxAmount', () => {
    test('should calculate tax amount correctly', () => {
      const mockTaxReturn: TaxReturn = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        year: 2023,
        data: taxReportData as any,
        archived: false,
        created: new Date(),
      }

      const mockInjected = {
        user: { _id: new ObjectId() } as unknown as User,
      }

      const result: TaxAmount = getTaxAmount(mockTaxReturn, mockInjected as any)

      expect(result).toHaveProperty('grossIncome')
      expect(result).toHaveProperty('deductableAmount')
      expect(result).toHaveProperty('taxableIncome')
      expect(result).toHaveProperty('totalTaxes')

      expect(typeof result.grossIncome).toBe('number')
      expect(typeof result.deductableAmount).toBe('number')
      expect(typeof result.taxableIncome).toBe('number')
      expect(typeof result.totalTaxes).toBe('number')

      expect(result.taxableIncome).toBe(result.grossIncome - result.deductableAmount)
    })
  })
})
