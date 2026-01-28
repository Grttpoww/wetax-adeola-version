import fs from 'fs'
import path from 'path'
import { MunicipalityTaxRates, MunicipalityTaxRatesCache } from '../types'

let municipalityRatesCache: MunicipalityTaxRatesCache | null = null

/**
 * Parse a CSV row (semicolon-delimited, quoted strings)
 * Returns array of column values with quotes removed
 */
function parseCsvRow(row: string): string[] {
  const columns: string[] = []
  let currentColumn = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    const nextChar = row[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentColumn += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ';' && !inQuotes) {
      // End of column
      columns.push(currentColumn.trim())
      currentColumn = ''
    } else {
      currentColumn += char
    }
  }

  // Add last column
  columns.push(currentColumn.trim())

  return columns
}

/**
 * Parse a numeric value from CSV (handles empty strings as null)
 */
function parseNumericValue(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '""') {
    return null
  }
  const parsed = parseFloat(trimmed)
  return isNaN(parsed) ? null : parsed
}

/**
 * Parse definitiv flag: "1" = true, "" or anything else = false
 */
function parseDefinitivFlag(value: string): boolean {
  return value.trim() === '1'
}

/**
 * Load and parse municipality tax rates CSV file
 */
export function loadMunicipalityTaxRates(): MunicipalityTaxRatesCache {
  if (municipalityRatesCache) {
    return municipalityRatesCache // Already loaded
  }

  const csvPath = path.join(__dirname, 'Gemeindesteuerfuesse_2026.csv')

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Municipality tax rates CSV file not found: ${csvPath}`)
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row')
  }

  // Skip header row
  const headerRow = lines[0]
  const expectedColumns = [
    'BFS Nr.',
    'Gemeinde',
    '1. Gesamtsteuerfuss ohne Kirche (in Prozent)',
    '1. Gesamtsteuerfuss mit ref. Kirche (in Prozent)',
    '1. Gesamtsteuerfuss mit kath. Kirche (in Prozent)',
    '1. Gesamtsteuerfuss mit christkath. Kirche (in Prozent)',
    'Juristischer Steuerfuss',
    'Definitiv',
  ]

  // Validate header (basic check)
  const headerColumns = parseCsvRow(headerRow)
  if (headerColumns.length < expectedColumns.length) {
    console.warn(
      `CSV header has ${headerColumns.length} columns, expected at least ${expectedColumns.length}`,
    )
  }

  const cache = new Map<number, MunicipalityTaxRates>()
  let duplicateCount = 0

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
    if (!row.trim()) {
      continue // Skip empty rows
    }

    try {
      const columns = parseCsvRow(row)

      if (columns.length < 20) {
        console.warn(`Row ${i + 1} has ${columns.length} columns, expected 20, skipping`)
        continue
      }

      const bfsNumber = parseNumericValue(columns[0])
      if (bfsNumber === null) {
        console.warn(`Row ${i + 1}: Invalid BFS number, skipping`)
        continue
      }

      // Check for duplicates
      if (cache.has(bfsNumber)) {
        duplicateCount++
        console.warn(`Duplicate BFS number ${bfsNumber} found, using last occurrence`)
      }

      const municipality: MunicipalityTaxRates = {
        bfsNumber,
        name: columns[1].replace(/^"|"$/g, ''), // Remove surrounding quotes
        baseRateWithoutChurch: parseNumericValue(columns[2]), // Column 3: "1. Gesamtsteuerfuss ohne Kirche (in Prozent)"
        rateWithReformedChurch: parseNumericValue(columns[6]), // Column 7: "1. Gesamtsteuerfuss mit ref. Kirche (in Prozent)"
        rateWithCatholicChurch: parseNumericValue(columns[10]), // Column 11: "1. Gesamtsteuerfuss mit kath. Kirche (in Prozent)"
        rateWithChristCatholicChurch: parseNumericValue(columns[14]), // Column 15: "1. Gesamtsteuerfuss mit christkath. Kirche (in Prozent)"
        juristischerSteuerfuss: parseNumericValue(columns[18]), // Column 19: "Juristischer Steuerfuss"
        definitiv: parseDefinitivFlag(columns[19]), // Column 20: "Definitiv"
      }

      cache.set(bfsNumber, municipality)
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error)
      // Continue parsing other rows
    }
  }

  if (duplicateCount > 0) {
    console.warn(`Found ${duplicateCount} duplicate BFS numbers`)
  }

  console.log(`Loaded ${cache.size} municipalities from CSV`)

  municipalityRatesCache = cache
  return cache
}

/**
 * Get the municipality rates cache (must be loaded first)
 */
export function getMunicipalityRatesCache(): MunicipalityTaxRatesCache {
  if (!municipalityRatesCache) {
    throw new Error(
      'Municipality rates not loaded. Call loadMunicipalityTaxRates() first (typically at server startup).',
    )
  }
  return municipalityRatesCache
}

