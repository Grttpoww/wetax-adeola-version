/**
 * Komplexer Test-Export für eCH-0119
 * 
 * Erstellt einen extensiven Testfall mit:
 * - Mehreren Einnahmequellen (Haupt- und Nebenerwerb)
 * - Wertschriften-Einnahmen
 * - Mehreren Abzügen (3a, Versicherungen, etc.)
 * - Vermögenswerten (Bankkonten, Aktien, Fahrzeug, Liegenschaft)
 * - ZH-Extensions (documentList, sourceSystem, etc.)
 * - Lohnausweisen
 * 
 * Szenario: 35-jähriger verheirateter Software-Architekt mit 2 Kindern,
 * hohem Einkommen und entsprechendem Vermögen
 */

import { ObjectId } from 'mongodb'
import { TaxReturn, TaxReturnData, User, ComputedTaxReturnT } from '../types'
import { ECH0119Message } from './types'
import { mapHeader, mapContent } from './mappers'
import { generateECH0119XML } from './xml-generator'
import { validateECH0119Message } from './validator'
import { computeTaxReturn } from '../computer'
import { loadMunicipalityTaxRates } from '../data/municipalityTaxRates'
import { Document } from '../documents/types'
import { ScanType } from '../enums'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

/**
 * Erstellt komplexe Test-Daten für eine Steuererklärung
 */
function createComplexTestTaxReturn(): { taxReturn: TaxReturn; user: User; data: TaxReturnData } {
  const userId = new ObjectId()
  const taxReturnId = new ObjectId()
  
  const user: User = {
    _id: userId,
    created: new Date(),
    verificationCode: undefined,
    ahvNummer: '756.1985.1234.56', // Test-AHV-Nummer (geboren 1985)
    phoneNumber: '+41 79 555 12 34',
    email: 'max.mustermann@example.com',
    validated: true,
    isActive: true,
  }
  
  const data: TaxReturnData = {
    personData: {
      start: true,
      finished: true,
      data: {
        geburtsdatum: '15.03.1989', // 35 Jahre alt in 2024
        vorname: 'Max',
        nachname: 'Mustermann',
        adresse: 'Bahnhofstrasse 15',
        plz: 8001,
        stadt: 'Zürich',
        land: 'schweiz',
        zivilstand: 'ledig',
        konfession: 'evangelisch-reformiert',
        beruf: 'Software-Architekt',
        email: 'max.mustermann@example.com',
        gemeindeBfsNumber: 261, // Zürich
        taxMunicipality: '261',
        // Keine Partner-Daten (ledig)
      },
    },
    // Hauptberuf: 120'000 CHF
    geldVerdient: {
      start: true,
      finished: true,
      data: [
        {
          von: '2024.01.01',
          bis: '2024.12.31',
          arbeitgeber: 'Tech Solutions AG',
          arbeitsort: 'Zürich',
          nettolohn: 120000,
          uploadedLohnausweis: true,
          urlaubstage: 25,
          anzahlarbeitstage: 220,
        },
        // Nebenerwerb: 15'000 CHF (Beratung)
        {
          von: '2024.01.01',
          bis: '2024.12.31',
          arbeitgeber: 'Startup Consulting GmbH',
          arbeitsort: 'Zürich',
          nettolohn: 15000,
          uploadedLohnausweis: true,
          urlaubstage: undefined,
          anzahlarbeitstage: undefined,
        },
      ],
    },
    // ÖV-Kosten: 1'200 CHF
    oevArbeit: {
      start: true,
      finished: true,
      data: {
        kosten: 1200,
      },
    },
    // Säule 3a: 6'500 CHF (sicherheitshalber unter Maximum 2024)
    saeule3a: {
      start: true,
      finished: true,
      data: {
        betrag: 6500,
      },
    },
    // Versicherungsprämien: 3'500 CHF
    versicherungspraemie: {
      start: true,
      finished: true,
      data: {
        betrag: 3500,
      },
    },
    // Spenden: 500 CHF
    spenden: {
      start: true,
      finished: true,
      data: [
        {
          datum: '2024.06.15',
          bezeichnung: 'Schweizerisches Rotes Kreuz',
          betrag: 300,
        },
        {
          datum: '2024.09.20',
          bezeichnung: 'WWF Schweiz',
          betrag: 200,
        },
      ],
    },
    // Bargeld: 5'000 CHF
    bargeld: {
      start: true,
      finished: true,
      data: {
        betrag: 5000,
      },
    },
    // Edelmetalle: 10'000 CHF
    edelmetalle: {
      start: true,
      finished: true,
      data: {
        betrag: 10000,
      },
    },
    // Bankkonto: 50'000 CHF (mit Zinserträgen 1'200 CHF)
    bankkonto: {
      start: true,
      finished: true,
      data: [
        {
          bankGesellschaft: 'UBS',
          kontoOderDepotNr: 'CH93 0076 2011 6238 5295 7',
          staat: 'CH',
          bezeichnung: 'Privatkonto',
          waehrung: 'CHF',
          steuerwertEndeJahr: 50000,
          zinsUeber200: true,
          zinsbetrag: 1200,
        },
      ],
    },
    // Aktien: 30'000 CHF (mit Dividenden 1'500 CHF)
    aktien: {
      start: true,
      finished: true,
      data: [
        {
          valorenNr: '12345678',
          ISIN: 'CH0038863350',
          gesellschaftTitel: 'Nestlé SA',
          staat: 'CH',
          waehrung: 'CHF',
          steuerwertEndeJahr: 30000,
          stueckzahl: 100,
          steuerwertProStueck: 300,
          dividendenertrag: 1500,
          beteiligungsquote: 0.01, // 1% (nicht qualifiziert)
          istQualifizierteBeteiligung: false,
        },
      ],
    },
    // Krypto: 5'000 CHF
    krypto: {
      start: true,
      finished: true,
      data: [
        {
          bank: 'Kraken',
          waehrung: 'CHF',
          steuerwert: 5000,
          stueckzahl: 0.1,
          steuerwertProStueck: 50000,
          ertragMitVerrechnungssteuer: 0,
        },
      ],
    },
    // Motorfahrzeug: 25'000 CHF (Tesla Model 3, 2022)
    motorfahrzeug: {
      start: true,
      finished: true,
      data: {
        bezeichung: 'Tesla Model 3',
        kaufjahr: 2022,
        kaufpreis: 25000,
      },
    },
    // Liegenschaften: 520'000 CHF (Eigentumswohnung)
    // Eigenmietwert = 3.5% des Vermögenssteuerwerts = 520'000 * 0.035 = 18'200 CHF
    liegenschaften: {
      start: true,
      finished: true,
      data: [
        {
          bezeichnung: 'Eigentumswohnung Bahnhofstrasse 15',
          ort: 'Zürich',
          kanton: 'ZH',
          eigenmietwertOderMietertrag: 18200, // 3.5% des Vermögenssteuerwerts (520'000 * 0.035)
          unterhaltArt: 'pauschal',
          unterhaltBetrag: undefined,
          istGeschaeftlich: false,
          vermoegenssteuerwert: 520000,
        },
      ],
    },
    // Ledig, keine Kinder
    verheiratet: {
      start: false,
      finished: false,
      data: {},
    },
    hatKinder: {
      start: false,
      finished: false,
      data: {},
    },
    kinderImHaushalt: {
      start: false,
      finished: false,
      data: [],
    },
    kinderAusserhalb: {
      start: false,
      finished: false,
      data: [],
    },
    // Verschuldet: Hypothek 400'000 CHF
    verschuldet: {
      start: true,
      finished: true,
      data: [
        {
          glauebiger: 'UBS Hypotheken',
          glauebigerAdresse: 'Bahnhofstrasse 45, 8001 Zürich',
          zinssatz: 2.5,
          schuldhoehe: 400000,
          zinsenImJahr: 10000,
        },
      ],
    },
    schuldzinsen: {
      start: true,
      finished: true,
      data: {
        betrag: 10000,
      },
    },
    // Weitere Felder
    inZuerich: { start: true, finished: true, data: {} },
    einkuenfteSozialversicherung: { start: false, finished: false, data: [] },
    erwerbsausfallentschaedigung: { start: false, finished: false, data: [] },
    lebensOderRentenversicherung: { start: false, finished: false, data: [] },
    geschaeftsOderKorporationsanteile: { start: false, finished: false, data: [] },
    rueckzahlungBank: {
      start: true,
      finished: true,
      data: {
        vorname: 'Max',
        nachname: 'Mustermann',
        iban: 'CH93 0076 2011 6238 5295 7',
      },
    },
    veloArbeit: { start: true, finished: true, data: {} },
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
    unterhaltsbeitraege: {
      start: false,
      finished: false,
      data: {
        anEhegatten: undefined,
        fuerKinder: [],
        rentenleistungen: [],
      },
    },
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
 * Erstellt ein Dummy-PDF für 3a-Beleg
 */
async function createDummy3aPdf(filePath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  page.drawText('Säule 3a Beleg 2024', {
    x: 50,
    y: 800,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Bestätigung über Einzahlungen in die Säule 3a', {
    x: 50,
    y: 750,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Steuerjahr: 2024', {
    x: 50,
    y: 720,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Einzahlungsbetrag: CHF 6\'500.00', {
    x: 50,
    y: 690,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Dies ist ein Dummy-Beleg für Testzwecke.', {
    x: 50,
    y: 650,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  const pdfBytes = await pdfDoc.save()
  
  // Erstelle Verzeichnis falls nicht vorhanden
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(filePath, pdfBytes)
}

/**
 * Erstellt ein Dummy-PDF für Versicherungspolice
 */
async function createDummyVersicherungspolicePdf(filePath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  page.drawText('Versicherungspolice 2024', {
    x: 50,
    y: 800,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Prämienübersicht Steuerjahr 2024', {
    x: 50,
    y: 750,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Private Krankenversicherung: CHF 3\'500.00', {
    x: 50,
    y: 720,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Dies ist ein Dummy-Beleg für Testzwecke.', {
    x: 50,
    y: 650,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  const pdfBytes = await pdfDoc.save()
  
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(filePath, pdfBytes)
}

/**
 * Erstellt ein Dummy-PDF für Hypothekarschuldenbrief
 */
async function createDummyHypothekarschuldenbriefPdf(filePath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  page.drawText('Hypothekarschuldenbrief 2024', {
    x: 50,
    y: 800,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Bestätigung über Hypothekarschulden per 31.12.2024', {
    x: 50,
    y: 750,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Gläubiger: UBS Hypotheken', {
    x: 50,
    y: 720,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Schuldhöhe per 31.12.2024: CHF 400\'000.00', {
    x: 50,
    y: 690,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Zinssatz: 2.5%', {
    x: 50,
    y: 660,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Zinsen im Jahr 2024: CHF 10\'000.00', {
    x: 50,
    y: 630,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Dies ist ein Dummy-Beleg für Testzwecke.', {
    x: 50,
    y: 600,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  const pdfBytes = await pdfDoc.save()
  
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(filePath, pdfBytes)
}

/**
 * Erstellt Dummy-Dokumente für obligatorische Belege
 */
async function createDummyDocuments(taxReturnId: ObjectId, userId: ObjectId): Promise<Document[]> {
  const now = new Date()
  const dummyDir = path.join(process.cwd(), 'dummy-documents')
  
  // Erstelle Verzeichnis falls nicht vorhanden
  if (!fs.existsSync(dummyDir)) {
    fs.mkdirSync(dummyDir, { recursive: true })
  }
  
  // Erstelle Dummy-PDFs
  const saeule3aPath = path.join(dummyDir, 'saeule3a-beleg-2024.pdf')
  const versicherungspolicePath = path.join(dummyDir, 'versicherungspolice-2024.pdf')
  const hypothekarschuldenbriefPath = path.join(dummyDir, 'hypothekarschuldenbrief-2024.pdf')
  
  await createDummy3aPdf(saeule3aPath)
  await createDummyVersicherungspolicePdf(versicherungspolicePath)
  await createDummyHypothekarschuldenbriefPdf(hypothekarschuldenbriefPath)
  
  // Dateigrössen ermitteln
  const saeule3aSize = fs.statSync(saeule3aPath).size
  const versicherungspoliceSize = fs.statSync(versicherungspolicePath).size
  const hypothekarschuldenbriefSize = fs.statSync(hypothekarschuldenbriefPath).size
  
  return [
    // Säule 3a Beleg (obligatorisch)
    {
      _id: new ObjectId(),
      taxReturnId,
      userId,
      year: 2024,
      documentType: 'other' as ScanType,
      originalFileName: 'saeule3a-beleg-2024.pdf',
      mimeType: 'application/pdf',
      fileSize: saeule3aSize,
      storageType: 'local',
      storagePath: 'dummy-documents/saeule3a-beleg-2024.pdf',
      scanStatus: 'completed',
      documentCanton: 'ZH',
      documentCategory: 'Säule 3a Beleg',
      uploadedAt: now,
      scannedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    // Versicherungspolice (obligatorisch bei Versicherungsprämien)
    {
      _id: new ObjectId(),
      taxReturnId,
      userId,
      year: 2024,
      documentType: 'other' as ScanType,
      originalFileName: 'versicherungspolice-2024.pdf',
      mimeType: 'application/pdf',
      fileSize: versicherungspoliceSize,
      storageType: 'local',
      storagePath: 'dummy-documents/versicherungspolice-2024.pdf',
      scanStatus: 'completed',
      documentCanton: 'ZH',
      documentCategory: 'Versicherungspolice',
      uploadedAt: now,
      scannedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    // Hypothekarschuldenbrief (obligatorisch bei Hypothekarschulden)
    {
      _id: new ObjectId(),
      taxReturnId,
      userId,
      year: 2024,
      documentType: 'other' as ScanType,
      originalFileName: 'hypothekarschuldenbrief-2024.pdf',
      mimeType: 'application/pdf',
      fileSize: hypothekarschuldenbriefSize,
      storageType: 'local',
      storagePath: 'dummy-documents/hypothekarschuldenbrief-2024.pdf',
      scanStatus: 'completed',
      documentCanton: 'ZH',
      documentCategory: 'Hypothekarschuldenbrief',
      uploadedAt: now,
      scannedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

/**
 * Führt einen komplexen Test-Export durch
 */
export async function runComplexTestExport(): Promise<{
  xml: string
  validationReport: any
  message: ECH0119Message
}> {
  console.log('📋 Erstelle komplexen Testfall...')
  const { taxReturn, user, data } = createComplexTestTaxReturn()
  
  // Erstelle Dummy-Dokumente für obligatorische Belege (inkl. PDFs)
  console.log('📄 Erstelle Dummy-PDFs für obligatorische Belege...')
  const documents = await createDummyDocuments(taxReturn._id, user._id)
  
  console.log('📊 Lade Gemeindesteuersätze...')
  await loadMunicipalityTaxRates()
  
  console.log('🧮 Berechne Steuererklärung...')
  const { getMunicipalityRatesCache } = await import('../data/municipalityTaxRates')
  const municipalityRatesCache = getMunicipalityRatesCache()
  const computed = computeTaxReturn(data, municipalityRatesCache)
  
  console.log('📝 Mappe zu eCH-0119...')
  const header = await mapHeader(taxReturn, user, documents)
  const content = mapContent(taxReturn, data, user, computed)
  
  const message: ECH0119Message = {
    '@minorVersion': 0,
    header,
    content,
  }
  
  console.log('✅ Validiere...')
  const validationReport = validateECH0119Message(message, taxReturn, data, computed)
  
  console.log('📄 Generiere XML...')
  const xml = generateECH0119XML(message)
  
  // Speichere XML in Datei
  const outputDir = path.join(process.cwd(), 'test-exports')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const xmlPath = path.join(outputDir, `ech0119-complex-${timestamp}.xml`)
  fs.writeFileSync(xmlPath, xml, 'utf-8')
  console.log(`✅ XML gespeichert: ${xmlPath}`)
  
  // Speichere Validierungs-Report
  const reportPath = path.join(outputDir, `validation-report-complex-${timestamp}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2), 'utf-8')
  console.log(`✅ Validierungs-Report gespeichert: ${reportPath}`)
  
  // Speichere Message-Struktur für Debugging
  const messagePath = path.join(outputDir, `message-structure-complex-${timestamp}.json`)
  fs.writeFileSync(messagePath, JSON.stringify(message, null, 2), 'utf-8')
  console.log(`✅ Message-Struktur gespeichert: ${messagePath}`)
  
  // Ausgabe der Validierung
  console.log('\n📊 Validierungs-Ergebnis:')
  console.log(`   Status: ${validationReport.isValid ? '✅ VALID' : '❌ INVALID'}`)
  console.log(`   Fehler: ${validationReport.errorCount}`)
  console.log(`   Warnungen: ${validationReport.warningCount}`)
  
  if (validationReport.results.length > 0) {
    console.log('\n📋 Details:')
    validationReport.results.forEach((result: any) => {
      const icon = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`   ${icon} [${result.severity}] ${result.code}: ${result.message}`)
    })
  }
  
  return {
    xml,
    validationReport,
    message,
  }
}

// Wenn direkt ausgeführt
if (require.main === module) {
  runComplexTestExport()
    .then(() => {
      console.log('\n✅ Komplexer Test-Export erfolgreich abgeschlossen!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test-Export fehlgeschlagen:', error)
      process.exit(1)
    })
}

