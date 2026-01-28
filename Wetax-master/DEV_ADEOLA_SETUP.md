# Dev-Adeola Setup - Isolierte Development-Umgebung

## ✅ Durchgeführte Änderungen

### 1. Git Branch erstellt
- **Branch**: `dev-adeola`
- **Status**: Aktiv und isoliert von main/master

### 2. Owner zurückgesetzt
- **app.json**: `"owner": "wetax"` (zurückgesetzt von adeola93551)
- **Grund**: Du bist jetzt Admin der wetax Organisation

### 3. EAS Build Profile erweitert
- **Neues Profil**: `development-adeola`
- **Konfiguration**:
  ```json
  {
    "developmentClient": true,
    "distribution": "internal",
    "ios": {
      "simulator": false
    },
    "channel": "dev-adeola"
  }
  ```
- **Isolation**: Vollständig getrennt von bestehenden Profilen

### 4. OTA Update Channel konfiguriert
- **Channel**: `dev-adeola`
- **Updates aktiviert**: `updates.enabled: true` in app.json
- **Hinweis**: Updates sind global aktiviert (notwendig für OTA), aber der Channel `dev-adeola` ist isoliert

### 5. Bestehende Konfiguration
- ✅ Alle bestehenden Build Profiles unverändert
- ✅ Alle bestehenden Channels unverändert
- ✅ Production/Preview/Development bleiben unberührt

---

## 📋 Exakte Änderungen (Diff-Style)

### `eas.json`
```diff
  "build": {
    ...
    "internal-apk": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
+   "development-adeola": {
+     "developmentClient": true,
+     "distribution": "internal",
+     "ios": {
+       "simulator": false
+     },
+     "channel": "dev-adeola"
+   }
  },
```

### `app.json`
```diff
    "owner": "wetax",
    ...
    "updates": {
-     "enabled": false
+     "enabled": true,
+     "fallbackToCacheTimeout": 0,
+     "url": "https://u.expo.dev/abdc0624-1f1a-46bd-85ee-4acb9d0aa7b9"
    }
```

---

## 🚀 Exakte Commands zum Ausführen

### 1. Dev Client Build (iOS)
```bash
cd Wetax-master
eas build --profile development-adeola --platform ios
```

### 2. Dev Client starten
```bash
cd Wetax-master
expo start --dev-client
```

### 3. OTA Update pushen
```bash
cd Wetax-master
eas update --channel dev-adeola --message "Your update message"
```

### 4. Build Status prüfen
```bash
cd Wetax-master
eas build:list --profile development-adeola
```

### 5. Update Status prüfen
```bash
cd Wetax-master
eas update:list --channel dev-adeola
```

---

## ✅ Validierungs-Checkliste (5 Punkte)

- [ ] **Branch aktiv**: `git branch` zeigt `* dev-adeola`
- [ ] **EAS Profile vorhanden**: `eas.json` enthält `development-adeola` Profil
- [ ] **Channel konfiguriert**: `eas.json` zeigt `"channel": "dev-adeola"` im Profil
- [ ] **Updates aktiviert**: `app.json` zeigt `"updates.enabled": true`
- [ ] **Dev Client funktioniert**: `expo start --dev-client` startet ohne Fehler

---

## 🔍 Verifikation

### Build Profile prüfen:
```bash
cat eas.json | grep -A 6 "development-adeola"
```

### Update Channel prüfen:
```bash
cat eas.json | grep "dev-adeola"
```

### Updates Status prüfen:
```bash
cat app.json | grep -A 4 "updates"
```

---

## ⚠️ Wichtige Hinweise

1. **Updates sind global aktiviert**: 
   - `updates.enabled: true` betrifft alle Channels
   - Aber: Jeder Channel ist isoliert (dev-adeola, preview, production)
   - Production/Preview Channels bleiben unverändert in ihrer Funktionalität

2. **Rückstandslos entfernbar**:
   - Branch löschen: `git branch -D dev-adeola`
   - Profil entfernen: `development-adeola` aus `eas.json` löschen
   - Updates deaktivieren: `updates.enabled: false` in `app.json`

3. **Keine Auswirkungen auf bestehende Builds**:
   - Alle bestehenden Profiles unverändert
   - Alle bestehenden Channels unverändert
   - Production/Preview/Development bleiben isoliert

---

## 📱 Workflow

1. **Erster Build**:
   ```bash
   eas build --profile development-adeola --platform ios
   ```

2. **App installieren** (nach Build-Completion)

3. **Dev Client starten**:
   ```bash
   expo start --dev-client
   ```

4. **OTA Updates pushen** (wenn Code geändert):
   ```bash
   eas update --channel dev-adeola --message "Fix: ..."
   ```

---

**Status**: ✅ Setup komplett und isoliert von bestehenden Builds



