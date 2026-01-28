import { ObjectId } from 'mongodb'
import { DEFAULT_TAX_RETURN_DATA } from '../constants'
import { db } from '../db'
import { Injected, TaxAmount, TaxReturn, TaxReturnData, User } from '../types'
import { parseImage } from './openai'
import { generateToken } from '../jwt'
import { sendCode } from '../twilio'
import fs from 'fs'
import { PDFDocument } from 'pdf-lib'

import {
  CreateTaxReturnBody,
  LoginBody,
  RegisterBody,
  ScanBody,
  ScanResponse,
  SubmitVerificationCodeBody,
  UpdateTaxReturnBody,
  UpdateUserDataBody,
} from './api.types'
import { computeTaxReturn } from '../computer'
import { pdfFields } from '../pdf'
import { computeTaxAmount } from '../computeTaxAmount'
import { computeDeductible } from '../computeDeductible'
import { calculateAnzahlArbeitstage } from '../util'
import { exportECH0119, validateECH0119Export } from '../ech0119'

export const getUser = async (injected: Injected) => {
  const returns = await db()
    .taxReturns.find({
      userId: injected.user._id,
      archived: false,
      $or: [{ validated: true }, { validated: { $exists: false } }]
    })
    .toArray()

  return {
    user: injected.user,
    returns,
  }
}

export const scan = async (body: ScanBody): Promise<ScanResponse> => {
  const data = await parseImage(body.data, body.mimeType, body.type)
  return {
    type: body.type,
    data: JSON.parse(data),
  }
}

// Function to add a new user
export const registerUser = async (
  params: RegisterBody,
): Promise<{ success: true; phoneNumber: string } | { error: string }> => {
  const orConditions: any[] = [{ ahvNummer: params.ahvNumber, validated: true }]
  if (params.email) {
    orConditions.push({ email: params.email.trim().toLowerCase(), validated: true })
  }
  const user = await db().users.findOne({ $or: orConditions })

  if (user) {
    return { error: 'AHV or email already registered. Please login.' }
  }

  // otherwise create a new user

  let code

  let phoneNumber = params.phoneNumber.replaceAll(' ', '')
  // Remove leading zeros
  phoneNumber = phoneNumber.replace(/^0+/, '')
  // Remove zeros after +91 or +41 country codes
  phoneNumber = phoneNumber.replace(/^(\+91)0+/, '$1').replace(/^(\+41)0+/, '$1')

  let email = params.email?.trim().toLowerCase()

  try {
    code = await sendCode(phoneNumber)
  } catch (err) {
    // return {
    //   error:
    //     'An error has occured when sending the verification code. Please validate that the phone number is correct.',
    // }
    code = '123456'
  }

  const newUser: User = {
    _id: new ObjectId(),
    created: new Date(),
    ahvNummer: params.ahvNumber,
    phoneNumber,
    email,
    verificationCode: code,
    validated: false,
    isActive: false,
  }

  await db().users.insertOne(newUser)

  return { success: true, phoneNumber }
}

export const updateUserData = async (params: UpdateUserDataBody, injected: Injected) => {
  await db().users.updateOne({ _id: injected.user._id }, { $set: { ...params } })
  return {}
}

export const archiveTaxReturn = async (taxReturnId: string, injected: Injected) => {
  await db().taxReturns.updateOne(
    { _id: new ObjectId(taxReturnId), userId: injected.user._id },
    { $set: { archived: true } },
  )
  return {}
}

export const createTaxReturn = async (params: CreateTaxReturnBody, injected: Injected) => {
  const taxReturn = {
    _id: new ObjectId(),
    userId: injected.user._id,
    year: params.year,
    created: new Date(),
    archived: false,
    validated: true,
    data: DEFAULT_TAX_RETURN_DATA,
  }

  await db().taxReturns.insertOne(taxReturn, { ignoreUndefined: true })

  return taxReturn
}

export const getTaxReturn = async (taxReturnId: string, injected: Injected) => {
  const taxReturn = await db().taxReturns.findOne({
    _id: new ObjectId(taxReturnId),
    userId: injected.user._id,
  })

  if (!taxReturn) {
    throw new Error('Tax return not found')
  }

  return taxReturn
}

export const updateTaxReturnData = async (
  taxReturnId: string,
  params: UpdateTaxReturnBody,
  injected: Injected,
) => {
  // Automatically calculate anzahlarbeitstage for geldVerdient entries
  if (params.data?.geldVerdient?.data && Array.isArray(params.data.geldVerdient.data)) {
    params.data.geldVerdient.data = params.data.geldVerdient.data.map((entry) => ({
      ...entry,
      // anzahlarbeitstage: calculateAnzahlArbeitstage(entry.von, entry.bis, entry.urlaubstage),
    }))
  }

  await db().taxReturns.updateOne(
    { _id: new ObjectId(taxReturnId), userId: injected.user._id },
    { $set: { ...params } },
    { ignoreUndefined: true },
  )
  return {}
}

export const loginUser = async (
  params: LoginBody,
): Promise<{ success: true; phoneNumber: string } | { error: string }> => {
  const user = await db().users.findOne({ ahvNummer: params.ahvNumber, validated: true })

  console.log('user', user)

  if (!user) {
    return { error: 'No validated account found for this AHV number.' }
  }
  // if (!user.isActive) {
  //   return { error: 'Your account is inactive. Please contact admin.' }
  // }

  let code

  try {
    code = await sendCode(user.phoneNumber)
  } catch (err) {
    // return {
    //   error: 'An error has occured when sending the verification code. Please try again.',
    // }
    code = '123456'
  }

  await db().users.updateOne({ _id: user._id }, { $set: { verificationCode: code } })

  return { success: true, phoneNumber: user.phoneNumber }
}

export const loginWithEmail = async (
  email: string,
): Promise<{ token: string; user: { user: User; returns: TaxReturn[] } } | { error: string }> => {
  console.log('email', email)
  if (!email) {
    return { error: 'Email is required for login.' }
  }

  const user = await db().users.findOne({ email, validated: true })

  if (!user) {
    return { error: 'No account found' }
  }

  // if (!user.isActive) {
  //   return { error: 'Your account is inactive. Please contact support.' }
  // }

  const token = await generateToken(user)
  await db().users.updateOne({ _id: user._id }, { $set: { validated: true } })

  const _user = await getUser({ user: user })

  return {
    token,
    user: _user,
  }
}

export const deleteAccount = async (
  injected: Injected,
): Promise<{ success: true } | { error: string }> => {
  const userId = injected.user._id

  const result = await db().users.updateOne({ _id: userId }, { $set: { isActive: true } })

  if (result.modifiedCount === 0) {
    return { error: 'Account not found or already deleted.' }
  }

  return { success: true }
}

export const submitVerificationCode = async (params: SubmitVerificationCodeBody) => {
  const user = await db().users.findOne({ ahvNummer: params.ahvNumber })

  if (!user) {
    return { error: 'Unexpected error has occured. Please restart app.' }
  }

  if (process.env.NODE_ENV !== 'development' && user.verificationCode !== params.code) {
    return { error: 'Code is incorrect.' }
  }

  const token = await generateToken(user)
  await db().users.updateOne({ _id: user._id }, { $set: { validated: true } })

  const _user = await getUser({ user: user })

  return {
    token,
    user: _user,
  }
}

export const formatNumberWithSpaces = (num: number | undefined) => {
  if (num === null || num === undefined) {
    return ''
  }
  const rounded = Math.round(num)
  return rounded.toString().split('').join(' ')
}

export const formatNumberWithExtraSpaces = (num: number | undefined) => {
  if (num === null || num === undefined) {
    return ''
  }
  const rounded = Math.round(num)
  return rounded.toString().split('').join('  ')
}
export const formatNumberWithDoubleSpaces = (num: number | undefined) => {
  if (num === null || num === undefined) {
    return ''
  }
  const rounded = Math.round(num)
  return rounded.toString().split('').join('   ')
}

export const formatNumberWithSpacesDecimal = (num: number | undefined) => {
  if (num === null || num === undefined) {
    return ''
  }
  const rounded = num.toFixed(2)
  return rounded.toString().split('').join(' ')
}

export const formatTextWithSpaces = (text: string | undefined) => {
  if (text === null || text === undefined) {
    return ''
  }
  return text.split('').join(' ')
}

export const formatTextWithExtraSpaces = (text: string | undefined) => {
  if (text === null || text === undefined) {
    return ''
  }
  return text.split('').join('  ')
}

export const generatePdf = async (taxReturnId: string, injected: Injected) => {
  const taxReturn = await db().taxReturns.findOne({ _id: new ObjectId(taxReturnId) })

  if (!taxReturn) {
    throw new Error('Tax return not found')
  }
  const year = taxReturn.year
  const municipalityRatesCache = getMunicipalityRatesCache()
  const computed = computeTaxReturn(taxReturn.data, municipalityRatesCache)

  // Debug: print all values available in context
  try {
    const contextForFields = { computed, data: taxReturn.data, user: injected.user, year }
    console.log('[PDF] Context available to field resolvers (user, data, computed)')
    console.dir(contextForFields, { depth: null })

    const allFieldValues: Record<string, string> = Object.fromEntries(
      Object.entries(pdfFields).map(([key, fn]) => {
        try {
          const value = fn(contextForFields)
          return [key, value ?? '']
        } catch (err) {
          return [key, `__ERROR__: ${(err as Error).message}`]
        }
      }),
    )

    console.log('[PDF] Evaluated pdfFields values (key -> value)')
    console.dir(allFieldValues, { depth: null })

    try {
      fs.writeFileSync('field-values.json', JSON.stringify(allFieldValues, null, 2))
    } catch { }
  } catch { }

  // Load an existing PDF document
  const formUrl = 'src/template.pdf' // Path to your PDF form
  const formPdfBytes = fs.readFileSync(formUrl)

  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(formPdfBytes)

  // Get the form containing all the fields
  const form = pdfDoc.getForm()

  // Mapping for fields that appear on multiple pages
  const multiPageFields = [
    { key: 'ahvNummer', page: 1, x: 173, y: 730 },
    { key: 'gemeinde', page: 1, x: 398, y: 730 },
    { key: 'vorname', page: 1, x: 173, y: 712 },
    { key: 'nachname', page: 1, x: 398, y: 712 },
    { key: 'ahvNummer', page: 2, x: 173, y: 758 },
    { key: 'gemeinde', page: 2, x: 398, y: 758 },
    { key: 'vorname', page: 2, x: 173, y: 740 },
    { key: 'nachname', page: 2, x: 398, y: 740 },
  ]

  // Mapping for fields that appear on single pages
  const fieldCoordinates = {
    // Page 1
    jahr: { page: 1, x: 52, y: 712, width: 100, height: 20 },
    bezeichungAusbildung1: { page: 1, x: 35, y: 635, width: 300, height: 20 },
    ausbildungKosten1: { page: 1, x: 398, y: 635, width: 100, height: 20 },
    bezeichungAusbildung2: { page: 1, x: 35, y: 620, width: 300, height: 20 },
    ausbildungKosten2: { page: 1, x: 398, y: 620, width: 100, height: 20 },
    bezeichungAusbildung3: { page: 1, x: 35, y: 605, width: 300, height: 20 },
    ausbildungKosten3: { page: 1, x: 398, y: 605, width: 100, height: 20 },
    totalAusbildungsKosten: { page: 1, x: 410, y: 310, width: 100, height: 20 },
    beitragArbeitgeber: { page: 1, x: 410, y: 282, width: 100, height: 20 },
    selbstgetrageneKostenAusbildung: { page: 1, x: 400, y: 260, width: 100, height: 20 },
    abzugAusbildungStaat: { page: 1, x: 400, y: 226, width: 100, height: 20 },
    abzugAusbildungBund: { page: 1, x: 400, y: 138, width: 100, height: 20 },

    // Page 2
    arbeitgeber: { page: 2, x: 220, y: 720, width: 200, height: 20 },
    arbeitsort: { page: 2, x: 220, y: 700, width: 200, height: 20 },
    oevArbeit: { page: 2, x: 415, y: 641, width: 100, height: 20 },
    veloArbeit: { page: 2, x: 428, y: 623, width: 100, height: 20 },
    autoMotorradArbeitsOrt1: { page: 2, x: 52, y: 560, width: 200, height: 20 },
    autoMotorradArbeitsOrt2: { page: 2, x: 52, y: 543, width: 200, height: 20 },
    anzahlArbeitstage1: { page: 2, x: 118, y: 560, width: 100, height: 20 },
    anzahlArbeitstage2: { page: 2, x: 118, y: 543, width: 200, height: 20 },
    anzahlKm1: { page: 2, x: 160, y: 560, width: 100, height: 20 },
    anzahlKm2: { page: 2, x: 160, y: 543, width: 200, height: 20 },
    fahrtenProTag1: { page: 2, x: 200, y: 560, width: 100, height: 20 },
    fahrtenProTag2: { page: 2, x: 200, y: 543, width: 200, height: 20 },
    anzahlKmProJahr1: { page: 2, x: 218, y: 560, width: 100, height: 20 },
    anzahlKmProJahr2: { page: 2, x: 218, y: 543, width: 200, height: 20 },
    rappenProKm1: { page: 2, x: 280, y: 560, width: 100, height: 20 },
    rappenProKm2: { page: 2, x: 280, y: 543, width: 200, height: 20 },
    totalAbzug1: { page: 2, x: 310, y: 560, width: 100, height: 20 },
    totalAbzug2: { page: 2, x: 310, y: 543, width: 100, height: 20 },
    autoMotorradArbeitTotal: { page: 2, x: 403, y: 550, width: 100, height: 20 },
    arbeitswegTotalStaat: { page: 2, x: 416, y: 527, width: 100, height: 20 },
    arbeitswegTotalBund: { page: 2, x: 519, y: 527, width: 100, height: 20 },
    essenVerbilligungenVomArbeitgeberStaat: { page: 2, x: 416, y: 475, width: 100, height: 20 },
    essenVerbilligungenVomArbeitgeberBund: { page: 2, x: 519, y: 475, width: 100, height: 20 },
    essenNichtVerbilligt: { page: 2, x: 416, y: 457, width: 100, height: 20 },
    schichtarbeit: { page: 2, x: 519, y: 457, width: 100, height: 20 },
    tageSchichtarbeit: { page: 2, x: 337, y: 422, width: 100, height: 20 },
    uebrigeAbzuegeBeruf: { page: 2, x: 405, y: 377, width: 100, height: 20 },
    auslagenNebenerwerb: { page: 2, x: 405, y: 357, width: 100, height: 20 },
    totalBerufsauslagenStaat: { page: 2, x: 404, y: 295, width: 100, height: 20 },
    totalBerufsauslagenBund: { page: 2, x: 506, y: 295, width: 100, height: 20 },
    fehlenOev: { page: 2, x: 534, y: 192, width: 200, height: 20 },
    ueber1h: { page: 2, x: 534, y: 180, width: 200, height: 20 },
    staendigeBenutzung: { page: 2, x: 534, y: 168, width: 200, height: 20 },
    krankOderGebrechlich: { page: 2, x: 534, y: 156, width: 200, height: 20 },
  }

  // First, draw fields that appear on multiple pages
  multiPageFields.forEach(({ key, page: pageNum, x, y }) => {
    const fn = pdfFields[key]
    if (fn) {
      const value = fn({ computed, data: taxReturn.data, user: injected.user, year })
      if (!!value) {
        const page = pdfDoc.getPages()[pageNum - 1] // PDF pages are 0-indexed
        page.drawText(value, {
          x,
          y,
          size: 10, // Adjust font size as needed
        })
      }
    }
  })

  // Then, draw single-page fields
  Object.entries(pdfFields).map(([key, fn]) => {
    const value = fn({ computed, data: taxReturn.data, user: injected.user, year }) // Pass year in context

    // Fix: Add type assertion to allow string indexing on fieldCoordinates
    if (!!value && fieldCoordinates.hasOwnProperty(key)) {
      const field = fieldCoordinates[key as keyof typeof fieldCoordinates]
      const page = pdfDoc.getPages()[(field.page ?? 0) - 1] // PDF pages are 0-indexed

      page.drawText(value, {
        x: field.x,
        y: field.y,
        size: 10, // Adjust font size as needed
      })
    }
  })

  // form.flatten()
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save()
  // Write the bytes to a new PDF file

  const fileName = `Steuererklärung.pdf`

  fs.writeFileSync(fileName, pdfBytes)
  return fileName
}

import { getMunicipalityRatesCache } from '../data/municipalityTaxRates'

export const getTaxAmount = (taxReturn: TaxReturn, injected: Injected): TaxAmount => {
  const grossIncome = Object.values(computeTaxAmount(taxReturn.data)).reduce(
    (acc, curr) => acc + curr,
    0,
  )

  const deductableAmount = Object.values(computeDeductible(taxReturn.data)).reduce(
    (acc, curr) => acc + curr,
    0,
  )

  const municipalityRatesCache = getMunicipalityRatesCache()
  const computed = computeTaxReturn(taxReturn.data, municipalityRatesCache)

  return {
    grossIncome,
    deductableAmount,
    taxableIncome: grossIncome - deductableAmount,
    totalTaxes:
      computed.einkommenssteuerBund + computed.einkommenssteuerStaat + computed.vermoegenssteuerCalc,
  }
}

export const getMunicipalities = (): {
  municipalities: Array<{
    bfsNumber: number
    name: string
    hasCompleteData: boolean
  }>
} => {
  const municipalityRatesCache = getMunicipalityRatesCache()
  
  // Convert Map to array, sort by name
  const municipalities = Array.from(municipalityRatesCache.values())
    .map((m) => ({
      bfsNumber: m.bfsNumber,
      name: m.name,
      hasCompleteData: m.definitiv === true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de-CH'))
  
  return { municipalities }
}

export const exportECH0119XML = async (taxReturnId: string, injected: Injected): Promise<string> => {
  const taxReturn = await db().taxReturns.findOne({ _id: new ObjectId(taxReturnId) })

  if (!taxReturn) {
    throw new Error('Tax return not found')
  }

  // Validate that user owns this tax return
  if (taxReturn.userId.toString() !== injected.user._id.toString()) {
    throw new Error('Tax return not found')
  }

  // Validate required fields
  validateECH0119Export(taxReturn, injected.user)

  // Generate XML
  const xml = exportECH0119(taxReturn, injected.user)

  return xml
}
