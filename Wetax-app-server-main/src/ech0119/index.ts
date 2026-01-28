/**
 * eCH-0119 XML Export
 * Main export function for generating eCH-0119 XML from WETAX data
 * 
 * Phase 1: P1 fields only
 */

import { TaxReturn, User, ComputedTaxReturnT } from '../types'
import { computeTaxReturn } from '../computer'
import { ECH0119Message, ContentType, MainFormType } from './types'
import { mapHeader, mapMainForm } from './mappers'
import { generateECH0119XML } from './xml-generator'
import { getMunicipalityRatesCache } from '../data/municipalityTaxRates'

/**
 * Generates eCH-0119 XML from TaxReturn and User
 * 
 * @param taxReturn - The tax return data
 * @param user - The user data
 * @returns XML string in eCH-0119 format
 */
export function exportECH0119(taxReturn: TaxReturn, user: User): string {
  // Compute tax return to get calculated values
  const municipalityRatesCache = getMunicipalityRatesCache()
  const computed = computeTaxReturn(taxReturn.data, municipalityRatesCache)
  
  // Map header
  const header = mapHeader(taxReturn, user)
  
  // Map main form
  const mainForm = mapMainForm(taxReturn, taxReturn.data, user, computed)
  
  // Build content
  const content: ContentType = {
    mainForm,
  }
  
  // Build message
  const message: ECH0119Message = {
    '@minorVersion': 0,
    header,
    content,
  }
  
  // Generate XML
  return generateECH0119XML(message)
}

/**
 * Validates that required fields are present
 * 
 * @param taxReturn - The tax return data
 * @param user - The user data
 * @throws Error if required fields are missing
 */
export function validateECH0119Export(taxReturn: TaxReturn, user: User): void {
  // Validate tax period
  if (!taxReturn.year || taxReturn.year < 2020 || taxReturn.year > 2026) {
    throw new Error('Steuerjahr muss zwischen 2020 und 2026 sein')
  }
  
  // Validate AHV number format
  const ahvPattern = /^\d{3}\.\d{4}\.\d{4}\.\d{2}$/
  if (!user.ahvNummer || !ahvPattern.test(user.ahvNummer)) {
    throw new Error('AHV-Nummer Format ungültig (erwartet: 756.1234.5678.97)')
  }
  
  // Validate person data
  const personData = taxReturn.data.personData?.data
  if (!personData?.nachname || !personData?.vorname) {
    throw new Error('Nachname und Vorname sind erforderlich')
  }
  
  // Validate address
  if (!personData?.adresse || !personData?.stadt || !personData?.plz) {
    throw new Error('Adresse ist unvollständig (Strasse, Ort, PLZ fehlen)')
  }
  
  // Validate PLZ format (4 digits)
  if (!/^\d{4}$/.test(personData.plz.toString())) {
    throw new Error('PLZ muss 4-stellig sein')
  }
}

