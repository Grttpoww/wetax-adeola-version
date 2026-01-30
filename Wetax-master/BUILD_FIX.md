# Build Fix - Terminal reagiert nicht

## Problem
Das Terminal reagiert nicht auf interaktive Eingabe für Apple-Login.

## Lösung: Build ohne Auto-Submit

### Schritt 1: Build ohne Auto-Submit starten
```bash
cd Wetax-master
eas build --profile development-adeola --platform ios
```

**Ohne `--auto-submit`** - das umgeht das Login-Problem beim Submit.

### Schritt 2: Nach Build-Completion
Wenn der Build fertig ist, bekommst du einen Download-Link. Dann kannst du manuell submiten:

```bash
eas submit --platform ios --latest
```

---

## Alternative: Credentials separat konfigurieren

Falls das auch nicht funktioniert, konfiguriere die Credentials vorher:

```bash
cd Wetax-master
eas credentials --platform ios
```

Dann wähle:
- "Set up credentials" oder "Use existing credentials"
- Folge den Prompts

---

## Workaround: Build im Dashboard starten

1. Gehe zu: https://expo.dev/accounts/wetax/projects/wetax/builds
2. Klicke "Create a build"
3. Wähle:
   - Platform: iOS
   - Profile: development-adeola
   - Distribution: Internal
4. Starte den Build

Das umgeht Terminal-Probleme komplett.




