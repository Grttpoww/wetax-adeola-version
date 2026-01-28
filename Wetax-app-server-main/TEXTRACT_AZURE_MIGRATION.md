# AWS Textract + Azure OpenAI Migration

This document outlines the migration from direct OpenAI to AWS Textract + Azure OpenAI pipeline for document parsing.

## Overview

The new architecture uses a two-step process:

1. **AWS Textract** - Extracts key-value pairs and form data from documents
2. **Azure OpenAI (GPT-4o)** - Transforms extracted data into structured JSON

This approach provides:

- Better OCR accuracy with AWS Textract
- More reliable structured data extraction
- Fallback to Azure Vision API when Textract doesn't find form data
- Cost optimization by using Textract for extraction and Azure OpenAI for transformation

## Architecture

```
Document (PDF/Image)
    ↓
[AWS Textract - Form Analysis]
    ↓
Key-Value Pairs (raw)
    ↓
[Preprocessing - Key Mapping]
    ↓
Cleaned Key-Value Pairs
    ↓
[Azure OpenAI GPT-4o - Transformation]
    ↓
Structured JSON Output
```

### Fallback Strategy

- If Textract returns no data → Use Azure Vision API directly
- If Azure Vision API fails → Throw error
- For PDFs → Extract text first, then use Azure OpenAI

## Files Created/Modified

### New Files

1. **`src/api/textract.ts`** - AWS Textract integration

   - `analyzeDocumentSync()` - Analyzes documents for FORMS
   - `getKvMap()` - Parses Textract blocks into key-value pairs
   - `preprocessKvData()` - Cleans and normalizes extracted data

2. **`src/api/azure-openai.ts`** - Azure OpenAI integration
   - `transformWithAzureLLM()` - Transforms extracted data to structured JSON
   - `parsePdfTextWithAzure()` - Parses PDF text using Azure OpenAI
   - `parseImageWithAzure()` - Direct image parsing with Azure Vision API

### Modified Files

1. **`src/api/openai.ts`** - Updated to use new pipeline
   - Now orchestrates Textract + Azure OpenAI
   - Maintains backward compatibility with `parsePdfText()` function

## Installation

### 1. Install Required Dependencies

```bash
npm install @aws-sdk/client-textract
# or
yarn add @aws-sdk/client-textract
```

### 2. Environment Variables

Add the following to your `.env` file:

```bash
# AWS Configuration
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Azure OpenAI Configuration
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://wetax-openai.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_MODEL=gpt-4o
```

### 3. AWS Credentials

Ensure AWS credentials are configured. You can use:

- Environment variables (as above)
- AWS credentials file (`~/.aws/credentials`)
- IAM role (if running on AWS)

Required AWS permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["textract:AnalyzeDocument", "textract:DetectDocumentText"],
      "Resource": "*"
    }
  ]
}
```

## Usage

The API remains unchanged - the `parseImage()` function works the same way:

```typescript
import { parseImage } from './api/openai'
import { ScanType } from './enums'

// Parse a Lohnausweis document
const base64Image = '...' // base64 encoded image
const result = await parseImage(base64Image, 'image/png', ScanType.Lohnausweis)

const parsedData = JSON.parse(result)
```

## Key Differences from Python Implementation

1. **TypeScript** - Strongly typed interfaces
2. **AWS SDK v3** - Using `@aws-sdk/client-textract` (modular)
3. **Error Handling** - Multiple fallback layers
4. **Environment Config** - Uses process.env with defaults

## Testing

Test with a sample document:

```typescript
// Test script
import fs from 'fs'
import { parseImage } from './src/api/openai'
import { ScanType } from './src/enums'

const testImage = fs.readFileSync('./test.png')
const base64 = testImage.toString('base64')

parseImage(base64, 'image/png', ScanType.Lohnausweis)
  .then((result) => {
    console.log('✅ Success:', JSON.parse(result))
  })
  .catch((error) => {
    console.error('❌ Error:', error)
  })
```

## Cost Optimization

- **Textract**: ~$0.05 per page for form analysis
- **Azure OpenAI**: ~$0.01-0.03 per request (GPT-4o)
- **Total**: ~$0.06-0.08 per document

Compared to direct Vision API (~$0.05-0.10 per document), this provides:

- Better accuracy
- Structured form extraction
- More reliable results

## Troubleshooting

### Textract Returns No Data

- Check AWS credentials are valid
- Ensure document has clear form structure
- Falls back to Azure Vision API automatically

### Azure OpenAI Errors

- Verify `AZURE_OPENAI_KEY` is set correctly
- Check endpoint URL matches your Azure resource
- Ensure model deployment name matches configuration

### PDF Parsing Issues

- Verify `pdf-parse` is installed
- Check PDF is not encrypted/password protected
- Some scanned PDFs may need OCR preprocessing

## Future Enhancements

1. **Async Processing** - Use Textract async API for large documents
2. **Caching** - Cache Textract results to avoid re-processing
3. **Batch Processing** - Process multiple documents in parallel
4. **Table Extraction** - Add Textract TABLES feature for tabular data
5. **Multi-page PDFs** - Handle documents with multiple pages

## Migration Checklist

- [x] Create `textract.ts` helper module
- [x] Create `azure-openai.ts` helper module
- [x] Update `openai.ts` to use new pipeline
- [ ] Install `@aws-sdk/client-textract` package
- [ ] Configure AWS credentials
- [ ] Configure Azure OpenAI environment variables
- [ ] Test with sample documents
- [ ] Update API documentation
- [ ] Monitor costs and performance

## Support

For issues or questions:

1. Check AWS Textract logs in CloudWatch
2. Verify Azure OpenAI deployment status
3. Review console logs for detailed error messages
4. Check network connectivity to AWS and Azure endpoints
