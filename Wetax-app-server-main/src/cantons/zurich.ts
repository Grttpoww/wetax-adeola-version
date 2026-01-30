/**
 * Zürich Kanton-Konfiguration
 * 
 * Definiert die spezifischen Anforderungen und Erweiterungen für den Kanton Zürich
 */

import { CantonConfig, DocumentRequirement } from './types'
import { ECH0119Header, MainFormType } from '../ech0119/types'
import { TaxReturn, TaxReturnData } from '../types'

/**
 * Dokument-Typen für Zürich (gemäss eCH-0119 ZH Extension)
 */
const ZH_DOCUMENT_TYPES: Record<string, string> = {
  lohnausweis: 'Lohnausweis(e) pro Arbeitgeber',
  lohnausweis_nebenerwerb: 'Lohnausweise Nebenerwerb',
  bankkonto: 'Bankauszüge',
  geschaeftsabschluss: 'Geschäftsabschluss sowie Auszüge sämtlicher Privat- und Eigenkapitalkonten',
  ahv_rente: 'Bescheinigung(en)/Rentenausweis(e) AHV-/IV-Renten',
  pensionskasse: 'Bescheinigung(en)/Rentenausweis(e) Renten/Pensionen',
  // ... weitere gemäss ZH XSD
}

/**
 * Erforderliche Dokumente für Zürich
 */
const requiredDocuments: DocumentRequirement[] = [
  {
    category: 'lohnausweis',
    documentType: ZH_DOCUMENT_TYPES.lohnausweis,
    description: 'Lohnausweis(e) für alle Arbeitgeber im Steuerjahr',
    required: true,
  },
]

/**
 * Optionale Dokumente für Zürich
 */
const optionalDocuments: DocumentRequirement[] = [
  {
    category: 'bankkonto',
    documentType: ZH_DOCUMENT_TYPES.bankkonto,
    description: 'Bankauszüge für Konten mit Zinserträgen über 200 CHF',
    required: false,
  },
  {
    category: 'ahv_rente',
    documentType: ZH_DOCUMENT_TYPES.ahv_rente,
    description: 'Bescheinigung(en) über AHV-/IV-Renten',
    required: false,
  },
  // ... weitere
]

/**
 * Zürich Extension Handler
 */
const zurichExtensionHandler = {
  /**
   * Mappt Dokument-Kategorien zu ZH-spezifischen documentType
   */
  mapDocumentType: (category: string): string => {
    return ZH_DOCUMENT_TYPES[category] || category
  },
  
  /**
   * Erweitert Header mit ZH-spezifischen Daten
   */
  extendHeader: (header: ECH0119Header, taxReturn: TaxReturn): ECH0119Header => {
    // ZH-spezifische Header-Erweiterungen: documentList mit Dummy-Belege-Pfaden
    // Diese Belege werden als angelegt betrachtet (nur Pfad im XML)
    
    const documentList: Array<{
      documentIdentification: {
        documentCanton: string;
        documentType: string;
      };
      attachmentFile: Array<{
        pathFileName: string;
        internalSortOrder: number;
      }>;
    }> = []
    
    // Verwende Attachments aus header.attachment (bereits von mapAttachments erstellt)
    if (header.attachment && header.attachment.length > 0) {
      for (const attachment of header.attachment) {
        if (attachment.documentIdentification && attachment.file && attachment.file.length > 0) {
          documentList.push({
            documentIdentification: {
              documentCanton: attachment.documentIdentification.documentCanton || 'ZH',
              documentType: attachment.documentIdentification.documentType,
            },
            attachmentFile: attachment.file.map((file, index) => ({
              pathFileName: file.pathFileName,
              internalSortOrder: file.internalSortOrder || index + 1,
            })),
          })
        }
      }
    }
    
    // Fallback: Lohnausweise (Hauptberuf + Nebenerwerb) - falls nicht in attachments
    if (!documentList.some(doc => doc.documentIdentification.documentType === 'Lohnausweis(e) pro Arbeitgeber')) {
      const lohnausweiseFiles: Array<{ pathFileName: string; internalSortOrder: number }> = []
      taxReturn.data.geldVerdient?.data?.forEach((entry, index) => {
        if (entry.uploadedLohnausweis) {
          lohnausweiseFiles.push({
            pathFileName: `documents/${taxReturn._id}/lohnausweis_${entry.arbeitgeber?.replace(/\s+/g, '_')}_${index}.pdf`,
            internalSortOrder: index + 1,
          })
        }
      })
      
      if (lohnausweiseFiles.length > 0) {
        documentList.push({
          documentIdentification: {
            documentCanton: 'ZH',
            documentType: 'Lohnausweis(e) pro Arbeitgeber',
          },
          attachmentFile: lohnausweiseFiles,
        })
      }
    }
    
    // Fallback: Bankauszüge (wenn Zinserträge > 200 CHF) - falls nicht in attachments
    if (!documentList.some(doc => doc.documentIdentification.documentType === 'Bankauszüge')) {
      const bankauszuegeFiles: Array<{ pathFileName: string; internalSortOrder: number }> = []
      taxReturn.data.bankkonto?.data?.forEach((konto, index) => {
        if (konto.zinsUeber200 && konto.zinsbetrag && konto.zinsbetrag > 200) {
          bankauszuegeFiles.push({
            pathFileName: `documents/${taxReturn._id}/bankauszug_${konto.bankGesellschaft?.replace(/\s+/g, '_')}_${index}.pdf`,
            internalSortOrder: index + 1,
          })
        }
      })
      
      if (bankauszuegeFiles.length > 0) {
        documentList.push({
          documentIdentification: {
            documentCanton: 'ZH',
            documentType: 'Bankauszüge',
          },
          attachmentFile: bankauszuegeFiles,
        })
      }
    }
    
    return {
      ...header,
      cantonExtension: {
        canton: 'ZH',
        // @ts-ignore - documentList ist Teil der ZH Extension (xs:any)
        documentList: documentList.length > 0 ? documentList : undefined,
      },
    }
  },
  
  /**
   * Erweitert MainForm mit ZH-spezifischen Feldern
   */
  extendMainForm: (
    mainForm: MainFormType,
    data: TaxReturnData,
    taxReturn: TaxReturn
  ): MainFormType => {
    // ZH-spezifische MainForm-Erweiterungen
    // z.B. zusätzliche Felder, spezielle Berechnungen, etc.
    
    return {
      ...mainForm,
      cantonExtension: {
        canton: 'ZH',
        // Weitere ZH-spezifische Felder
      },
    }
  },
  
  /**
   * Validiert ZH-spezifische Regeln
   */
  validate: (
    taxReturn: TaxReturn,
    data: TaxReturnData
  ): Array<{ code: string; message: string; severity: 'error' | 'warning' | 'info' }> => {
    const errors: Array<{ code: string; message: string; severity: 'error' | 'warning' | 'info' }> = []
    
    // Beispiel: Prüfen ob Lohnausweise vorhanden sind
    const hasLohnausweise = data.geldVerdient?.data?.some(
      (entry) => entry.uploadedLohnausweis === true
    )
    
    if (!hasLohnausweise && data.geldVerdient?.data && data.geldVerdient.data.length > 0) {
      errors.push({
        code: 'ZH_MISSING_LOHNAUSWEIS',
        message: 'Für Zürich müssen Lohnausweise hochgeladen werden',
        severity: 'warning',
      })
    }
    
    // Weitere ZH-spezifische Validierungen...
    
    return errors
  },
  
  /**
   * Bestimmt erforderliche Dokumente basierend auf Steuererklärung
   */
  getRequiredDocuments: (
    taxReturn: TaxReturn,
    data: TaxReturnData
  ): DocumentRequirement[] => {
    const docs: DocumentRequirement[] = [...requiredDocuments]
    
    // Dynamisch weitere Dokumente hinzufügen basierend auf Daten
    // z.B. wenn Nebenerwerb vorhanden, dann lohnausweis_nebenerwerb erforderlich
    
    if (data.geldVerdient?.data && data.geldVerdient.data.length > 1) {
      // Mehrere Arbeitgeber = möglicherweise Nebenerwerb
      docs.push({
        category: 'lohnausweis_nebenerwerb',
        documentType: ZH_DOCUMENT_TYPES.lohnausweis_nebenerwerb,
        description: 'Lohnausweise für Nebenerwerb',
        required: false, // Optional, aber empfohlen
      })
    }
    
    return docs
  },
}

/**
 * Zürich Kanton-Konfiguration
 */
export const zurichConfig: CantonConfig = {
  code: 'ZH',
  name: 'Zürich',
  ech0119Namespace: 'http://www.ech.ch/xmlns/eCH-0119/4',
  ech0119SchemaVersion: '4.0.0',
  requiredDocuments,
  optionalDocuments,
  extensionHandler: zurichExtensionHandler,
}

