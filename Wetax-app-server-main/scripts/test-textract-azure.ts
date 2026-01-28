/**
 * Test script for AWS Textract + Azure OpenAI pipeline
 * 
 * This script demonstrates how to use the new document parsing pipeline
 */

import fs from 'fs'
import path from 'path'
import { parseImage } from '../src/api/openai'
import { ScanType } from '../src/enums'

// Load environment variables
require('dotenv').config()

async function testDocumentParsing() {
    console.log('🚀 Testing AWS Textract + Azure OpenAI Pipeline\n')

    // Check required environment variables
    const requiredEnvVars = [
        'AWS_REGION',
        'AZURE_OPENAI_KEY',
        'AZURE_OPENAI_ENDPOINT',
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:')
        missingVars.forEach(varName => console.error(`   - ${varName}`))
        console.error('\nPlease set these in your .env file')
        process.exit(1)
    }

    console.log('✅ Environment variables configured')
    console.log(`   AWS Region: ${process.env.AWS_REGION}`)
    console.log(`   Azure Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`)
    console.log(`   Azure Model: ${process.env.AZURE_OPENAI_MODEL || 'gpt-4o'}`)
    console.log('')

    // Test file path - update this to your test file
    const testFilePath = path.join(__dirname, '..', 'test-document.png')

    if (!fs.existsSync(testFilePath)) {
        console.error(`❌ Test file not found: ${testFilePath}`)
        console.log('\nPlease provide a test document (PNG, JPG, or PDF)')
        console.log('Place it in the scripts directory or update the testFilePath variable')
        process.exit(1)
    }

    console.log(`📄 Test file: ${path.basename(testFilePath)}`)

    try {
        // Read the test file
        const fileBuffer = fs.readFileSync(testFilePath)
        const base64 = fileBuffer.toString('base64')

        // Determine mime type
        const ext = path.extname(testFilePath).toLowerCase()
        let mimeType: 'image/png' | 'image/jpeg' | 'application/pdf'

        if (ext === '.png') {
            mimeType = 'image/png'
        } else if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg'
        } else if (ext === '.pdf') {
            mimeType = 'application/pdf'
        } else {
            throw new Error(`Unsupported file type: ${ext}`)
        }

        console.log(`📋 MIME Type: ${mimeType}`)
        console.log(`📊 File Size: ${(fileBuffer.length / 1024).toFixed(2)} KB`)
        console.log('\n⏳ Processing document...\n')

        // Parse the document
        const startTime = Date.now()
        const result = await parseImage(base64, mimeType, ScanType.Lohnausweis)
        const endTime = Date.now()

        console.log(`\n✅ Processing complete in ${((endTime - startTime) / 1000).toFixed(2)}s\n`)

        // Parse and display results
        const parsedData = JSON.parse(result)
        console.log('📦 Structured Output:')
        console.log(JSON.stringify(parsedData, null, 2))

        // Save results to file
        const outputPath = path.join(__dirname, '..', 'test-output.json')
        fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2))
        console.log(`\n💾 Results saved to: ${outputPath}`)

        // Display summary
        console.log('\n📊 Summary:')
        if (parsedData.personData) {
            console.log(`   Name: ${parsedData.personData.vorname || 'N/A'} ${parsedData.personData.nachname || 'N/A'}`)
            console.log(`   AHV: ${parsedData.personData.ahvNummmer || 'N/A'}`)
            console.log(`   Geburtsdatum: ${parsedData.personData.geburtsdatum || 'N/A'}`)
        }
        if (parsedData.lohn) {
            console.log(`   Bruttolohn: CHF ${parsedData.lohn.bruttolohn || 'N/A'}`)
            console.log(`   Nettolohn: CHF ${parsedData.lohn.nettolohn || 'N/A'}`)
            console.log(`   Arbeitgeber: ${parsedData.lohn.arbeitgeber || 'N/A'}`)
        }

        console.log('\n✅ Test completed successfully!')

    } catch (error) {
        console.error('\n❌ Error during processing:')
        if (error instanceof Error) {
            console.error(`   ${error.message}`)
            if (error.stack) {
                console.error('\nStack trace:')
                console.error(error.stack)
            }
        } else {
            console.error(error)
        }
        process.exit(1)
    }
}

// Run the test
testDocumentParsing().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
})
