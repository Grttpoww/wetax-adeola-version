export function einkommenssteuerBundCalc(amount: number): number {
  if (amount <= 15000) {
    return 0
  } else if (amount <= 32800) {
    return 137.05 + (amount - 15000) * 0.0077
  } else if (amount <= 42900) {
    return 225.9 + (amount - 32800) * 0.0088
  } else if (amount <= 57200) {
    return 603.4 + (amount - 42900) * 0.0264
  } else if (amount <= 75200) {
    return 1138.0 + (amount - 57200) * 0.0297
  } else if (amount <= 81000) {
    return 1482.5 + (amount - 75200) * 0.0594
  } else if (amount <= 107400) {
    return 3224.9 + (amount - 81000) * 0.066
  } else if (amount <= 139600) {
    return 6058.5 + (amount - 107400) * 0.088
  } else if (amount <= 182600) {
    return 10788.5 + (amount - 139600) * 0.11
  } else if (amount <= 783200) {
    return 90067.7 + (amount - 182600) * 0.132
  } else {
    return 90079.5 + (amount - 783300) * 0.115
  }
}

type Bracket = [number, number]
//helper function
function calculateIncomeTaxKt(amount: number, brackets: Bracket[]): number {
  let tax = 0

  for (const [bracket, rate] of brackets) {
    if (amount <= 0) {
      break
    }
    const taxableAmount = Math.min(amount, bracket)
    tax += taxableAmount * rate
    amount -= taxableAmount
  }

  return tax
}

export function calculateEinkommenssteuerStaat(income: number, religion: string) {
  const brackets: Bracket[] = [
    [6700, 0.0],
    [4700, 0.02],
    [4700, 0.03],
    [7600, 0.04],
    [9300, 0.05],
    [10700, 0.06],
    [12400, 0.07],
    [16900, 0.08],
    [32500, 0.09],
    [32200, 0.1],
    [51000, 0.11],
    [66200, 0.12],
    [Infinity, 0.13],
  ]

  const totalIncomeTaxKt = calculateIncomeTaxKt(income, brackets) * 2.19
  const religionen: { [key: string]: number } = {
    reformiert: 1.1,
    roemischKatholisch: 1.1,
    christKatholisch: 1.14,
    andere: 1,
    keine: 1,
  }
  const multiplier = religionen[religion] ?? 1 // Default to 1 if religion is not found
  // Kirchensteuer example
  const kirchensteuerReformierte = totalIncomeTaxKt * 0.1 // for reformierte
  const kirchensteuerRoemKath = totalIncomeTaxKt * 0.1 // for röm-kath
  const kirchensteuerChristKath = totalIncomeTaxKt * 0.14 // for christ-kath
  const kirchensteuerOthers = 0 // for all others

  return totalIncomeTaxKt * multiplier
}

export function calculateVermoegenssteuer(amount: number): number {
  if (amount <= 77000) {
    return 0
  } else if (amount <= 308000) {
    return (amount - 77000) * 0.0005
  } else if (amount <= 694000) {
    return 115.5 + (amount - 308000) * 0.001
  } else if (amount <= 1619000) {
    return 501.5 + (amount - 694000) * 0.0015
  } else if (amount <= 2542000) {
    return 1672 + (amount - 1619000) * 0.002
  } else if (amount <= 5700000) {
    return 3502 + (amount - 2542000) * 0.0025
  } else {
    return 9647 + (amount - 5700000) * 0.003
  }
}

import { MunicipalityTaxRatesCache } from './types'

/**
 * Calculate municipal tax by applying Steuerfuss multiplier to cantonal tax
 * @param cantonalTax - Base cantonal tax amount
 * @param municipalityBfsNumber - BFS number of municipality (defaults to 261 = Zürich)
 * @param religion - Religion string (reformiert, roemischKatholisch, christKatholisch, andere, keine)
 * @param municipalityRatesCache - Cache of municipality tax rates
 * @returns Municipal tax amount
 */
export function calculateMunicipalTax(
  cantonalTax: number,
  municipalityBfsNumber: number | undefined,
  religion: string,
  municipalityRatesCache: MunicipalityTaxRatesCache,
): number {
  // Default to Zurich (BFS 261) if no municipality selected
  const bfsNumber = municipalityBfsNumber ?? 261
  const municipality = municipalityRatesCache.get(bfsNumber)

  if (!municipality) {
    throw new Error(`Gemeinde mit BFS-Nummer ${bfsNumber} nicht gefunden`)
  }

  // Determine which rate to use based on religion
  let steuerfuss: number | null = null

  if (religion === 'reformiert') {
    steuerfuss = municipality.rateWithReformedChurch
  } else if (religion === 'roemischKatholisch') {
    steuerfuss = municipality.rateWithCatholicChurch
  } else if (religion === 'christKatholisch') {
    steuerfuss = municipality.rateWithChristCatholicChurch
  } else {
    // andere, keine, or undefined - use base rate without church
    steuerfuss = municipality.baseRateWithoutChurch
  }

  // If rate is missing or 0, use Zürich BASE rate as fallback (don't throw error)
  if (steuerfuss === null || steuerfuss === 0) {
    console.warn(`Missing rates for ${municipality.name}, using Zürich base rate fallback`)
    const zurichMunicipality = municipalityRatesCache.get(261)
    if (!zurichMunicipality) {
      throw new Error('Zürich municipality (BFS 261) not found in cache - cannot use fallback')
    }

    // Always use Zürich's base rate (without church) as fallback
    steuerfuss = zurichMunicipality.baseRateWithoutChurch

    if (steuerfuss === null) {
      throw new Error('Zürich municipality base rate is missing - cannot use fallback')
    }
  }

  // Validate rate is valid number (must be > 0)
  if (isNaN(steuerfuss) || steuerfuss <= 0) {
    // If we got here and steuerfuss is 0 or invalid, something is wrong with the data
    throw new Error(
      `Ungültiger Steuerfuss für ${municipality.name}: ${steuerfuss}. Bitte überprüfen Sie die CSV-Daten.`,
    )
  }

  // Apply multiplier (steuerfuss is percentage, e.g., 119 = 1.19)
  return cantonalTax * (steuerfuss / 100)
}
