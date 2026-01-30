/**
 * Kanton-Registry Initialisierung
 * 
 * Registriert alle unterstützten Kantone
 */

import { CantonRegistry } from './registry'
import { zurichConfig } from './zurich'

// Registriere alle Kantone
CantonRegistry.register(zurichConfig)

// Weitere Kantone können hier hinzugefügt werden:
// import { baselStadtConfig } from './basel-stadt'
// CantonRegistry.register(baselStadtConfig)

export { CantonRegistry } from './registry'
export * from './types'
export * from './detection'
export { zurichConfig } from './zurich'

