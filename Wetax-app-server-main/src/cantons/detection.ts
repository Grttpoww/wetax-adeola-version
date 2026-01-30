/**
 * Kanton-Detection
 * 
 * Bestimmt den Kanton aus Steuererklärungs-Daten
 */

import { TaxReturn } from '../types'

/**
 * BFS-Nummer zu Kanton Mapping
 * Erste 2 Ziffern der BFS-Nummer = Kanton
 */
const BFS_TO_CANTON: Record<number, string> = {
  1: 'ZH',  // Zürich
  2: 'BE',  // Bern
  3: 'LU',  // Luzern
  4: 'UR',  // Uri
  5: 'SZ',  // Schwyz
  6: 'OW',  // Obwalden
  7: 'NW',  // Nidwalden
  8: 'GL',  // Glarus
  9: 'ZG',  // Zug
  10: 'FR', // Freiburg
  11: 'SO', // Solothurn
  12: 'BS', // Basel-Stadt
  13: 'BL', // Basel-Landschaft
  14: 'SH', // Schaffhausen
  15: 'AR', // Appenzell Ausserrhoden
  16: 'AI', // Appenzell Innerrhoden
  17: 'SG', // St. Gallen
  18: 'GR', // Graubünden
  19: 'AG', // Aargau
  20: 'TG', // Thurgau
  21: 'TI', // Tessin
  22: 'VD', // Waadt
  23: 'VS', // Wallis
  24: 'NE', // Neuenburg
  25: 'GE', // Genf
  26: 'JU', // Jura
}

/**
 * Bestimmt den Kanton aus einer Steuererklärung
 */
export function getCantonFromTaxReturn(taxReturn: TaxReturn): string {
  // Option 1: Aus taxMunicipality (BFS-Nummer als String)
  const taxMunicipality = taxReturn.data.personData?.data?.taxMunicipality
  if (taxMunicipality) {
    const bfsNumber = parseInt(taxMunicipality, 10)
    if (!isNaN(bfsNumber)) {
      const canton = getCantonFromBfsNumber(bfsNumber)
      if (canton) return canton
    }
  }
  
  // Option 2: Aus gemeindeBfsNumber
  const gemeindeBfs = taxReturn.data.personData?.data?.gemeindeBfsNumber
  if (gemeindeBfs) {
    const canton = getCantonFromBfsNumber(gemeindeBfs)
    if (canton) return canton
  }
  
  // Option 3: Aus stadt ableiten (Fallback, nicht sehr zuverlässig)
  const stadt = taxReturn.data.personData?.data?.stadt
  if (stadt) {
    const canton = getCantonFromCity(stadt)
    if (canton) return canton
  }
  
  // Default: Zürich (für Backward Compatibility)
  // TODO: Sollte in Zukunft einen Fehler werfen, wenn kein Kanton bestimmt werden kann
  return 'ZH'
}

/**
 * Bestimmt den Kanton aus einer BFS-Nummer
 */
export function getCantonFromBfsNumber(bfsNumber: number): string | undefined {
  // BFS-Nummer Format: XXXXX
  // Erste 2 Ziffern = Kanton
  // z.B. 261 = Zürich (Kanton 1), 1201 = Bern (Kanton 2)
  
  const kantonCode = Math.floor(bfsNumber / 10000)
  return BFS_TO_CANTON[kantonCode]
}

/**
 * Bestimmt den Kanton aus einem Städtenamen (Fallback)
 * Nicht sehr zuverlässig, da Städtenamen mehrdeutig sein können
 */
function getCantonFromCity(city: string): string | undefined {
  const cityLower = city.toLowerCase().trim()
  
  // Bekannte Städte mit eindeutiger Zuordnung
  const cityMapping: Record<string, string> = {
    'zürich': 'ZH',
    'zurich': 'ZH',
    'bern': 'BE',
    'basel': 'BS',
    'luzern': 'LU',
    'st. gallen': 'SG',
    'genf': 'GE',
    'lausanne': 'VD',
    'winterthur': 'ZH',
    'biel': 'BE',
    // ... weitere
  }
  
  return cityMapping[cityLower]
}

/**
 * Validiert ob eine BFS-Nummer gültig ist
 */
export function isValidBfsNumber(bfsNumber: number): boolean {
  // BFS-Nummern sind 5-stellig (10000-99999)
  return bfsNumber >= 10000 && bfsNumber <= 99999
}

