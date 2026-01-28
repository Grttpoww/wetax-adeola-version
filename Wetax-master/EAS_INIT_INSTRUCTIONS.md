# EAS Projekt Initialisierung

## Problem
Das EAS-Projekt ist noch nicht konfiguriert. Der Build kann erst gestartet werden, nachdem das Projekt initialisiert wurde.

## Lösung

### Option 1: Automatische Initialisierung (Empfohlen)

Führe diesen Command aus:
```bash
cd Wetax-master
eas init
```

**Bei der Frage:**
- "Would you like to automatically create an EAS project for @wetax/wetax?" 
- **Antwort: `y` (yes)**

### Option 2: Mit bestehendem Projekt verknüpfen

Falls bereits ein EAS-Projekt existiert:
```bash
cd Wetax-master
eas init
# Wähle: "Link to existing project"
# Gib die Projekt-ID ein
```

## Nach der Initialisierung

Sobald `eas init` erfolgreich war, kannst du den Build starten:

```bash
npm run build:ios:adeola
# Oder:
eas build --profile development-adeola --platform ios --auto-submit
```

## Verifikation

Prüfe ob das Projekt konfiguriert ist:
```bash
eas project:info
```

Sollte die Projekt-Informationen anzeigen.

---

**Nach `eas init` → Build starten → TestFlight Link erhalten**



