/**
 * Test Export für eCH-0119
 * 
 * Erstellt einen Test-Export mit Beispiel-Daten für Validierung
 */

import { ObjectId } from 'mongodb'
import { TaxReturn, TaxReturnData, User, ComputedTaxReturnT } from '../types'
import { ECH0119Message } from './types'
import { mapHeader, mapMainForm } from './mappers'
import { generateECH0119XML } from './xml-generator'
import { validateECH0119Message } from './validator'
import { computeTaxReturn } from '../computer'
import { getMunicipalityRatesCache } from '../data/municipalityTaxRates'
import fs from 'fs'
import path from 'path'

/**
 * Erstellt Test-Daten für eine Steuererklärung
 */
function createTestTaxReturn(): { taxReturn: TaxReturn; user: User; data: TaxReturnData } {
  const userId = new ObjectId()
  const taxReturnId = new ObjectId()
  
  const user: User = {
    _id: userId,
    created: new Date(),
    verificationCode: undefined,
    ahvNummer: '756.1234.5678.97', // Test-AHV-Nummer
    phoneNumber: '+41 79 123 45 67',
    email: 'test@example.com',
    validated: true,
    isActive: true,
  }
  
  const data: TaxReturnData = {
    personData: {
      start: true,
      finished: true,
      data: {
        geburtsdatum: '21.01.2001',
        vorname: 'Test',
        nachname: 'User',
        adresse: 'Teststrasse 42',
        plz: 8001,
        stadt: 'Zürich',
        land: 'schweiz',
        zivilstand: 'ledig',
        konfession: 'evangelisch-reformiert',
        beruf: 'Software Engineer',
        email: 'test@example.com',
        gemeindeBfsNumber: 261, // Zürich
        taxMunicipality: '261',
      },
    },
    geldVerdient: {
      start: true,
      finished: true,
      data: [
        {
          von: '2024.01.01',
          bis: '2024.12.31',
          arbeitgeber: 'Test AG',
          arbeitsort: 'Zürich',
          nettolohn: 15000,
          uploadedLohnausweis: true,
          urlaubstage: undefined,
          anzahlarbeitstage: undefined,
        },
      ],
    },
    oevArbeit: {
      start: true,
      finished: true,
      data: {
        kosten: 500,
      },
    },
    saeule3a: {
      start: true,
      finished: true,
      data: {
        betrag: 5000,
      },
    },
    versicherungspraemie: {
      start: true,
      finished: true,
      data: {
        betrag: 2000,
      },
    },
    spenden: {
      start: true,
      finished: true,
      data: [],
    },
    bargeld: {
      start: true,
      finished: true,
      data: {
        betrag: 1000,
      },
    },
    edelmetalle: {
      start: true,
      finished: true,
      data: {
        betrag: 500,
      },
    },
    bankkonto: {
      start: true,
      finished: true,
      data: [],
    },
    aktien: {
      start: true,
      finished: true,
      data: [],
    },
    krypto: {
      start: true,
      finished: true,
      data: [],
    },
    motorfahrzeug: {
      start: false,
      finished: false,
      data: {
        bezeichung: undefined,
        kaufjahr: undefined,
        kaufpreis: undefined,
      },
    },
    liegenschaften: {
      start: false,
      finished: false,
      data: [],
    },
    unterhaltsbeitraege: {
      start: false,
      finished: false,
      data: {
        anEhegatten: undefined,
        fuerKinder: [],
        rentenleistungen: [],
      },
    },
    rueckzahlungBank: {
      start: true,
      finished: true,
      data: {
        vorname: 'Test',
        nachname: 'User',
        iban: 'CH93 0076 2011 6238 5295 7',
      },
    },
    // Weitere Felder mit Defaults...
    inZuerich: { start: true, finished: true, data: {} },
    verheiratet: { start: false, finished: false, data: {} },
    hatKinder: { start: false, finished: false, data: {} },
    kinderImHaushalt: { start: false, finished: false, data: [] },
    kinderAusserhalb: { start: false, finished: false, data: [] },
    einkuenfteSozialversicherung: { start: false, finished: false, data: [] },
    erwerbsausfallentschaedigung: { start: false, finished: false, data: [] },
    lebensOderRentenversicherung: { start: false, finished: false, data: [] },
    geschaeftsOderKorporationsanteile: { start: false, finished: false, data: [] },
    verschuldet: { start: false, finished: false, data: [] },
    schuldzinsen: { start: false, finished: false, data: { betrag: undefined } },
    veloArbeit: { start: false, finished: false, data: {} },
    autoMotorradArbeit: {
      start: false,
      finished: false,
      data: {
        fehlenVonOev: undefined,
        zeitersparnisUeber1h: undefined,
        staendigeBenutzungArbeitszeit: undefined,
        keinOevWeilKrankOderGebrechlich: undefined,
        geleastesFahrzeug: undefined,
      },
    },
    autoMotorradArbeitWege: { start: false, finished: false, data: [] },
    verpflegungAufArbeit: { start: false, finished: false, data: { anzahlTage: undefined } },
    essenVerbilligungenVomArbeitgeber: { start: false, finished: false, data: {} },
    schichtarbeit: {
      start: false,
      finished: false,
      data: {
        wieVieleTageImJahr: undefined,
        immerSchichtarbeit: undefined,
      },
    },
    wochenaufenthalt: { start: false, finished: false, data: [] },
    inAusbildung: { start: false, finished: false, data: [] },
    beitragArbeitgeberAusbildung: { start: false, finished: false, data: { betragArbeitGeber: undefined } },
    saeule2: {
      start: false,
      finished: false,
      data: {
        ordentlichBetrag: undefined,
        einkaufBetrag: undefined,
      },
    },
    ahvIVsaeule2Selber: { start: false, finished: false, data: { betrag: undefined } },
    privateUnfall: { start: false, finished: false, data: { betrag: undefined } },
  }
  
  const taxReturn: TaxReturn = {
    _id: taxReturnId,
    userId,
    year: 2024,
    created: new Date(),
    archived: false,
    validated: false,
    data,
  }
  
  return { taxReturn, user, data }
}

/**
 * Führt einen Test-Export durch
 * 
 * @param usePdfData - Wenn true, wird versucht, Daten aus PDF zu extrahieren
 */
export async function runTestExport(usePdfData: boolean = false): Promise<{
  xml: string
  validationReport: any
  message: ECH0119Message
  extractedPdfData?: any
}> {
  console.log('Creating test data...')
  let { taxReturn, user, data } = createTestTaxReturn()
  let extractedPdfData: any = undefined

  // Wenn usePdfData = true, versuche PDF zu verarbeiten
  if (usePdfData) {
    try {
      console.log('📄 Versuche Lohnausweis-PDF zu verarbeiten...')
      const { processTestLohnausweis } = await import('./process-test-lohnausweis')
      // Das Script wird separat ausgeführt, hier nur Info
      console.log('ℹ️  Bitte führe process-test-lohnausweis.ts separat aus, um PDF-Daten zu extrahieren')
    } catch (error) {
      console.warn('⚠️  PDF-Verarbeitung nicht verfügbar, verwende Testdaten')
    }
  }
  
  console.log('Computing tax return...')
  const municipalityRatesCache = getMunicipalityRatesCache()
  const computed = computeTaxReturn(data, municipalityRatesCache)
  
  console.log('Mapping to eCH-0119...')
  const header = await mapHeader(taxReturn, user)
  const mainForm = mapMainForm(taxReturn, data, user, computed)
  
  const message: ECH0119Message = {
    '@minorVersion': 0,
    header,
    content: {
      mainForm,
    },
  }
  
  console.log('Validating...')
  const validationReport = validateECH0119Message(message, taxReturn, data, computed)
  
  console.log('Generating XML...')
  const xml = generateECH0119XML(message)
  
  // Speichere XML in Datei
  const outputDir = path.join(process.cwd(), 'test-exports')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const xmlPath = path.join(outputDir, `ech0119-test-${timestamp}.xml`)
  fs.writeFileSync(xmlPath, xml, 'utf-8')
  console.log(`XML saved to: ${xmlPath}`)
  
  // Speichere Validierungs-Report
  const reportPath = path.join(outputDir, `validation-report-${timestamp}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2), 'utf-8')
  console.log(`Validation report saved to: ${reportPath}`)
  
  return {
    xml,
    validationReport,
    message,
  }
}

// Wenn direkt ausgeführt
if (require.main === module) {
  runTestExport()
    .then(() => {
      console.log('Test export completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test export failed:', error)
      process.exit(1)
    })
}

