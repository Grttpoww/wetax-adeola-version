/**
 * Generates a sample eCH-0119 XML using the real app mapping + generator logic.
 *
 * IMPORTANT: This script intentionally does NOT hand-craft XML. It calls
 * `exportECH0119()` which uses `mappers.ts` + `xml-generator.ts`.
 */

import { readFileSync } from 'fs'
import path from 'path'
import { ObjectId } from 'mongodb'

import { exportECH0119 } from '../src/ech0119'
import { loadMunicipalityTaxRates } from '../src/data/municipalityTaxRates'
import type { TaxReturn, TaxReturnData, User } from '../src/types'

function main() {
  // Needed because `exportECH0119()` expects municipality rates cache to be loaded
  // (normally done at server startup).
  // Silence the loader's console.log so stdout is pure XML.
  const originalConsoleLog = console.log
  console.log = () => {}
  loadMunicipalityTaxRates()
  console.log = originalConsoleLog

  const taxReportPath = path.join(__dirname, '..', 'src', 'tests', 'taxReport.json')
  const taxReturnData = JSON.parse(readFileSync(taxReportPath, 'utf8')) as TaxReturnData

  // Ensure a few fields exist that our mapper currently looks for.
  // NOTE: `taxMunicipality` is referenced by mapper but not present in the current TaxReturnData type.
  ;(taxReturnData as any).personData = (taxReturnData as any).personData ?? { data: {} }
  ;(taxReturnData as any).personData.data = (taxReturnData as any).personData.data ?? {}
  ;(taxReturnData as any).personData.data.land = (taxReturnData as any).personData.data.land ?? 'schweiz'
  ;(taxReturnData as any).personData.data.taxMunicipality =
    (taxReturnData as any).personData.data.taxMunicipality ?? '261' // Zürich (example BFS)

  const user: User = {
    _id: new ObjectId(),
    created: new Date(),
    verificationCode: undefined,
    ahvNummer: '756.1234.5678.97',
    phoneNumber: '+41791234567',
    email: 'dummy@example.com',
    validated: true,
  }

  const taxReturn: TaxReturn = {
    _id: new ObjectId(),
    userId: user._id,
    year: 2024,
    created: new Date(),
    archived: false,
    data: taxReturnData,
  }

  const xml = exportECH0119(taxReturn, user)
  // Print to stdout so it can be copied into markdown easily.
  process.stdout.write(xml + '\n')
}

main()


