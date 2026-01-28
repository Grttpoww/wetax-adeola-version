import { AzureOpenAI } from 'openai'
import { scanTypeToGptPrompt } from '../constants'
import { ScanType } from '../enums'

/**
 * Azure OpenAI Integration
 */

export interface AzureOpenAIConfig {
    apiVersion?: string
    endpoint?: string
    apiKey?: string
}

/**
 * Create Azure OpenAI client with configuration
 */
const createAzureClient = (config?: AzureOpenAIConfig): AzureOpenAI => {
    return new AzureOpenAI({
        apiVersion: config?.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
        endpoint: config?.endpoint || process.env.AZURE_OPENAI_ENDPOINT || 'https://wetax-openai.openai.azure.com/',
        apiKey: config?.apiKey || process.env.AZURE_OPENAI_KEY,
    })
}

/**
 * Transform extracted data using Azure OpenAI GPT-4o
 */
export const transformWithAzureLLM = async <T extends ScanType>(
    kvData: { [key: string]: string },
    type: T,
    targetSchema?: any,
    config?: AzureOpenAIConfig,
): Promise<any> => {
    const schemaJsonString = targetSchema
        ? JSON.stringify(targetSchema, null, 4)
        : 'Use the structure defined in the prompt'

    const prompt = `
You are an expert system for Swiss document parsing (Lohnausweis, Tax Documents, Bank Statements).
Map the following raw key-value data into the target JSON schema.
Follow these rules strictly:
- Return only valid JSON, no explanations or markdown.
- Map all amounts to numbers (float or int).
- Preserve date formats (YYYY.MM.DD).
- Use the schema exactly as given.

--- DOCUMENT TYPE ---
${type}

--- TARGET STRUCTURE ---
${scanTypeToGptPrompt[type]}

--- RAW EXTRACTED DATA ---
${JSON.stringify(kvData, null, 2)}

${targetSchema ? `--- EXACT TARGET JSON SCHEMA ---\n${schemaJsonString}` : ''}

Return the properly structured JSON based on the raw data and schema above.
`

    const client = createAzureClient(config)

    try {
        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_MODEL || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.0,
            max_tokens: 2048,
            response_format: { type: 'json_object' },
        })

        const llmOutput = response.choices[0]?.message?.content?.trim()

        if (!llmOutput) {
            throw new Error('No output from Azure OpenAI')
        }

        return JSON.parse(llmOutput)
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error('Error: Azure LLM returned invalid JSON')
            console.error('Raw LLM Output:', error.message)
            return targetSchema || {}
        }
        console.error('Error calling Azure OpenAI:', error)
        throw error
    }
}

/**
 * Parse PDF text using Azure OpenAI
 */
export const parsePdfTextWithAzure = async <T extends ScanType>(
    pdfText: string,
    type: T,
    config?: AzureOpenAIConfig,
): Promise<string> => {
    const prompt = `${scanTypeToGptPrompt[type]}

Here is the extracted text from a PDF document:

${pdfText}

Please analyze the extracted text and return the relevant information in the JSON structure specified above.`

    const client = createAzureClient(config)

    try {
        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_MODEL || 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.0,
            max_tokens: 2048,
        })

        return response.choices[0]?.message?.content || '{}'
    } catch (error) {
        console.error('Error calling Azure OpenAI for PDF text:', error)
        throw error
    }
}

/**
 * Parse image using Azure OpenAI Vision API
 */
export const parseImageWithAzure = async <T extends ScanType>(
    base64: string,
    mimeType: string,
    type: T,
    config?: AzureOpenAIConfig,
): Promise<string> => {
    const client = createAzureClient(config)

    try {
        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_MODEL || 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: scanTypeToGptPrompt[type],
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.0,
            max_tokens: 2048,
        })

        return response.choices[0]?.message?.content || '{}'
    } catch (error) {
        console.error('Error calling Azure OpenAI for image:', error)
        throw error
    }
}
