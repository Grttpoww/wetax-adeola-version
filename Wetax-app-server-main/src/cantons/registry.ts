/**
 * Kanton-Registry
 * 
 * Zentrale Registrierung aller unterstützten Kantone
 */

import { CantonConfig } from './types'

export class CantonRegistry {
  private static registry: Map<string, CantonConfig> = new Map()
  
  /**
   * Registriert einen Kanton
   */
  static register(canton: CantonConfig): void {
    if (!canton.code || !canton.name) {
      throw new Error('Canton code and name are required')
    }
    
    this.registry.set(canton.code.toUpperCase(), canton)
  }
  
  /**
   * Gibt die Konfiguration für einen Kanton zurück
   */
  static get(cantonCode: string): CantonConfig | undefined {
    return this.registry.get(cantonCode.toUpperCase())
  }
  
  /**
   * Gibt alle registrierten Kantone zurück
   */
  static getAll(): CantonConfig[] {
    return Array.from(this.registry.values())
  }
  
  /**
   * Prüft ob ein Kanton registriert ist
   */
  static has(cantonCode: string): boolean {
    return this.registry.has(cantonCode.toUpperCase())
  }
  
  /**
   * Gibt alle Kanton-Codes zurück
   */
  static getCodes(): string[] {
    return Array.from(this.registry.keys())
  }
}

