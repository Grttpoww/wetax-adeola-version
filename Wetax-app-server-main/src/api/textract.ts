import {
    TextractClient,
    AnalyzeDocumentCommand,
    Block,
    FeatureType,
} from '@aws-sdk/client-textract'

/**
 * AWS Textract Helper Functions
 */

interface KeyValuePair {
    [key: string]: string
}

interface BlockMap {
    [id: string]: Block
}

/**
 * Parses Textract Blocks to build a simple Key-Value map for forms
 */
export const getKvMap = (blocks: Block[]): KeyValuePair => {
    const keyMap: { [id: string]: Block } = {}
    const valueMap: { [id: string]: Block } = {}
    const blockMap: BlockMap = {}

    // Build block map
    for (const block of blocks) {
        if (block.Id) {
            blockMap[block.Id] = block
        }
    }

    const getTextFromChildren = (blockId: string): string => {
        let text = ''
        const block = blockMap[blockId]

        if (block && block.Relationships) {
            for (const relationship of block.Relationships) {
                if (relationship.Type === 'CHILD' && relationship.Ids) {
                    for (const childId of relationship.Ids) {
                        const childBlock = blockMap[childId]
                        if (childBlock) {
                            if (childBlock.BlockType === 'WORD' && childBlock.Text) {
                                text += childBlock.Text + ' '
                            } else if (
                                childBlock.BlockType === 'SELECTION_ELEMENT' &&
                                childBlock.SelectionStatus === 'SELECTED'
                            ) {
                                text += ' (Checked) '
                            }
                        }
                    }
                }
            }
        }

        return text.trim()
    }

    // Separate KEY and VALUE blocks
    for (const [blockId, block] of Object.entries(blockMap)) {
        if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes) {
            if (block.EntityTypes.includes('KEY')) {
                keyMap[blockId] = block
            } else if (block.EntityTypes.includes('VALUE')) {
                valueMap[blockId] = block
            }
        }
    }

    // Build key-value pairs
    const kvPairs: KeyValuePair = {}

    for (const [keyId, keyBlock] of Object.entries(keyMap)) {
        const keyText = getTextFromChildren(keyId)
        let valueText = ''

        if (keyBlock.Relationships) {
            for (const relationship of keyBlock.Relationships) {
                if (relationship.Type === 'VALUE' && relationship.Ids) {
                    for (const valueId of relationship.Ids) {
                        valueText = getTextFromChildren(valueId)
                        break
                    }
                }
            }
        }

        if (keyText && valueText) {
            kvPairs[keyText.trim()] = valueText
        }
    }

    return kvPairs
}

/**
 * Performs synchronous document analysis (FORMS) on a document
 */
export const analyzeDocumentSync = async (
    documentBytes: Buffer,
    regionName: string = 'eu-central-1',
): Promise<KeyValuePair | null> => {
    try {
        const client = new TextractClient({ region: regionName })

        console.log('Analyzing document with Textract for FORMS...')

        const command = new AnalyzeDocumentCommand({
            Document: { Bytes: documentBytes },
            FeatureTypes: [FeatureType.FORMS],
        })

        const response = await client.send(command)

        if (!response.Blocks) {
            console.error('No blocks returned from Textract')
            return null
        }

        return getKvMap(response.Blocks)
    } catch (error) {
        console.error('Error calling Textract:', error)
        return null
    }
}

/**
 * Preprocess raw key-value pairs for consistency
 */
export const preprocessKvData = (kvData: KeyValuePair): KeyValuePair => {
    const processedData = { ...kvData }

    const keyMappings: { [key: string]: string } = {
        'on DR': 'Beschäftigungsperiode_von',
        'DE .': 'Beschäftigungsperiode_bis',
        'DE.': 'Beschäftigungsperiode_bis',
        'Jahr Annés Anne': 'Jahr',
        'AHV-Nr. No AVS N.AVS': 'AHV_Nummer',
        'Geburtsdetum Date DE naissance Data of neadta': 'Geburtsdatum',
        '8. Bruttolohn total / Rente Salaire brut total Rente Salario lordo totale / Rendita':
            'Bruttolohn_total',
        '9. Beiträge AHV/IV/ED/ALV/NBUV Cotisations AVS/AVAPG/AC/AANP Contributi AVS/AVIPG/AD/AINP':
            'Beiträge_AHV_IV',
        '11. Nettolohn/Rente Salaire net/Rente Salario netto/Rendita': 'Nettolohn',
        'Ort und Datum Lieu et date Luogo e data': 'Ausstellungsort_und_Datum',
        '15. Bemerkungen Observations Osservazioni': 'Bemerkungen',
        '2.1 Verpflegung, Unterkunft Pension, logement Vitto, alloggio':
            'Verpflegung_Unterkunft',
    }

    for (const [oldKey, newKey] of Object.entries(keyMappings)) {
        if (oldKey in processedData) {
            processedData[newKey] = processedData[oldKey]
        }
    }

    return processedData
}
