/**
 * Kantonale Extensions - Types
 * 
 * Definiert die Interfaces für modulare Kanton-Integration
 */

import { ECH0119Header, MainFormType } from '../ech0119/types'
import { TaxReturn, TaxReturnData } from '../types'

/**
 * Konfiguration für einen Kanton
 */
export interface CantonConfig {
  /** Kanton-Code (z.B. "ZH", "BS", "BE") */
  code: string
  
  /** Vollständiger Kantonsname */
  name: string
  
  /** eCH-0119 Namespace (falls kanton-spezifisch) */
  ech0119Namespace?: string
  
  /** eCH-0119 Schema-Version */
  ech0119SchemaVersion?: string
  
  /** Erforderliche Dokumente für diesen Kanton */
  requiredDocuments?: DocumentRequirement[]
  
  /** Optionale Dokumente */
  optionalDocuments?: DocumentRequirement[]
  
  /** Extension-Handler für kanton-spezifische Logik */
  extensionHandler?: CantonExtensionHandler
}

/**
 * Dokument-Anforderung für einen Kanton
 */
export interface DocumentRequirement {
  /** Kategorie (z.B. "lohnausweis", "bankkonto") */
  category: string
  
  /** eCH-0119 documentType */
  documentType: string
  
  /** Beschreibung für User */
  description: string
  
  /** Ist dieses Dokument erforderlich? */
  required: boolean
  
  /** Maximale Anzahl Dateien */
  maxFiles?: number
  
  /** Minimale Anzahl Dateien */
  minFiles?: number
}

/**
 * Handler für kanton-spezifische Erweiterungen
 */
export interface CantonExtensionHandler {
  /**
   * Erweitert den eCH-0119 Header mit kanton-spezifischen Daten
   */
  extendHeader?(
    header: ECH0119Header,
    taxReturn: TaxReturn
  ): ECH0119Header | Promise<ECH0119Header>
  
  /**
   * Erweitert das MainForm mit kanton-spezifischen Feldern
   */
  extendMainForm?(
    mainForm: MainFormType,
    data: TaxReturnData,
    taxReturn: TaxReturn
  ): MainFormType | Promise<MainFormType>
  
  /**
   * Validiert kanton-spezifische Regeln
   */
  validate?(
    taxReturn: TaxReturn,
    data: TaxReturnData
  ): ValidationResult[] | Promise<ValidationResult[]>
  
  /**
   * Mappt Dokument-Kategorien zu eCH-0119 documentType
   */
  mapDocumentType?(category: string): string
  
  /**
   * Bestimmt welche Dokumente für diese Steuererklärung erforderlich sind
   */
  getRequiredDocuments?(
    taxReturn: TaxReturn,
    data: TaxReturnData
  ): DocumentRequirement[]
}

/**
 * Validierungs-Ergebnis
 */
export interface ValidationResult {
  /** Fehler-Code */
  code: string
  
  /** Fehler-Meldung */
  message: string
  
  /** Betroffenes Feld (optional) */
  field?: string
  
  /** Schweregrad */
  severity: 'error' | 'warning' | 'info'
}

