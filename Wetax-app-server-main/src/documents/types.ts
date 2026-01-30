/**
 * Document Types
 * 
 * Definiert die Types für Dokumenten-Verwaltung
 */

import { ObjectId } from 'mongodb'
import { ScanType } from '../enums'
import { LohnausweisScanT, BankkontoScanT } from '../types'

/**
 * Dokument-Metadaten
 */
export type Document = {
  _id: ObjectId
  taxReturnId: ObjectId
  userId: ObjectId
  year: number
  
  // Dokument-Metadaten
  documentType: ScanType | 'other'
  originalFileName: string
  mimeType: string
  fileSize: number
  
  // Speicherort
  storageType: 's3' | 'mongodb_gridfs' | 'local'
  storagePath: string // S3 Key oder GridFS ID
  
  // Scan-Ergebnisse
  extractedData?: LohnausweisScanT | BankkontoScanT | any
  scanStatus: 'pending' | 'processing' | 'completed' | 'failed'
  scanError?: string
  
  // eCH-0119 Zuordnung
  ech0119AttachmentId?: string // Referenz zum Attachment im eCH-0119 XML
  documentCanton?: string // "ZH", "BS", etc.
  documentCategory?: string // z.B. "Lohnausweis pro Arbeitgeber"
  
  // Metadaten
  uploadedAt: Date
  scannedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Dokument-Metadaten für Upload
 */
export interface DocumentMetadata {
  taxReturnId: string
  userId: string
  year: number
  documentType: ScanType | 'other'
  originalFileName: string
  mimeType: string
}

/**
 * Dokument-Speicher Interface
 */
export interface DocumentStorage {
  /**
   * Lädt ein Dokument hoch
   */
  upload(buffer: Buffer, metadata: DocumentMetadata): Promise<string> // returns storagePath
  
  /**
   * Lädt ein Dokument herunter
   */
  download(storagePath: string): Promise<Buffer>
  
  /**
   * Löscht ein Dokument
   */
  delete(storagePath: string): Promise<void>
  
  /**
   * Generiert eine signierte URL für temporären Zugriff
   */
  getUrl(storagePath: string, expiresIn?: number): Promise<string>
  
  /**
   * Prüft ob ein Dokument existiert
   */
  exists(storagePath: string): Promise<boolean>
}

