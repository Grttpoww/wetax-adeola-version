# EINFACHE TESTING-ANLEITUNG

## 🚀 Schnellstart (1 Klick)

**Windows:**
- Doppelklick auf `START_APP.bat`
- Warte 20 Sekunden
- Browser öffnet sich automatisch

**Oder PowerShell:**
```powershell
.\START_APP.ps1
```

---

## 📋 Was passiert:

1. **Backend startet** (Port 3000)
2. **Frontend startet** (Port 8081, Web-Version)
3. **Browser öffnet sich** automatisch mit der App

---

## ✅ Was du testen kannst:

### 1. Navigation zu Kinder-Screens
- Gehe durch die Steuererklärung
- Nach "Verheiratet" sollten die neuen Screens kommen:
  - "Kinder im Haushalt" (YesNo)
  - "Kinder ausserhalb des Haushalts" (YesNo)

### 2. Kinder im Haushalt
- Klicke "Ja" bei "Hast du Kinder im Haushalt?"
- Übersicht sollte erscheinen
- "Hinzufügen" → Formular öffnet sich
- Fülle aus:
  - Vorname, Nachname, Geburtsdatum (required)
  - "In Ausbildung" → Wenn angehakt, erscheinen: Schule, Voraussichtlich bis
  - "Andere Elternteil zahlt" → Wenn angehakt, erscheint: Betrag pro Jahr
- Max. 3 Kinder möglich (Button wird deaktiviert)

### 3. Kinder ausserhalb
- Klicke "Ja" bei "Kinder ausserhalb des Haushalts"
- Übersicht sollte erscheinen
- "Hinzufügen" → Formular öffnet sich
- Fülle aus:
  - Vorname, Nachname, Geburtsdatum, Adresse (required)
  - "In Ausbildung" → Wenn angehakt, erscheinen: Schule, Voraussichtlich bis
- Max. 2 Kinder möglich (Button wird deaktiviert)

### 4. Steuerberechnung prüfen
- Nach dem Speichern sollte sich der Steuerbetrag ändern
- 1 Kind = 9'300 CHF (Staat) / 6'800 CHF (Bund) Abzug
- 2 Kinder = 18'600 CHF (Staat) / 13'600 CHF (Bund) Abzug

---

## 🐛 Falls Probleme:

**Browser öffnet sich nicht:**
- Warte 30 Sekunden
- Öffne manuell: http://localhost:8081

**Backend-Fehler:**
- Prüfe ob MongoDB läuft (sollte automatisch verbinden)
- Prüfe ob Port 3000 frei ist

**Frontend-Fehler:**
- Im Terminal siehst du die Fehler
- Meistens: TypeScript-Compilation-Fehler
- Lösung: Fehler beheben, dann neu starten

---

## 📝 Test-Checkliste:

- [ ] Navigation zu "Kinder im Haushalt" funktioniert
- [ ] YesNo-Screen erscheint
- [ ] Overview-Screen erscheint (nach "Ja")
- [ ] "Hinzufügen" Button funktioniert
- [ ] Formular rendert alle Felder
- [ ] Conditional Fields erscheinen/verschwinden korrekt
- [ ] Max Items: Button deaktiviert bei 3 (im Haushalt) / 2 (ausserhalb)
- [ ] Daten werden gespeichert
- [ ] Steuerbetrag ändert sich korrekt (9'300/6'800 pro Kind)
- [ ] "Kinder ausserhalb" funktioniert gleich

---

## 🔍 Backend-Tests (bereits durchgeführt):

✅ 6 Unit-Tests bestanden
- 0 Kinder: 0 CHF
- 1 Kind: 9'300 CHF (Staat) / 6'800 CHF (Bund)
- 2 Kinder: 18'600 CHF (Staat) / 13'600 CHF (Bund)
- 3 Kinder: 27'900 CHF (Staat) / 20'400 CHF (Bund)
- Edge Cases (undefined, empty arrays)

**Backend-Berechnung ist verifiziert!**









