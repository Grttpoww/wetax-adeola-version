# Apple Server Error - Lösung

## Problem:
Apple Developer Portal gibt "internal server error" zurück beim Login.

## Status:
- ✅ Projekt korrekt verknüpft: `@wetax/wetax-app`
- ✅ Slug korrekt: `wetax-app`
- ✅ Bundle ID korrekt: `com.foronered.wetaxapp`
- ❌ Apple Server Error beim Credential-Setup

## Lösungsansätze:

### Option 1: Warten und erneut versuchen
Apple's Server-Fehler sind meist temporär. In 10-15 Minuten erneut versuchen:
```bash
eas credentials --platform ios
```

### Option 2: Bestehendes `development` Profil verwenden
Das `development` Profil hat auch `distribution: "internal"`:
```bash
eas build --profile development --platform ios --auto-submit
```

### Option 3: Manuelle Credential-Eingabe (ohne Apple-Login)
Bei `eas credentials --platform ios`:
- "Do you want to log in?" → `no`
- Dann manuell Certificate und Provisioning Profile angeben

### Option 4: Bestehende Credentials wiederverwenden
Wenn bereits ein Certificate für internal distribution existiert, kann EAS es finden.

## Empfehlung:
**Option 2** versuchen - `development` Profil verwenden, da es auch internal distribution hat.




