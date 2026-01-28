const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')

// Simple test to verify PDF text extraction
async function testPdfExtraction() {
  try {
    // Create a simple test to check if pdf-parse works
    console.log('Testing PDF text extraction functionality...')

    // Check if pdf-parse is working
    const testBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \n0000000301 00000 n \n0000000380 00000 n \n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n492\n%%EOF',
    )

    try {
      const result = await pdfParse(testBuffer)
      console.log('✅ PDF text extraction is working!')
      console.log('Sample extraction result:', {
        textLength: result.text ? result.text.length : 0,
        pages: result.numpages || 'unknown',
        hasText: !!result.text,
      })

      if (result.text) {
        console.log('Extracted text preview:', result.text.substring(0, 100))
      }
    } catch (error) {
      console.log('❌ PDF text extraction test failed:', error.message)
    }

    console.log('\nPDF extraction patterns test...')

    // Test our extraction patterns
    const sampleTaxText = `
      Steuerveranlagung 2023
      
      Persönliche Angaben:
      Name: Max Mustermann
      AHV-Nummer: 756.123.456.78
      Geburtsdatum: 15.03.1985
      E-Mail: max.mustermann@example.com
      
      Einkommen:
      Lohn: 85'000.00 CHF
      Arbeitgeber: Musterfirma AG
      
      Steuern:
      Bundessteuer: 2'150.00 CHF
      Staatssteuer: 4'200.00 CHF
      Total Steuer: 6'350.00 CHF
    `

    // Import our extraction function (simplified version for testing)
    function testExtractTaxDataFromText(pdfText) {
      const extractedData = {
        personalInfo: {},
        income: {},
        taxes: {},
        extractedFields: [],
      }

      const patterns = {
        ahvNumber: /(\d{3}\.\d{3}\.\d{3}\.\d{2})/,
        salary: /(?:lohn|gehalt|einkommen)[:\s]*(\d{1,3}(?:'\d{3})*(?:\.\d{2})?)/i,
        federalTax: /(?:bundessteuer)[:\s]*(\d{1,3}(?:'\d{3})*(?:\.\d{2})?)/i,
        stateTax: /(?:staatssteuer)[:\s]*(\d{1,3}(?:'\d{3})*(?:\.\d{2})?)/i,
        totalTax: /(?:total.*steuer)[:\s]*(\d{1,3}(?:'\d{3})*(?:\.\d{2})?)/i,
        email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
        birthDate: /(?:geburtsdatum)[:\s]*(\d{1,2}\.\d{1,2}\.\d{4})/i,
      }

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = pdfText.match(pattern)
        if (match) {
          extractedData.extractedFields.push({
            field: key,
            value: match[1],
          })

          switch (key) {
            case 'ahvNumber':
              extractedData.personalInfo.ahvNumber = match[1]
              break
            case 'salary':
              extractedData.income.salary = parseFloat(match[1].replace(/'/g, ''))
              break
            case 'federalTax':
              extractedData.taxes.federalTax = parseFloat(match[1].replace(/'/g, ''))
              break
            case 'stateTax':
              extractedData.taxes.stateTax = parseFloat(match[1].replace(/'/g, ''))
              break
            case 'totalTax':
              extractedData.taxes.totalTax = parseFloat(match[1].replace(/'/g, ''))
              break
            case 'email':
              extractedData.personalInfo.email = match[1]
              break
            case 'birthDate':
              extractedData.personalInfo.birthDate = match[1]
              break
          }
        }
      }

      return extractedData
    }

    const extractionResult = testExtractTaxDataFromText(sampleTaxText)
    console.log('✅ Text pattern extraction test completed:')
    console.log('Extracted fields:', extractionResult.extractedFields.length)
    console.log('Sample extractions:', {
      ahvNumber: extractionResult.personalInfo.ahvNumber,
      salary: extractionResult.income.salary,
      federalTax: extractionResult.taxes.federalTax,
      email: extractionResult.personalInfo.email,
    })
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testPdfExtraction()
