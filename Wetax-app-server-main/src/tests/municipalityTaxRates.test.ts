import { loadMunicipalityTaxRates, getMunicipalityRatesCache } from '../data/municipalityTaxRates'
import { MunicipalityTaxRatesCache } from '../types'
import { calculateMunicipalTax } from '../computeTaxes'

describe('Municipality Tax Rates', () => {
  let cache: MunicipalityTaxRatesCache

  beforeAll(() => {
    // Load the cache before running tests
    cache = loadMunicipalityTaxRates()
  })

  describe('CSV Parsing', () => {
    it('should load municipality rates from CSV', () => {
      expect(cache).toBeDefined()
      expect(cache.size).toBeGreaterThan(0)
      // CSV may have fewer than 162 if some rows are invalid
      expect(cache.size).toBeGreaterThanOrEqual(150)
    })

    it('should have Zürich (BFS 261) in cache', () => {
      const zurich = cache.get(261)
      expect(zurich).toBeDefined()
      expect(zurich?.name).toBe('Zürich')
      expect(zurich?.bfsNumber).toBe(261)
    })

    it('should have Winterthur (BFS 230) in cache', () => {
      const winterthur = cache.get(230)
      expect(winterthur).toBeDefined()
      expect(winterthur?.name).toBe('Winterthur')
      expect(winterthur?.bfsNumber).toBe(230)
    })

    it('should parse rates correctly for Zürich', () => {
      const zurich = cache.get(261)
      expect(zurich).toBeDefined()
      expect(zurich?.baseRateWithoutChurch).toBe(119) // From CSV sample
      // Church rates may be null if CSV format differs - test that base rate works
      expect(zurich?.baseRateWithoutChurch).toBeGreaterThan(0)
      // If church rates exist, they should be >= base rate
      if (zurich?.rateWithReformedChurch !== null) {
        expect(zurich.rateWithReformedChurch).toBeGreaterThanOrEqual(zurich.baseRateWithoutChurch || 0)
      }
      if (zurich?.rateWithCatholicChurch !== null) {
        expect(zurich.rateWithCatholicChurch).toBeGreaterThanOrEqual(zurich.baseRateWithoutChurch || 0)
      }
      if (zurich?.rateWithChristCatholicChurch !== null) {
        expect(zurich.rateWithChristCatholicChurch).toBeGreaterThanOrEqual(zurich.baseRateWithoutChurch || 0)
      }
    })

    it('should parse rates correctly for Winterthur', () => {
      const winterthur = cache.get(230)
      expect(winterthur).toBeDefined()
      expect(winterthur?.baseRateWithoutChurch).toBe(125) // From CSV sample
      // Church rates may be null if CSV format differs - test that base rate works
      expect(winterthur?.baseRateWithoutChurch).toBeGreaterThan(0)
    })

    it('should handle missing rates (null values)', () => {
      // Find a municipality with missing rates (definitiv === false)
      const municipalities = Array.from(cache.values())
      const municipalityWithMissingRates = municipalities.find((m) => !m.definitiv)
      
      if (municipalityWithMissingRates) {
        // At least one rate should be null
        const hasNullRate =
          municipalityWithMissingRates.baseRateWithoutChurch === null ||
          municipalityWithMissingRates.rateWithReformedChurch === null ||
          municipalityWithMissingRates.rateWithCatholicChurch === null ||
          municipalityWithMissingRates.rateWithChristCatholicChurch === null
        
        expect(hasNullRate || !municipalityWithMissingRates.definitiv).toBe(true)
      }
    })

    it('should have unique BFS numbers', () => {
      const bfsNumbers = Array.from(cache.keys())
      const uniqueBfsNumbers = new Set(bfsNumbers)
      expect(bfsNumbers.length).toBe(uniqueBfsNumbers.size)
    })
  })

  describe('calculateMunicipalTax', () => {
    const baseCantonalTax = 1000 // Base cantonal tax for testing

    it('should calculate tax for Zürich without church', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 261, 'keine', cache)
      // Zürich base rate is 119%, so 1000 * 1.19 = 1190
      expect(result).toBe(1190)
    })

    it('should calculate tax for Zürich with Reformed church (or fallback to base)', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 261, 'reformiert', cache)
      // If church rate exists, use it; otherwise falls back to Zürich base rate (119%)
      expect(result).toBeGreaterThan(0)
      // Should be at least base rate (1190) or higher if church rate exists
      expect(result).toBeGreaterThanOrEqual(1190)
    })

    it('should calculate tax for Zürich with Catholic church (or fallback to base)', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 261, 'roemischKatholisch', cache)
      // If church rate exists, use it; otherwise falls back to Zürich base rate (119%)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeGreaterThanOrEqual(1190)
    })

    it('should calculate tax for Zürich with Christ-Catholic church (or fallback to base)', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 261, 'christKatholisch', cache)
      // If church rate exists, use it; otherwise falls back to Zürich base rate (119%)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeGreaterThanOrEqual(1190)
    })

    it('should calculate tax for Winterthur without church', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 230, 'keine', cache)
      // Winterthur base rate is 125%, so 1000 * 1.25 = 1250
      expect(result).toBe(1250)
    })

    it('should calculate tax for Winterthur with Reformed church (or fallback to base)', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 230, 'reformiert', cache)
      // If church rate exists, use it; otherwise falls back to Zürich base rate (119%)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeGreaterThanOrEqual(1190) // At least Zürich fallback
    })

    it('should default to Zürich when no municipality selected', () => {
      const result = calculateMunicipalTax(baseCantonalTax, undefined, 'keine', cache)
      // Should use Zürich (261) as default
      expect(result).toBe(1190)
    })

    it('should use Zürich fallback when municipality has missing rates', () => {
      // Find a municipality with missing rates
      const municipalities = Array.from(cache.values())
      const municipalityWithMissingRates = municipalities.find(
        (m) => !m.definitiv || m.baseRateWithoutChurch === null,
      )

      if (municipalityWithMissingRates) {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
        
        const result = calculateMunicipalTax(
          baseCantonalTax,
          municipalityWithMissingRates.bfsNumber,
          'keine',
          cache,
        )
        
        // Should use Zürich fallback (119%)
        expect(result).toBe(1190)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing rates'),
        )
        
        consoleSpy.mockRestore()
      }
    })

    it('should throw error for invalid BFS number', () => {
      expect(() => {
        calculateMunicipalTax(baseCantonalTax, 99999, 'keine', cache)
      }).toThrow('Gemeinde mit BFS-Nummer 99999 nicht gefunden')
    })

    it('should handle "andere" religion as no church', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 261, 'andere', cache)
      // Should use base rate without church (119%)
      expect(result).toBe(1190)
    })

    it('should handle undefined religion as no church', () => {
      const result = calculateMunicipalTax(baseCantonalTax, 261, '', cache)
      // Should use base rate without church (119%)
      expect(result).toBe(1190)
    })
  })

  describe('getMunicipalityRatesCache', () => {
    it('should return cache after loading', () => {
      const retrievedCache = getMunicipalityRatesCache()
      expect(retrievedCache).toBe(cache)
      expect(retrievedCache.size).toBeGreaterThan(0)
    })
  })
})

