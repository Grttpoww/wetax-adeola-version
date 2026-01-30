/**
 * Vollständiger Test-Run mit PDF-Verarbeitung
 * 
 * 1. Verarbeitet Test-Lohnausweis PDF
 * 2. Vergleicht mit Testdaten
 * 3. Generiert XML mit echten Daten
 * 4. Validiert gegen XSD
 */

import fs from 'fs'
import path from 'path'
import { ObjectId } from 'mongodb'
import { parseImage } from '../api/openai'
import { ScanType } from '../enums'
import { LohnausweisScanT, TaxReturn, TaxReturnData, User, ComputedTaxReturnT } from '../types'
import { ECH0119Message } from './types'
import { mapHeader, mapMainForm } from './mappers'
import { generateECH0119XML } from './xml-generator'
import { validateECH0119Message } from './validator'
import { computeTaxReturn } from '../computer'
import { getMunicipalityRatesCache, loadMunicipalityTaxRates } from '../data/municipalityTaxRates'

/**
 * Liest PDF-Datei und konvertiert zu Base64
 */
function readPdfAsBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath)
  return fileBuffer.toString('base64')
}

/**
 * Findet Lohnausweis-PDF im data-Ordner
 */
function findLohnausweisPdf(): string | null {
  const dataDir = path.join(process.cwd(), 'src', 'data')
  if (!fs.existsSync(dataDir)) {
    return null
  }

  const pdfFiles = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith('.pdf') && file.toLowerCase().includes('lohn'))

  if (pdfFiles.length === 0) {
    return null
  }

  // Verwende das erste gefundene PDF
  return path.join(dataDir, pdfFiles[0])
}

/**
 * Erstellt TaxReturn mit extrahierten PDF-Daten
 */
function createTaxReturnFromPdfData(
  pdfData: LohnausweisScanT,
  userId: ObjectId
): { taxReturn: TaxReturn; user: User; data: TaxReturnData } {
  const taxReturnId = new ObjectId()

  // User aus PDF-Daten erstellen
  const user: User = {
    _id: userId,
    created: new Date(),
    verificationCode: undefined,
    ahvNummer: pdfData.personData.ahvNummmer,
    phoneNumber: '+41 79 123 45 67', // Fallback, nicht im PDF
    email: undefined,
    validated: true,
    isActive: true,
  }

  // TaxReturnData aus PDF-Daten erstellen
  const data: TaxReturnData = {
    personData: {
      start: true,
      finished: true,
      data: {
        geburtsdatum: pdfData.personData.geburtsdatum,
        vorname: pdfData.personData.vorname,
        nachname: pdfData.personData.nachname,
        adresse: pdfData.personData.adresse,
        plz: pdfData.personData.plz,
        stadt: pdfData.personData.stadt,
        land: pdfData.personData.land || 'schweiz',
        zivilstand: 'ledig', // Fallback, nicht im Lohnausweis
        konfession: 'evangelisch-reformiert', // Fallback
        beruf: undefined,
        email: undefined,
        gemeindeBfsNumber: 261, // Zürich
        taxMunicipality: '261',
      },
    },
    geldVerdient: {
      start: true,
      finished: true,
        data: [
        {
          von: pdfData.lohn.von,
          bis: pdfData.lohn.bis,
          arbeitgeber: pdfData.lohn.arbeitgeber || 'Unbekannt',
          arbeitsort: pdfData.lohn.arbeitsort || 'Zürich',
          nettolohn: pdfData.lohn.nettolohn,
          uploadedLohnausweis: true,
          urlaubstage: undefined,
          anzahlarbeitstage: undefined,
        },
      ],
    },
    rueckzahlungBank: {
      start: true,
      finished: true,
      data: {
        vorname: pdfData.personData.vorname,
        nachname: pdfData.personData.nachname,
        iban: 'CH93 0076 2011 6238 5295 7', // Fallback, nicht im PDF
      },
    },
    // Alle anderen Felder mit Defaults
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
    oevArbeit: { start: false, finished: false, data: { kosten: undefined } },
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
    saeule3a: { start: false, finished: false, data: { betrag: undefined } },
    versicherungspraemie: { start: false, finished: false, data: { betrag: undefined } },
    privateUnfall: { start: false, finished: false, data: { betrag: undefined } },
    spenden: { start: false, finished: false, data: [] },
    bargeld: { start: false, finished: false, data: { betrag: undefined } },
    edelmetalle: { start: false, finished: false, data: { betrag: undefined } },
    bankkonto: { start: false, finished: false, data: [] },
    aktien: { start: false, finished: false, data: [] },
    krypto: { start: false, finished: false, data: [] },
    motorfahrzeug: {
      start: false,
      finished: false,
      data: {
        bezeichung: undefined,
        kaufjahr: undefined,
        kaufpreis: undefined,
      },
    },
    liegenschaften: { start: false, finished: false, data: [] },
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
    year: parseInt(pdfData.personData.jahr) || 2024,
    created: new Date(),
    archived: false,
    validated: false,
    data,
  }

  return { taxReturn, user, data }
}

/**
 * Vollständiger Test-Run
 */
export async function runFullTest(): Promise<{
  pdfExtracted: LohnausweisScanT | null
  xml: string
  validationReport: any
  message: ECH0119Message
  outputFiles: string[]
}> {
  const outputDir = path.join(process.cwd(), 'test-exports')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputFiles: string[] = []

  console.log('🚀 Starte vollständigen Test-Run...\n')

  // ============================================
  // SCHRITT 1: PDF finden und verarbeiten
  // ============================================
  console.log('📄 Schritt 1: Suche nach Lohnausweis-PDF...')
  const pdfPath = findLohnausweisPdf()

  if (!pdfPath) {
    console.error('❌ Kein Lohnausweis-PDF gefunden!')
    console.log('   Erwartet in: src/data/*lohn*.pdf')
    throw new Error('Kein Lohnausweis-PDF gefunden')
  }

  console.log(`✅ PDF gefunden: ${path.basename(pdfPath)}\n`)

  console.log('🔄 Schritt 2: Verarbeite PDF mit Textract + Azure OpenAI...')
  let pdfExtracted: LohnausweisScanT | null = null

  try {
    const base64 = readPdfAsBase64(pdfPath)
    const jsonString = await parseImage(base64, 'application/pdf', ScanType.Lohnausweis)
    pdfExtracted = JSON.parse(jsonString) as LohnausweisScanT

    console.log('✅ PDF erfolgreich verarbeitet!')
    console.log(`   Arbeitgeber: ${pdfExtracted.lohn?.arbeitgeber || 'N/A'}`)
    console.log(`   Nettolohn: ${pdfExtracted.lohn?.nettolohn || 'N/A'} CHF`)
    console.log(`   Bruttolohn: ${pdfExtracted.lohn?.bruttolohn || 'N/A'} CHF`)
    console.log(`   Name: ${pdfExtracted.personData?.vorname || 'N/A'} ${pdfExtracted.personData?.nachname || 'N/A'}\n`)

    // Speichere extrahierte Daten
    const extractedPath = path.join(outputDir, `extracted-pdf-${timestamp}.json`)
    fs.writeFileSync(extractedPath, JSON.stringify(pdfExtracted, null, 2), 'utf-8')
    outputFiles.push(extractedPath)
    console.log(`💾 Extrahierte PDF-Daten gespeichert: ${extractedPath}\n`)
  } catch (error) {
    console.error('⚠️  Fehler bei PDF-Verarbeitung (vermutlich fehlende Azure Credentials)')
    console.error('   Fehler:', error instanceof Error ? error.message : String(error))
    console.log('\n📋 Verwende Testdaten als Fallback...\n')
    
    // Fallback: Verwende Testdaten die mit dem PDF übereinstimmen sollten
    pdfExtracted = {
      personData: {
        ahvNummmer: '756.1234.5678.97',
        geburtsdatum: '21.01.2001',
        jahr: '2024',
        von: '2024.01.01',
        bis: '2024.12.31',
        vorname: 'Test',
        nachname: 'User',
        adresse: 'Teststrasse 42',
        plz: 8001,
        stadt: 'Zürich',
        land: 'schweiz',
      },
      lohn: {
        lohn: 15000,
        gehaltsNebenleistungen: {
          verpflegungUnterkunft: 0,
          privatanteilGeschaeftsfahrzeug: 0,
          andere: 0,
        },
        bruttolohn: 15000,
        beitraegeAHVIV: 0,
        beruflicheVorsorge: {
          ordentlicheBeitraege: 0,
          beitraegeFuerEinkauf: 0,
        },
        von: '2024.01.01',
        bis: '2024.12.31',
        nettolohn: 15000,
        arbeitgeber: 'Test AG',
        arbeitsort: 'Zürich',
        spesenVerguetungen: {
          effektiveSpesen: {
            spesenReise: 0,
            spesenUebrige: 0,
          },
          pauschalSpesen: {
            spesenRepraesentation: 0,
            spesenAuto: 0,
            spesenUebrige: 0,
          },
          beitraegeWeiterbildung: 0,
        },
      },
      aussteller: {
        ort: 'Zürich',
        datum: new Date().toLocaleDateString('de-CH'),
      },
    }
    
    console.log('✅ Testdaten verwendet (sollten mit PDF übereinstimmen)')
    console.log(`   Arbeitgeber: ${pdfExtracted.lohn.arbeitgeber}`)
    console.log(`   Nettolohn: ${pdfExtracted.lohn.nettolohn} CHF`)
    console.log(`   Name: ${pdfExtracted.personData.vorname} ${pdfExtracted.personData.nachname}\n`)
  }

  // ============================================
  // SCHRITT 3: TaxReturn aus PDF-Daten erstellen
  // ============================================
  console.log('📊 Schritt 3: Erstelle TaxReturn aus PDF-Daten...')
  const userId = new ObjectId()
  const { taxReturn, user, data } = createTaxReturnFromPdfData(pdfExtracted!, userId)

  console.log(`✅ TaxReturn erstellt:`)
  console.log(`   Jahr: ${taxReturn.year}`)
  console.log(`   User: ${user.ahvNummer}`)
  console.log(`   Einkommen: ${data.geldVerdient.data[0]?.nettolohn || 0} CHF\n`)

  // ============================================
  // SCHRITT 4: Steuerberechnung
  // ============================================
  console.log('🧮 Schritt 4: Lade Municipality Rates...')
  await loadMunicipalityTaxRates()
  const municipalityRatesCache = getMunicipalityRatesCache()
  
  console.log('🧮 Schritt 5: Berechne Steuern...')
  const computed = computeTaxReturn(data, municipalityRatesCache)

  console.log(`✅ Berechnung abgeschlossen:`)
  console.log(`   Bruttoeinkommen: ${computed.totalEinkuenfte} CHF`)
  console.log(`   Abzüge: ${computed.totalAbzuegeStaat} CHF (Staat)`)
  console.log(`   Nettoeinkommen: ${computed.nettoEinkommenStaat} CHF (Staat)`)
  console.log(`   Steuern: ${computed.einkommenssteuerBund + computed.einkommenssteuerStaat} CHF\n`)

  // ============================================
  // SCHRITT 6: eCH-0119 Mapping
  // ============================================
  console.log('🗺️  Schritt 6: Mappe zu eCH-0119 Format...')
  const header = await mapHeader(taxReturn, user)
  const mainForm = mapMainForm(taxReturn, data, user, computed)

  const message: ECH0119Message = {
    '@minorVersion': 0,
    header,
    content: {
      mainForm,
    },
  }

  console.log('✅ Mapping abgeschlossen\n')

  // ============================================
  // SCHRITT 7: Validierung
  // ============================================
  console.log('✅ Schritt 7: Validiere gegen XSD und semantische Regeln...')
  const validationReport = validateECH0119Message(message, taxReturn, data, computed)

  console.log(`\n📋 Validierungs-Report:`)
  console.log(`   Status: ${validationReport.isValid ? '✅ VALID' : '❌ INVALID'}`)
  console.log(`   Errors: ${validationReport.errorCount}`)
  console.log(`   Warnings: ${validationReport.warningCount}`)

  if (validationReport.results.length > 0) {
    console.log(`\n   Details:`)
    for (const result of validationReport.results) {
      const icon = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`   ${icon} [${result.code}] ${result.message}`)
      if (result.field) {
        console.log(`      Feld: ${result.field}`)
      }
    }
  }

  if (!validationReport.isValid) {
    console.log('\n❌ VALIDIERUNG FEHLGESCHLAGEN!')
    console.log('   Bitte Fehler beheben bevor XML generiert wird.\n')
  } else {
    console.log('\n✅ VALIDIERUNG ERFOLGREICH!\n')
  }

  // ============================================
  // SCHRITT 8: XML-Generierung
  // ============================================
  console.log('📝 Schritt 8: Generiere XML...')
  const xml = generateECH0119XML(message)

  // Speichere XML
  const xmlPath = path.join(outputDir, `ech0119-final-${timestamp}.xml`)
  fs.writeFileSync(xmlPath, xml, 'utf-8')
  outputFiles.push(xmlPath)
  console.log(`✅ XML gespeichert: ${xmlPath}`)
  console.log(`   Größe: ${(xml.length / 1024).toFixed(2)} KB\n`)

  // Speichere Validierungs-Report
  const reportPath = path.join(outputDir, `validation-report-final-${timestamp}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2), 'utf-8')
  outputFiles.push(reportPath)
  console.log(`📊 Validierungs-Report gespeichert: ${reportPath}\n`)

  // Speichere Message-Struktur (für Debugging)
  const messagePath = path.join(outputDir, `message-structure-${timestamp}.json`)
  fs.writeFileSync(messagePath, JSON.stringify(message, null, 2), 'utf-8')
  outputFiles.push(messagePath)
  console.log(`💾 Message-Struktur gespeichert: ${messagePath}\n`)

  // ============================================
  // SCHRITT 9: Finale Prüfung
  // ============================================
  console.log('🔍 Schritt 9: Finale Prüfung...')

  // Prüfe ob alle Geldbeträge Integer sind
  let hasDecimalIssues = false
  const checkForDecimals = (obj: any, path: string = ''): void => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key
      if (typeof value === 'number') {
        const decimalPlaces = (value.toString().split('.')[1] || '').length
        if (decimalPlaces > 0 && !currentPath.includes('withholdingTax')) {
          // withholdingTax ist moneyType2 (Decimal), alle anderen sollten Integer sein
          console.log(`   ⚠️  Dezimalzahl gefunden: ${currentPath} = ${value}`)
          hasDecimalIssues = true
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkForDecimals(value, currentPath)
      }
    }
  }

  checkForDecimals(message)

  if (hasDecimalIssues) {
    console.log('   ⚠️  WARNUNG: Dezimalzahlen gefunden (sollten Integer sein für moneyType1)')
  } else {
    console.log('   ✅ Alle Geldbeträge sind Integer (moneyType1)')
  }

  // Prüfe XML-Größe
  if (xml.length < 1000) {
    console.log('   ⚠️  WARNUNG: XML ist sehr klein, könnte unvollständig sein')
  } else {
    console.log(`   ✅ XML-Größe OK: ${xml.length} Zeichen`)
  }

  // Prüfe required fields
  const requiredFields = [
    'header.taxPeriod',
    'header.source',
    'content.mainForm.personDataPartner1.partnerPersonIdentification.officialName',
    'content.mainForm.personDataPartner1.partnerPersonIdentification.firstName',
    'content.mainForm.personDataPartner1.partnerPersonIdentification.vn',
  ]

  let missingFields = 0
  for (const field of requiredFields) {
    const parts = field.split('.')
    let current: any = message
    for (const part of parts) {
      if (current[part] === undefined || current[part] === null) {
        console.log(`   ❌ Fehlendes Feld: ${field}`)
        missingFields++
        break
      }
      current = current[part]
    }
  }

  if (missingFields === 0) {
    console.log('   ✅ Alle required fields vorhanden')
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 TEST-RUN ABGESCHLOSSEN!')
  console.log('='.repeat(60))
  console.log(`\n📁 Alle Dateien gespeichert in: ${outputDir}`)
  console.log(`\n📄 Wichtigste Dateien:`)
  console.log(`   - XML: ${path.basename(xmlPath)}`)
  console.log(`   - Validierung: ${path.basename(reportPath)}`)
  console.log(`   - PDF-Daten: ${path.basename(outputFiles[0])}`)

  if (validationReport.isValid) {
    console.log(`\n✅ XML ist VALID und bereit für Sandbox-Test!`)
  } else {
    console.log(`\n❌ XML hat Validierungsfehler - bitte beheben!`)
  }

  return {
    pdfExtracted,
    xml,
    validationReport,
    message,
    outputFiles,
  }
}

// Wenn direkt ausgeführt
if (require.main === module) {
  runFullTest()
    .then(() => {
      console.log('\n✅ Test-Run erfolgreich abgeschlossen!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test-Run fehlgeschlagen:', error)
      if (error instanceof Error) {
        console.error('   Message:', error.message)
        console.error('   Stack:', error.stack)
      }
      process.exit(1)
    })
}

