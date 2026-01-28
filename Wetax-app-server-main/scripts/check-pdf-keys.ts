import fs from 'fs'
import { PDFDocument } from 'pdf-lib'
import { pdfFields } from '../src/pdf'
;(async () => {
  const formUrl = 'src/template.pdf'
  const pdfBytes = fs.readFileSync(formUrl)
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const form = pdfDoc.getForm()
  const fields = form.getFields().map((f) => f.getName())
  const fieldSet = new Set(fields)

  const keys = Object.keys(pdfFields)
  const missingInPdf = keys.filter((k) => !fieldSet.has(k))
  const unusedInCode = fields.filter((f) => !keys.includes(f))

  console.log('Missing in PDF (defined in code):', missingInPdf)
  console.log('Present in PDF but not in code:', unusedInCode)
})()
