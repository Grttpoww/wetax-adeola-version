import cors from 'cors'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import os from 'os'
import { RegisterRoutes } from '../build/routes'
import { connectDb } from './db'
import { parseImage, parsePdfText } from './api/openai'
import { ScanType } from './enums'
import { loadMunicipalityTaxRates } from './data/municipalityTaxRates'

// Import pdf libraries
const pdfParse = require('pdf-parse')
import { fromPath } from 'pdf2pic'

const app = express()

app.use(cors())
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '..')))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('dev'))

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      const error = new Error('Only PDF and image files are allowed') as any
      error.code = 'INVALID_FILE_TYPE'
      cb(error, false)
    }
  },
})

let deployed = new Date()

app.get('/', async (req, res) => {
  res.send(`wetax Server updated successfully!
  <br /><b>Latest commit:</b> ${process.env.commit_hash}
  <br /><b>Last deployed:</b> ${deployed}
  `)
})

// File upload endpoint for admin panel
app.post('/api/admin/upload-tax-pdf', upload.single('taxPdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { userId, year } = req.body

    // Convert PDF/image to base64 for OpenAI processing
    const base64Data = req.file.buffer.toString('base64')

    let extractedData: any = {}

    // Process with OpenAI if it's an image file
    if (req.file.mimetype.startsWith('image/')) {
      try {
        console.log('Processing image with OpenAI...')
        const aiResponse = await parseImage(base64Data, req.file.mimetype as any, ScanType.TaxDocument)

        // Try to parse the AI response
        try {
          extractedData = JSON.parse(aiResponse)
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON:', parseError)
          // Fallback: create a structured response with raw AI output
          extractedData = {
            rawAiResponse: aiResponse,
            extractedText: aiResponse,
            processingNote: 'AI response could not be parsed as structured JSON',
          }
        }
      } catch (aiError) {
        console.error('OpenAI processing error:', aiError)
        // Continue with minimal extracted data if AI fails
        extractedData = {
          processingError: aiError instanceof Error ? aiError.message : 'Unknown AI processing error',
          fileProcessed: true,
          aiProcessingFailed: true,
        }
      }
    } else if (req.file.mimetype === 'application/pdf') {
      // First try to extract text from PDF
      try {
        console.log('Attempting PDF text extraction...')
        const pdfData = await pdfParse(req.file.buffer)

        if (pdfData.text && pdfData.text.trim().length > 0) {
          console.log('PDF text extraction successful, extracted', pdfData.text.length, 'characters')

          // Process extracted text with OpenAI
          try {
            console.log('Processing PDF text with OpenAI...')
            const aiResponse = await parsePdfText(pdfData.text, ScanType.TaxDocument)

            try {
              extractedData = JSON.parse(aiResponse)
              extractedData.processingMethod = 'pdf_text_ai'
              extractedData.textLength = pdfData.text.length
              extractedData.pageCount = pdfData.numpages || 1
              extractedData.originalText = pdfData.text

              console.log('OpenAI PDF text processing completed successfully')
            } catch (parseError) {
              console.error('Failed to parse AI response as JSON:', parseError)
              extractedData = {
                rawAiResponse: aiResponse,
                extractedText: pdfData.text,
                processingNote: 'AI response could not be parsed as structured JSON',
                processingMethod: 'pdf_text_ai_parse_failed',
                textLength: pdfData.text.length,
                originalText: pdfData.text,
              }
            }
          } catch (aiError) {
            console.error('OpenAI PDF text processing error:', aiError)
            extractedData = {
              processingError:
                aiError instanceof Error ? aiError.message : 'Unknown AI processing error',
              extractedText: pdfData.text,
              textLength: pdfData.text.length,
              processingMethod: 'pdf_text_ai_failed',
              aiProcessingFailed: true,
              originalText: pdfData.text,
            }
          }

          console.log('Structured data extraction completed')
        } else {
          throw new Error('No text content found in PDF')
        }
      } catch (textExtractionError) {
        console.log('PDF text extraction failed, falling back to image conversion:', textExtractionError)

        // Fallback: Convert PDF to image for AI processing
        try {
          // Create temporary directory for PDF processing
          const tempDir = path.join(os.tmpdir(), 'wetax-pdf-' + Date.now())
          fs.mkdirSync(tempDir, { recursive: true })

          // Save PDF to temporary file
          const pdfPath = path.join(tempDir, 'uploaded.pdf')
          fs.writeFileSync(pdfPath, req.file.buffer)

          // Convert PDF (first page) to image using pdf2pic
          const convert = fromPath(pdfPath, {
            density: 300,
            saveFilename: 'page',
            savePath: tempDir,
            format: 'jpg',
            width: 1200,
            height: 1600,
          })

          const page1 = await convert(1) // convert first page only
          if (!page1.path) {
            throw new Error('PDF to image conversion did not return a valid file path')
          }
          const imageBuffer = fs.readFileSync(page1.path)
          const base64Data = imageBuffer.toString('base64')

          // Process with OpenAI
          console.log('Processing PDF-converted image with AI...')
          const aiResponse = await parseImage(base64Data, 'image/jpeg', ScanType.TaxDocument)

          try {
            extractedData = JSON.parse(aiResponse)
            extractedData.processingMethod = 'pdf_to_image_ai'
            extractedData.fallbackReason =
              textExtractionError instanceof Error
                ? textExtractionError.message
                : 'Text extraction failed'
          } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError)
            extractedData = {
              rawAiResponse: aiResponse,
              extractedText: aiResponse,
              processingNote: 'AI response could not be parsed as structured JSON',
              processingMethod: 'pdf_to_image_ai',
              fallbackReason:
                textExtractionError instanceof Error
                  ? textExtractionError.message
                  : 'Text extraction failed',
            }
          }

          // Clean up temporary files
          fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (pdfError) {
          console.error('PDF conversion error:', pdfError)
          extractedData = {
            processingError: pdfError instanceof Error ? pdfError.message : 'PDF conversion failed',
            documentType: 'pdf',
            processingNote:
              'Both text extraction and image conversion failed. Please try uploading as an image.',
            fileProcessed: false,
            processingMethod: 'failed',
            textExtractionError:
              textExtractionError instanceof Error
                ? textExtractionError.message
                : 'Text extraction failed',
          }
        }
      }
    }

    res.json({
      success: true,
      extractedData,
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
      userId,
      year: parseInt(year),
    })
  } catch (error) {
    console.error('File upload error:', error)
    res.status(500).json({ error: 'Failed to process uploaded file' })
  }
})

app.use(`/swagger.json`, express.static(path.join(__dirname, '../build/swagger.json')))

const apiRouter = express.Router()
RegisterRoutes(apiRouter)
app.use(`/api`, apiRouter)

const server = http.createServer(app)

const PORT = 3000

connectDb()
  .then(() => {
    // Load municipality tax rates cache at startup
    try {
      loadMunicipalityTaxRates()
      console.log('Municipality tax rates cache loaded successfully')
    } catch (error) {
      console.error('Failed to load municipality tax rates:', error)
      throw error // Fail fast - server should not start without tax rates
    }
  })
  .then(() => {
  server.listen(PORT, '0.0.0.0')
  console.log(`Server running on port ${PORT}`)
})
