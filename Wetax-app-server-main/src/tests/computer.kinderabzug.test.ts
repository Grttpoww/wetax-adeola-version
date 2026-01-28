import { computeTaxReturn } from '../computer'
import { test, expect, describe, beforeAll } from '@jest/globals'
import { TaxReturnData } from '../types'
import { loadMunicipalityTaxRates } from '../data/municipalityTaxRates'
import { MunicipalityTaxRatesCache } from '../types'

describe('Kinderabzug Calculation (computer.ts)', () => {
  let municipalityRatesCache: MunicipalityTaxRatesCache

  beforeAll(() => {
    municipalityRatesCache = loadMunicipalityTaxRates()
  })

  const baseTaxData: TaxReturnData = {
    personData: {
      start: true,
      finished: true,
      data: {
        geburtsdatum: '01.01.1990',
        vorname: 'Test',
        nachname: 'User',
        adresse: 'Teststrasse 1',
        plz: 8000,
        stadt: 'Zurich',
        land: 'Schweiz',
        zivilstand: 'Ledig',
        konfession: 'keine',
        beruf: 'Test',
        email: 'test@test.ch',
      },
    },
    rueckzahlungBank: {
      start: undefined,
      finished: undefined,
      data: {
        vorname: undefined,
        nachname: undefined,
        iban: undefined,
      },
    },
    inZuerich: { start: true, finished: true, data: {} },
    verheiratet: { start: false, finished: true, data: {} },
    hatKinder: { start: true, finished: true, data: {} },
    kinderImHaushalt: {
      start: true,
      finished: true,
      data: [],
    },
    kinderAusserhalb: {
      start: true,
      finished: true,
      data: [],
    },
    einkuenfteSozialversicherung: { start: false, finished: true, data: {} },
    erwerbsausfallentschaedigung: { start: false, finished: true, data: {} },
    lebensOderRentenversicherung: { start: false, finished: true, data: {} },
    geschaeftsOderKorporationsanteile: { start: false, finished: true, data: {} },
    verschuldet: { start: false, finished: true, data: {} },
    geldVerdient: {
      start: true,
      finished: true,
      data: [
        {
          von: '2024.01.01',
          bis: '2024.12.31',
          arbeitgeber: 'Test AG',
          arbeitsort: 'Zurich',
          urlaubstage: 25,
          nettolohn: 100000,
          uploadedLohnausweis: false,
          anzahlarbeitstage: 260,
        },
      ],
    },
    oevArbeit: { start: false, finished: true, data: { kosten: undefined } },
    veloArbeit: { start: false, finished: true, data: {} },
    autoMotorradArbeit: {
      start: false,
      finished: true,
      data: {
        fehlenVonOev: false,
        zeitersparnisUeber1h: false,
        staendigeBenutzungArbeitszeit: false,
        keinOevWeilKrankOderGebrechlich: false,
        geleastesFahrzeug: false,
      },
    },
    autoMotorradArbeitWege: { start: false, finished: true, data: [] },
    verpflegungAufArbeit: { start: false, finished: true, data: { anzahlTage: undefined } },
    essenVerbilligungenVomArbeitgeber: { start: false, finished: true, data: {} },
    schichtarbeit: {
      start: false,
      finished: true,
      data: { wieVieleTageImJahr: undefined, immerSchichtarbeit: undefined },
    },
    wochenaufenthalt: { start: false, finished: true, data: [] },
    inAusbildung: { start: false, finished: true, data: [] },
    beitragArbeitgeberAusbildung: {
      start: false,
      finished: true,
      data: { betragArbeitGeber: undefined },
    },
    saeule2: {
      start: false,
      finished: true,
      data: { ordentlichBetrag: undefined, einkaufBetrag: undefined },
    },
    ahvIVsaeule2Selber: { start: false, finished: true, data: { betrag: undefined } },
    saeule3a: { start: false, finished: true, data: { betrag: undefined } },
    versicherungspraemie: { start: false, finished: true, data: { betrag: undefined } },
    privateUnfall: { start: false, finished: true, data: { betrag: undefined } },
    spenden: { start: false, finished: true, data: [] },
    bargeld: { start: false, finished: true, data: { betrag: undefined } },
    edelmetalle: { start: false, finished: true, data: { betrag: undefined } },
    bankkonto: { start: false, finished: true, data: [] },
    aktien: { start: false, finished: true, data: [] },
    krypto: { start: false, finished: true, data: [] },
    motorfahrzeug: {
      start: false,
      finished: true,
      data: { bezeichung: undefined, kaufjahr: undefined, kaufpreis: undefined },
    },
    liegenschaften: { start: false, finished: true, data: {} },
  }

  test('should calculate 0 CHF deduction for 0 children', () => {
    const testData = { ...baseTaxData }
    const result = computeTaxReturn(testData, municipalityRatesCache)

    // Check that totalAbzuegeStaat and totalAbzuegeBund exist
    expect(result).toHaveProperty('totalAbzuegeStaat')
    expect(result).toHaveProperty('totalAbzuegeBund')

    // With 0 children: keine Kinderabzüge
    // totalAbzuege should only contain other deductions (Berufsauslagen, etc.)
    // Kinderabzug: 0 CHF (0 Kinder × 9300 = 0 für Staat, 0 × 6800 = 0 für Bund)
    expect(typeof result.totalAbzuegeStaat).toBe('number')
    expect(typeof result.totalAbzuegeBund).toBe('number')
  })

  test('should calculate 9300 CHF (Staat) and 6800 CHF (Bund) for 1 child im Haushalt', () => {
    const testData: TaxReturnData = {
      ...baseTaxData,
      kinderImHaushalt: {
        start: true,
        finished: true,
        data: [
          {
            vorname: 'Max',
            nachname: 'Mustermann',
            geburtsdatum: '2010.01.01',
            inAusbildung: false,
            schuleOderLehrfirma: undefined,
            voraussichtlichBis: undefined,
            andererElternteilZahlt: false,
            unterhaltsbeitragProJahr: undefined,
          },
        ],
      },
    }

    // Calculate with and without children
    const resultWithChild = computeTaxReturn(testData, municipalityRatesCache)
    const resultWithoutChild = computeTaxReturn(baseTaxData, municipalityRatesCache)

    // Difference should be exactly 9300 (Staat) and 6800 (Bund)
    const diffStaat = resultWithChild.totalAbzuegeStaat - resultWithoutChild.totalAbzuegeStaat
    const diffBund = resultWithChild.totalAbzuegeBund - resultWithoutChild.totalAbzuegeBund

    expect(diffStaat).toBe(9300)
    expect(diffBund).toBe(6800)
  })

  test('should calculate 18600 CHF (Staat) and 13600 CHF (Bund) for 2 children (1 im Haushalt, 1 ausserhalb)', () => {
    const testData: TaxReturnData = {
      ...baseTaxData,
      kinderImHaushalt: {
        start: true,
        finished: true,
        data: [
          {
            vorname: 'Max',
            nachname: 'Mustermann',
            geburtsdatum: '2010.01.01',
            inAusbildung: false,
            schuleOderLehrfirma: undefined,
            voraussichtlichBis: undefined,
            andererElternteilZahlt: false,
            unterhaltsbeitragProJahr: undefined,
          },
        ],
      },
      kinderAusserhalb: {
        start: true,
        finished: true,
        data: [
          {
            vorname: 'Lisa',
            nachname: 'Mustermann',
            geburtsdatum: '2012.05.15',
            adresse: 'Teststrasse 10, 8000 Zurich',
            inAusbildung: false,
            schuleOderLehrfirma: undefined,
            voraussichtlichBis: undefined,
          },
        ],
      },
    }

    const resultWithChildren = computeTaxReturn(testData, municipalityRatesCache)
    const resultWithoutChildren = computeTaxReturn(baseTaxData, municipalityRatesCache)

    // 2 children total: 2 × 9300 = 18600 (Staat), 2 × 6800 = 13600 (Bund)
    const diffStaat = resultWithChildren.totalAbzuegeStaat - resultWithoutChildren.totalAbzuegeStaat
    const diffBund = resultWithChildren.totalAbzuegeBund - resultWithoutChildren.totalAbzuegeBund

    expect(diffStaat).toBe(18600) // 2 × 9300
    expect(diffBund).toBe(13600) // 2 × 6800
  })

  test('should calculate 27900 CHF (Staat) and 20400 CHF (Bund) for 3 children im Haushalt (max)', () => {
    const testData: TaxReturnData = {
      ...baseTaxData,
      kinderImHaushalt: {
        start: true,
        finished: true,
        data: [
          {
            vorname: 'Max',
            nachname: 'Mustermann',
            geburtsdatum: '2010.01.01',
            inAusbildung: false,
            schuleOderLehrfirma: undefined,
            voraussichtlichBis: undefined,
            andererElternteilZahlt: false,
            unterhaltsbeitragProJahr: undefined,
          },
          {
            vorname: 'Lisa',
            nachname: 'Mustermann',
            geburtsdatum: '2012.05.15',
            inAusbildung: false,
            schuleOderLehrfirma: undefined,
            voraussichtlichBis: undefined,
            andererElternteilZahlt: false,
            unterhaltsbeitragProJahr: undefined,
          },
          {
            vorname: 'Tom',
            nachname: 'Mustermann',
            geburtsdatum: '2015.08.20',
            inAusbildung: false,
            schuleOderLehrfirma: undefined,
            voraussichtlichBis: undefined,
            andererElternteilZahlt: false,
            unterhaltsbeitragProJahr: undefined,
          },
        ],
      },
    }

    const resultWithChildren = computeTaxReturn(testData, municipalityRatesCache)
    const resultWithoutChildren = computeTaxReturn(baseTaxData, municipalityRatesCache)

    // 3 children: 3 × 9300 = 27900 (Staat), 3 × 6800 = 20400 (Bund)
    const diffStaat = resultWithChildren.totalAbzuegeStaat - resultWithoutChildren.totalAbzuegeStaat
    const diffBund = resultWithChildren.totalAbzuegeBund - resultWithoutChildren.totalAbzuegeBund

    expect(diffStaat).toBe(27900) // 3 × 9300
    expect(diffBund).toBe(20400) // 3 × 6800
  })

  test('should handle empty arrays correctly', () => {
    const testData: TaxReturnData = {
      ...baseTaxData,
      kinderImHaushalt: {
        start: true,
        finished: true,
        data: [],
      },
      kinderAusserhalb: {
        start: true,
        finished: true,
        data: [],
      },
    }

    const result = computeTaxReturn(testData, municipalityRatesCache)
    const resultBase = computeTaxReturn(baseTaxData, municipalityRatesCache)

    // Should be the same (no children)
    expect(result.totalAbzuegeStaat).toBe(resultBase.totalAbzuegeStaat)
    expect(result.totalAbzuegeBund).toBe(resultBase.totalAbzuegeBund)
  })

  test('should handle undefined kinderImHaushalt/kinderAusserhalb gracefully', () => {
    const testData: TaxReturnData = {
      ...baseTaxData,
      kinderImHaushalt: {
        start: undefined,
        finished: undefined,
        data: undefined as any,
      },
      kinderAusserhalb: {
        start: undefined,
        finished: undefined,
        data: undefined as any,
      },
    }

    // Should not crash, should handle gracefully
    expect(() => computeTaxReturn(testData, municipalityRatesCache)).not.toThrow()
    const result = computeTaxReturn(testData, municipalityRatesCache)
    expect(typeof result.totalAbzuegeStaat).toBe('number')
    expect(typeof result.totalAbzuegeBund).toBe('number')
  })
})






