/**
 * Verarbeitet Test-Lohnausweis PDF und vergleicht mit Testdaten
 */

import fs from 'fs'
import path from 'path'
import { parseImage } from '../api/openai'
import { ScanType } from '../enums'
import { LohnausweisScanT } from '../types'

/**
 * Liest PDF-Datei und konvertiert zu Base64
 */
function readPdfAsBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath)
  return fileBuffer.toString('base64')
}

/**
 * Vergleicht extrahierte Daten mit Testdaten
 */
function compareData(
  extracted: LohnausweisScanT,
  expected: {
    vorname: string
    nachname: string
    geburtsdatum: string
    adresse: string
    plz: number
    stadt: string
    arbeitgeber: string
    nettolohn: number
  }
): {
  matches: boolean
  differences: Array<{ field: string; extracted: any; expected: any }>
} {
  const differences: Array<{ field: string; extracted: any; expected: any }> = []

  // Personendaten vergleichen
  if (extracted.personData.vorname?.toLowerCase() !== expected.vorname.toLowerCase()) {
    differences.push({
      field: 'personData.vorname',
      extracted: extracted.personData.vorname,
      expected: expected.vorname,
    })
  }

  if (extracted.personData.nachname?.toLowerCase() !== expected.nachname.toLowerCase()) {
    differences.push({
      field: 'personData.nachname',
      extracted: extracted.personData.nachname,
      expected: expected.nachname,
    })
  }

  // Geburtsdatum vergleichen (Format kann variieren)
  const extractedDate = extracted.personData.geburtsdatum?.replace(/\./g, '.')
  const expectedDate = expected.geburtsdatum
  if (extractedDate !== expectedDate) {
    differences.push({
      field: 'personData.geburtsdatum',
      extracted: extractedDate,
      expected: expectedDate,
    })
  }

  // Adresse vergleichen
  if (extracted.personData.adresse?.toLowerCase() !== expected.adresse.toLowerCase()) {
    differences.push({
      field: 'personData.adresse',
      extracted: extracted.personData.adresse,
      expected: expected.adresse,
    })
  }

  // PLZ vergleichen
  const extractedPlz = extracted.personData.plz
  if (extractedPlz !== expected.plz) {
    differences.push({
      field: 'personData.plz',
      extracted: extractedPlz,
      expected: expected.plz,
    })
  }

  // Stadt vergleichen
  if (extracted.personData.stadt?.toLowerCase() !== expected.stadt.toLowerCase()) {
    differences.push({
      field: 'personData.stadt',
      extracted: extracted.personData.stadt,
      expected: expected.stadt,
    })
  }

  // Arbeitgeber vergleichen
  if (extracted.lohn.arbeitgeber?.toLowerCase() !== expected.arbeitgeber.toLowerCase()) {
    differences.push({
      field: 'lohn.arbeitgeber',
      extracted: extracted.lohn.arbeitgeber,
      expected: expected.arbeitgeber,
    })
  }

  // Nettolohn vergleichen (mit Toleranz von 1 CHF)
  const extractedNettolohn = extracted.lohn.nettolohn
  if (Math.abs(extractedNettolohn - expected.nettolohn) > 1) {
    differences.push({
      field: 'lohn.nettolohn',
      extracted: extractedNettolohn,
      expected: expected.nettolohn,
    })
  }

  return {
    matches: differences.length === 0,
    differences,
  }
}

/**
 * Hauptfunktion: Verarbeitet Test-Lohnausweis
 */
export async function processTestLohnausweis(): Promise<void> {
  console.log('🔍 Suche nach Test-Lohnausweis PDFs...')

  const dataDir = path.join(process.cwd(), 'src', 'data')
  const pdfFiles = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith('.pdf') && file.toLowerCase().includes('lohn'))

  if (pdfFiles.length === 0) {
    console.error('❌ Keine Lohnausweis-PDFs im data-Ordner gefunden!')
    return
  }

  console.log(`✅ Gefunden: ${pdfFiles.length} PDF(s)`)
  for (const pdfFile of pdfFiles) {
    console.log(`  - ${pdfFile}`)
  }

  // Erwartete Testdaten (aus test-export.ts)
  const expectedData = {
    vorname: 'Test',
    nachname: 'User',
    geburtsdatum: '21.01.2001',
    adresse: 'Teststrasse 42',
    plz: 8001,
    stadt: 'Zürich',
    arbeitgeber: 'Test AG',
    nettolohn: 15000,
  }

  console.log('\n📄 Erwartete Daten:')
  console.log(JSON.stringify(expectedData, null, 2))

  // Verarbeite jedes PDF
  for (const pdfFile of pdfFiles) {
    console.log(`\n🔄 Verarbeite: ${pdfFile}...`)

    try {
      const pdfPath = path.join(dataDir, pdfFile)
      const base64 = readPdfAsBase64(pdfPath)

      console.log('📤 Sende an OpenAI/Textract Pipeline...')
      const jsonString = await parseImage(base64, 'application/pdf', ScanType.Lohnausweis)

      console.log('📥 Antwort erhalten, parse JSON...')
      const extracted: LohnausweisScanT = JSON.parse(jsonString)

      console.log('\n✅ Extrahierte Daten:')
      console.log(JSON.stringify(extracted, null, 2))

      // Vergleiche Daten
      console.log('\n🔍 Vergleiche mit erwarteten Daten...')
      const comparison = compareData(extracted, expectedData)

      if (comparison.matches) {
        console.log('✅ Alle Daten stimmen überein!')
      } else {
        console.log('⚠️  Unterschiede gefunden:')
        for (const diff of comparison.differences) {
          console.log(`  - ${diff.field}:`)
          console.log(`      Extracted: ${diff.extracted}`)
          console.log(`      Expected:  ${diff.expected}`)
        }
      }

      // Speichere extrahierte Daten
      const outputDir = path.join(process.cwd(), 'test-exports')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputPath = path.join(
        outputDir,
        `extracted-lohnausweis-${pdfFile.replace('.pdf', '')}-${timestamp}.json`
      )
      fs.writeFileSync(outputPath, JSON.stringify(extracted, null, 2), 'utf-8')
      console.log(`\n💾 Extrahierte Daten gespeichert: ${outputPath}`)

      // Speichere Vergleichs-Report
      const reportPath = path.join(
        outputDir,
        `comparison-report-${pdfFile.replace('.pdf', '')}-${timestamp}.json`
      )
      fs.writeFileSync(
        reportPath,
        JSON.stringify(
          {
            pdfFile,
            expected: expectedData,
            extracted,
            comparison,
          },
          null,
          2
        ),
        'utf-8'
      )
      console.log(`📊 Vergleichs-Report gespeichert: ${reportPath}`)
    } catch (error) {
      console.error(`❌ Fehler beim Verarbeiten von ${pdfFile}:`, error)
      if (error instanceof Error) {
        console.error('   Message:', error.message)
        console.error('   Stack:', error.stack)
      }
    }
  }
}

// Wenn direkt ausgeführt
if (require.main === module) {
  processTestLohnausweis()
    .then(() => {
      console.log('\n✅ Verarbeitung abgeschlossen!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Verarbeitung fehlgeschlagen:', error)
      process.exit(1)
    })
}

