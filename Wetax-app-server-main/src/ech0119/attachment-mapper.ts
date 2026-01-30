/**
 * Attachment Mapper für eCH-0119
 * 
 * Mappt Dokumente zu eCH-0119 AttachmentType[]
 */

import { AttachmentType, AttachmentFileType, DocumentIdentificationType } from './types'
import { TaxReturn } from '../types'
import { Document } from '../documents/types'
import { CantonRegistry } from '../cantons'

/**
 * Gruppiert Lohnausweise nach Arbeitgeber
 */
function groupLohnausweiseByArbeitgeber(
  documents: Document[]
): Map<string, Document[]> {
  const grouped = new Map<string, Document[]>()
  
  for (const doc of documents) {
    if (doc.documentType === 'Lohnausweis' && doc.extractedData) {
      const arbeitgeber = doc.extractedData.lohn?.arbeitgeber || 'Unbekannt'
      
      if (!grouped.has(arbeitgeber)) {
        grouped.set(arbeitgeber, [])
      }
      
      grouped.get(arbeitgeber)!.push(doc)
    }
  }
  
  return grouped
}

/**
 * Gruppiert Dokumente nach Kategorie
 */
function groupDocumentsByCategory(
  documents: Document[]
): Map<string, Document[]> {
  const grouped = new Map<string, Document[]>()
  
  for (const doc of documents) {
    const category = doc.documentCategory || doc.documentType
    if (!grouped.has(category)) {
      grouped.set(category, [])
    }
    grouped.get(category)!.push(doc)
  }
  
  return grouped
}

/**
 * Mappt Dokumente zu eCH-0119 AttachmentType[]
 */
export function mapAttachments(
  taxReturn: TaxReturn,
  documents: Document[],
  canton: string = 'ZH'
): AttachmentType[] {
  const attachments: AttachmentType[] = []
  const cantonConfig = CantonRegistry.get(canton)
  
  // Lohnausweise gruppieren nach Arbeitgeber
  const lohnausweiseByArbeitgeber = groupLohnausweiseByArbeitgeber(documents)
  
  for (const [arbeitgeber, docs] of lohnausweiseByArbeitgeber.entries()) {
    const documentType = cantonConfig?.extensionHandler?.mapDocumentType?.('lohnausweis') 
      || 'Lohnausweis(e) pro Arbeitgeber'
    
    attachments.push({
      title: `Lohnausweis(e) ${arbeitgeber}`,
      documentFormat: getDocumentFormat(docs[0]),
      documentIdentification: {
        documentCanton: canton,
        documentType,
      },
      file: docs.map((doc, index) => ({
        pathFileName: doc.storagePath,
        internalSortOrder: index + 1,
      })),
      cantonExtension: cantonConfig ? { canton } : undefined,
    })
  }
  
  // Weitere Dokument-Kategorien
  const otherDocuments = documents.filter(
    (doc) => doc.documentType !== 'Lohnausweis'
  )
  const documentsByCategory = groupDocumentsByCategory(otherDocuments)
  
  for (const [category, docs] of documentsByCategory.entries()) {
    const documentType = cantonConfig?.extensionHandler?.mapDocumentType?.(category)
      || category
    
    attachments.push({
      title: getDocumentTitle(category, docs),
      documentFormat: getDocumentFormat(docs[0]),
      documentIdentification: {
        documentCanton: canton,
        documentType,
      },
      file: docs.map((doc, index) => ({
        pathFileName: doc.storagePath,
        internalSortOrder: index + 1,
      })),
      cantonExtension: cantonConfig ? { canton } : undefined,
    })
  }
  
  return attachments
}

/**
 * Bestimmt das Dokument-Format aus MIME-Type
 */
function getDocumentFormat(document: Document): string {
  // eCH-0119 erwartet spezifische Formate
  const mimeToFormat: Record<string, string> = {
    'application/pdf': 'application/pdf',
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/jpg': 'image/jpeg',
  }
  
  return mimeToFormat[document.mimeType] || document.mimeType
}

/**
 * Generiert einen Titel für ein Dokument
 */
function getDocumentTitle(category: string, documents: Document[]): string {
  if (documents.length === 1) {
    return documents[0].originalFileName || category
  }
  
  return `${category} (${documents.length} Dateien)`
}

