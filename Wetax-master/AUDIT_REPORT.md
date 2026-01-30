# 🔍 Vollständiges Audit - Config-Änderungen

## Aktueller Zustand (app.json)

```json
{
  "owner": "wetax",
  "slug": "wetax", 
  "bundleIdentifier": "com.foronered.wetaxapp",
  "projectId": "5a6249be-cfe4-46e3-9239-a4b3463fdd04",  // ⚠️ NEU (durch eas init)
  "updates": {
    "enabled": true,  // ⚠️ GEÄNDERT (war false)
    "url": "https://u.expo.dev/abdc0624-1f1a-46bd-85ee-4acb9d0aa7b9"
  }
}
```

## Was wurde geändert (von mir)

### 1. app.json Änderungen:
- ✅ `owner`: `adeola93551` → `wetax` (zurückgesetzt)
- ⚠️ `updates.enabled`: `false` → `true` (für OTA)
- ⚠️ `updates.url`: Hinzugefügt
- ⚠️ `extra.eas.projectId`: Hinzugefügt (durch eas init)

### 2. eas.json Änderungen:
- ⚠️ `cli.version`: `16.26.0` → `>=16.26.0` (CLI-Kompatibilität)
- ✅ `development-adeola` Profil: Hinzugefügt (NEU, isoliert)

### 3. package.json Änderungen:
- ✅ Scripts hinzugefügt: `build:ios:adeola`, `start:adeola`, `update:adeola`

## Historische Änderungen (aus FIX_EXPO_ROUTING.md)

**Temporäre Expo Go Werte (sollten entfernt sein):**
- ❌ `scheme`: `wetax-dev-expo-unique` (sollte `wetax-app` sein)
- ❌ `slug`: `wetax-dev-expo-go-2025` (sollte `wetax` sein)
- ❌ `bundleIdentifier`: `com.foronered.wetaxapp.dev` (sollte `com.foronered.wetaxapp` sein)

**Aktueller Zustand:**
- ✅ `scheme`: `wetax-app` (korrekt)
- ✅ `slug`: `wetax` (korrekt)
- ✅ `bundleIdentifier`: `com.foronered.wetaxapp` (korrekt)

## Problem-Analyse

### EAS Credential-Mapping:
EAS verknüpft Credentials mit:
```
owner + slug + bundleIdentifier + projectId
```

**Aktueller State:**
- ✅ owner: `wetax` (korrekt)
- ✅ slug: `wetax` (korrekt)
- ✅ bundleIdentifier: `com.foronered.wetaxapp` (korrekt)
- ⚠️ projectId: `5a6249be-cfe4-46e3-9239-a4b3463fdd04` (NEU, nicht mit bestehenden Credentials verknüpft)

**Das Problem:**
- Apple Certificate existiert: ✅
- Apple Login verifiziert: ✅
- **ABER:** Credentials sind mit altem Projekt-State verknüpft
- Neues `projectId` = neue Credential-Mapping-Anfrage

## Lösung

### Option 1: Credentials für neues Projekt setzen (EMPFOHLEN)
```bash
eas credentials --platform ios
# Wähle: development-adeola oder "All"
# Folge Prompts
```

### Option 2: Updates zurücksetzen (falls nicht gewünscht)
```json
"updates": {
  "enabled": false  // Zurück auf false
}
```

### Option 3: CLI Version zurücksetzen
```json
"cli": {
  "version": "16.26.0"  // Zurück auf exakt
}
```

## Empfehlung

**BEHALTEN:**
- ✅ `owner`: `wetax` (korrekt)
- ✅ `slug`: `wetax` (korrekt)
- ✅ `bundleIdentifier`: `com.foronered.wetaxapp` (korrekt)
- ✅ `development-adeola` Profil (neu, isoliert)
- ✅ `projectId` (notwendig für EAS)

**ZURÜCKSETZEN (optional):**
- ⚠️ `updates.enabled`: `true` → `false` (falls OTA nicht gewünscht)
- ⚠️ `cli.version`: `>=16.26.0` → `16.26.0` (falls exakte Version nötig)

**HANDLUNG ERFORDERLICH:**
- 🔴 Credentials für neues Projekt setzen (einmalig)




