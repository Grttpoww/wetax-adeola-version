import { ScanType } from '../enums'
import { MimeType } from './api.types'
import { analyzeDocumentSync, preprocessKvData } from './textract'
import { transformWithAzureLLM, parsePdfTextWithAzure, parseImageWithAzure } from './azure-openai'
const pdfParse = require('pdf-parse')

/**
 * Main document parsing function using AWS Textract + Azure OpenAI pipeline
 */
export const parseImage = async <T extends ScanType>(
  base64: string,
  mimeType: MimeType,
  type: T,
): Promise<string> => {
  // Convert base64 to buffer
  const documentBuffer = Buffer.from(base64, 'base64')

  // Handle PDF files with text extraction
  if (mimeType === 'application/pdf') {
    try {
      // Extract text from PDF
      const pdfData = await pdfParse(documentBuffer)
      const pdfText = pdfData.text

      // Use Azure OpenAI to parse the PDF text
      return parsePdfTextWithAzure(pdfText, type)
    } catch (error) {
      console.error('Error parsing PDF:', error)
      throw error
    }
  }

  // For images (PNG, JPEG): Use Textract + Azure OpenAI pipeline
  try {
    console.log(`Processing ${type} document with Textract + Azure OpenAI...`)

    // Step 1: Extract key-value pairs using AWS Textract
    const rawKvData = await analyzeDocumentSync(documentBuffer)

    if (!rawKvData || Object.keys(rawKvData).length === 0) {
      console.warn('Textract returned no data, falling back to Azure Vision API')
      // Fallback to direct Azure OpenAI Vision API if Textract fails
      return parseImageWithAzure(base64, mimeType, type)
    }

    console.log('✅ Textract extraction complete. Key-value pairs extracted:', Object.keys(rawKvData).length)

    // Step 2: Preprocess the extracted data
    const processedKvData = preprocessKvData(rawKvData)

    // Step 3: Transform using Azure OpenAI LLM
    const structuredJson = await transformWithAzureLLM(processedKvData, type)

    console.log('✅ Azure OpenAI transformation complete')

    return JSON.stringify(structuredJson)
  } catch (error) {
    console.error('Error in Textract + Azure OpenAI pipeline:', error)

    // Final fallback: try Azure Vision API directly
    console.log('Attempting fallback to Azure Vision API...')
    try {
      return parseImageWithAzure(base64, mimeType, type)
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      throw error
    }
  }
}

/**
 * Legacy function for parsing PDF text (kept for compatibility)
 * Now uses Azure OpenAI instead of direct OpenAI
 */
export const parsePdfText = async <T extends ScanType>(
  pdfText: string,
  type: T,
): Promise<string> => {
  return parsePdfTextWithAzure(pdfText, type)
}
