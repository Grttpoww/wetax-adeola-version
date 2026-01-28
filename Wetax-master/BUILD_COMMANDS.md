# Build Commands - TestFlight Build

**Datum:** 2026-01-24  
**Build-Profil:** `development-adeola`  
**Zweck:** Terminal-Commands für TestFlight Build

---

## ⚠️ WICHTIG: Build-Profil

**IMMER das Profil `development-adeola` verwenden!**

Dieses Profil:
- ✅ Verwendet das korrekte Development-Profil
- ✅ Verhindert Kollisionen mit anderen Builds
- ✅ Hat `autoIncrement: true` (Build-Nummer wird automatisch erhöht)
- ✅ Verwendet `channel: "dev-adeola"` (isoliert von anderen Channels)

---

## 📋 Pre-Build Checkliste

Vor dem Build ausführen:

```bash
# 1. Navigate to project root
cd "C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master"

# 2. Prüfe, dass du im richtigen Branch bist
git status

# 3. Führe Sanity Checks aus (siehe BUILD_SANITY_CHECKS.md)
# Quick Check:
grep "apiUrl" app.json
grep "OpenAPI.BASE" src/shared/openapi.ts
grep "autoIncrement" eas.json

# 4. Prüfe Build-Nummer (sollte automatisch erhöht werden durch autoIncrement: true)
grep "buildNumber" app.json
```

---

## 🚀 Build-Commands

### Option 1: Cloud Build (Empfohlen)

**Build auf EAS-Servern:**

```bash
# Navigate to project root
cd "C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master"

# Build für iOS mit development-adeola Profil
eas build --platform ios --profile development-adeola
```

**Was passiert:**
1. EAS erstellt einen Build auf ihren Servern
2. Build-Nummer wird automatisch erhöht (wegen `autoIncrement: true`)
3. Build wird zu TestFlight hochgeladen (wegen `distribution: "store"`)

**Vorteile:**
- ✅ Keine lokale Xcode-Installation nötig
- ✅ Schneller (EAS-Server sind optimiert)
- ✅ Automatische Build-Nummer-Inkrementierung

---

### Option 2: Local Build (Falls Cloud Build nicht funktioniert)

**Build lokal auf deinem Mac:**

```bash
# Navigate to project root
cd "C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master"

# Build lokal für iOS mit development-adeola Profil
eas build --platform ios --profile development-adeola --local
```

**Voraussetzungen:**
- ✅ Xcode installiert
- ✅ Apple Developer Account konfiguriert
- ✅ Signing Certificates vorhanden

**Nachteile:**
- ⚠️ Langsamer (lokal)
- ⚠️ Benötigt Xcode
- ⚠️ Build-Nummer muss manuell erhöht werden (falls `autoIncrement` nicht funktioniert)

---

## 📤 Submit zu TestFlight

**Nach erfolgreichem Build:**

```bash
# Navigate to project root
cd "C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master"

# Submit latest build zu TestFlight
eas submit --platform ios --profile development-adeola --latest
```

**Was passiert:**
1. EAS findet den neuesten Build für `development-adeola`
2. Build wird zu TestFlight hochgeladen
3. Build wird automatisch verarbeitet

**Alternative (falls `--latest` nicht funktioniert):**
```bash
# Submit mit spezifischer Build-ID
eas submit --platform ios --profile development-adeola --id <BUILD_ID>
```

---

## 🔍 Build-Status prüfen

**Während des Builds:**

```bash
# Prüfe Build-Status
eas build:list --platform ios --profile development-adeola --limit 5
```

**Output zeigt:**
- Build-ID
- Status (in_progress, finished, errored)
- Build-Nummer
- Erstellungsdatum

---

## 🐛 Troubleshooting

### Problem: Build schlägt fehl

**1. Prüfe Build-Logs:**
```bash
# Zeige Logs für letzten Build
eas build:view --latest
```

**2. Prüfe EAS-Konfiguration:**
```bash
# Prüfe, ob EAS CLI installiert ist
eas --version

# Prüfe, ob du eingeloggt bist
eas whoami

# Falls nicht eingeloggt:
eas login
```

**3. Prüfe Apple Developer Account:**
```bash
# Prüfe Credentials
eas credentials
```

---

### Problem: Build-Nummer Kollision

**Symptom:** "Build number already exists"

**Lösung:**
1. Prüfe `eas.json`: `autoIncrement: true` sollte gesetzt sein
2. Falls nicht, manuell in `app.json` erhöhen:
   ```json
   "ios": {
     "buildNumber": "27"  // Erhöhe um 1
   }
   ```

---

### Problem: Falsches Profil verwendet

**Symptom:** Build verwendet `production` statt `development-adeola`

**Lösung:**
```bash
# Stelle sicher, dass Profil explizit angegeben ist
eas build --platform ios --profile development-adeola

# NICHT:
eas build --platform ios  # ← Verwendet default Profil!
```

---

## 📊 Build-Informationen

### Aktuelle Konfiguration:

**Profil:** `development-adeola`  
**Build-Nummer:** `26` (wird automatisch erhöht durch `autoIncrement: true`)  
**Channel:** `dev-adeola`  
**Distribution:** `store` (TestFlight)  
**API URL:** `https://wetaxorg.ch` (aus `app.json.extra.apiUrl`)

---

## ✅ Post-Build Checkliste

Nach erfolgreichem Build:

- [ ] **Build erfolgreich:**
  - [ ] Build-Status ist `finished`
  - [ ] Keine Fehler in Build-Logs

- [ ] **Submit erfolgreich:**
  - [ ] Build wurde zu TestFlight hochgeladen
  - [ ] Build wird in TestFlight verarbeitet

- [ ] **TestFlight:**
  - [ ] Build erscheint in TestFlight
  - [ ] Build-Nummer ist korrekt (nicht 25, sondern höher)
  - [ ] Build kann getestet werden

- [ ] **Funktionalität:**
  - [ ] App startet ohne Crash
  - [ ] Login funktioniert (kein Freeze)
  - [ ] API-Calls gehen zu `https://wetaxorg.ch`
  - [ ] Municipalities Feature funktioniert
  - [ ] Kinderabzüge Feature funktioniert

---

## 🚨 Wenn Build fehlschlägt

1. **Prüfe Build-Logs:**
   ```bash
   eas build:view --latest
   ```

2. **Prüfe Sanity Checks:**
   - Siehe `BUILD_SANITY_CHECKS.md`

3. **Prüfe Debugging Guide:**
   - Siehe `BUILD_DEBUGGING_GUIDE.md`

4. **Prüfe EAS-Status:**
   ```bash
   eas whoami
   eas credentials
   ```

---

## 📝 Wichtige Notizen

### Build-Profil `development-adeola`:

- ✅ **Isoliert:** Verwendet eigenen Channel (`dev-adeola`)
- ✅ **Auto-Increment:** Build-Nummer wird automatisch erhöht
- ✅ **Store Distribution:** Kann zu TestFlight hochgeladen werden
- ✅ **Development Client:** Ermöglicht Hot Reload (falls nötig)

### Build-Nummer:

- **Aktuell:** `26` (in `app.json`)
- **Auto-Increment:** `true` (in `eas.json`)
- **Nächster Build:** Wird automatisch zu `27` erhöht

### API-URL:

- **Konfiguriert in:** `app.json.extra.apiUrl = "https://wetaxorg.ch"`
- **Verwendet in:** `src/shared/openapi.ts` via `Constants.default?.expoConfig?.extra?.apiUrl`
- **Fallback:** `API_URL` (nur für Development)

---

## 🎯 Quick Reference

```bash
# 1. Navigate to project
cd "C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master"

# 2. Build
eas build --platform ios --profile development-adeola

# 3. Submit
eas submit --platform ios --profile development-adeola --latest

# 4. Status prüfen
eas build:list --platform ios --profile development-adeola --limit 5
```

---

**WICHTIG:** Immer `--profile development-adeola` verwenden, um Kollisionen zu vermeiden!



