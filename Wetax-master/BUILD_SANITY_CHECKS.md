# Build Sanity Checks - TestFlight Build

**Datum:** 2026-01-24  
**Build-Profil:** `development-adeola`  
**Zweck:** Sanity Checks für ENV-Injection und neue Features vor TestFlight Build

---

## 🎯 Übersicht

Dieses Dokument enthält Sanity Checks für zwei kritische Domänen:
1. **ENV-Injection Fix** (behebt Freeze-Problem nach Login)
2. **Neue Features** (Municipalities & Kinderabzüge)

---

## ✅ 1. ENV-Injection Sanity Checks

### 1.1 Prüfe `app.json.extra.apiUrl`
**Datei:** `Wetax-master/app.json` (Zeile 114)

**Check:**
```bash
# Terminal Command:
cat Wetax-master/app.json | grep -A 2 '"extra"'
```

**Erwartet:**
```json
"extra": {
  "eas": {
    "projectId": "abdc0624-1f1a-46bd-85ee-4acb9d0aa7b9"
  },
  "apiUrl": "https://wetaxorg.ch"
}
```

**✅ PASS:** `"apiUrl": "https://wetaxorg.ch"` ist vorhanden  
**❌ FAIL:** `apiUrl` fehlt oder ist falsch

---

### 1.2 Prüfe `OpenAPI.BASE` Konfiguration
**Datei:** `Wetax-master/src/shared/openapi.ts`

**Check:**
```bash
# Terminal Command:
grep -A 5 "OpenAPI.BASE" Wetax-master/src/shared/openapi.ts
```

**Erwartet:**
```typescript
OpenAPI.BASE = 
  Constants.default?.expoConfig?.extra?.apiUrl || 
  API_URL;
```

**✅ PASS:** Verwendet `Constants.default?.expoConfig?.extra?.apiUrl`  
**❌ FAIL:** Verwendet `process.env.EXPO_PUBLIC_PROD_API_URL` oder ist leer

---

### 1.3 Prüfe `eas.json` Environment Variables
**Datei:** `Wetax-master/eas.json` (Zeilen 31-44)

**Check:**
```bash
# Terminal Command:
cat Wetax-master/eas.json | grep -A 12 "development-adeola"
```

**Erwartet:**
```json
"development-adeola": {
  "developmentClient": true,
  "distribution": "store",
  "env": {
    "EXPO_PUBLIC_LOCAL_API_URL": "https://wetaxorg.ch",
    "EXPO_PUBLIC_PROD_API_URL": "https://wetaxorg.ch"
  },
  ...
}
```

**✅ PASS:** Beide ENV-Variablen sind auf `https://wetaxorg.ch` gesetzt  
**❌ FAIL:** ENV-Variablen fehlen oder sind falsch

---

### 1.4 Prüfe Build Number & Auto-Increment
**Datei:** `Wetax-master/app.json` (Zeile 28) & `Wetax-master/eas.json` (Zeile 43)

**Check:**
```bash
# Terminal Command:
grep "buildNumber" Wetax-master/app.json
grep "autoIncrement" Wetax-master/eas.json
```

**Erwartet:**
- `app.json`: `"buildNumber": "26"` (oder höher, nicht 25)
- `eas.json`: `"autoIncrement": true`

**✅ PASS:** Build number ist inkrementiert UND autoIncrement ist `true`  
**⚠️ WARNING:** Build number ist noch 25, aber autoIncrement ist `true` (wird automatisch erhöht)  
**❌ FAIL:** Build number ist 25 UND autoIncrement ist `false`

---

## ✅ 2. Municipalities Feature Sanity Checks

### 2.1 Prüfe Backend: `calculateMunicipalTax` Funktion
**Datei:** `Wetax-app-server-main/src/computeTaxes.ts` (Zeilen 107-161)

**Check:**
```bash
# Terminal Command:
grep -A 5 "export function calculateMunicipalTax" Wetax-app-server-main/src/computeTaxes.ts
```

**Erwartet:**
```typescript
export function calculateMunicipalTax(
  cantonalTax: number,
  municipalityBfsNumber: number | undefined,
  religion: string,
  municipalityRatesCache: MunicipalityTaxRatesCache,
): number
```

**✅ PASS:** Funktion existiert mit korrekten Parametern  
**❌ FAIL:** Funktion fehlt oder Parameter sind falsch

---

### 2.2 Prüfe Backend: Municipality Cache Loading
**Datei:** `Wetax-app-server-main/src/data/municipalityTaxRates.ts`

**Check:**
```bash
# Terminal Command:
grep "loadMunicipalityTaxRates\|getMunicipalityRatesCache" Wetax-app-server-main/src/data/municipalityTaxRates.ts | head -5
```

**Erwartet:**
- `loadMunicipalityTaxRates()` Funktion existiert
- `getMunicipalityRatesCache()` Funktion existiert

**✅ PASS:** Beide Funktionen existieren  
**❌ FAIL:** Funktionen fehlen

---

### 2.3 Prüfe Backend: CSV-Datei vorhanden
**Datei:** `Wetax-app-server-main/src/data/Gemeindesteuerfuesse_2026.csv`

**Check:**
```bash
# Terminal Command:
ls -la Wetax-app-server-main/src/data/Gemeindesteuerfuesse_2026.csv
```

**Erwartet:**
- Datei existiert
- Datei ist nicht leer (mindestens Header + einige Zeilen)

**✅ PASS:** CSV-Datei existiert und ist nicht leer  
**❌ FAIL:** CSV-Datei fehlt oder ist leer

---

### 2.4 Prüfe Backend: Integration in `computeTaxReturn`
**Datei:** `Wetax-app-server-main/src/computer.ts` (Zeilen 131-136)

**Check:**
```bash
# Terminal Command:
grep -A 5 "calculateMunicipalTax" Wetax-app-server-main/src/computer.ts
```

**Erwartet:**
```typescript
const einkommenssteuerStaat = calculateMunicipalTax(
  baseCantonalTax,
  data.personData?.data?.gemeindeBfsNumber,
  data.personData?.data?.konfession ?? 'andere',
  municipalityRatesCache,
)
```

**✅ PASS:** `calculateMunicipalTax` wird korrekt aufgerufen  
**❌ FAIL:** Aufruf fehlt oder Parameter sind falsch

---

### 2.5 Prüfe Backend: API Service verwendet Municipality Cache
**Datei:** `Wetax-app-server-main/src/api/api.service.ts`

**Check:**
```bash
# Terminal Command:
grep -B 2 -A 2 "municipalityRatesCache" Wetax-app-server-main/src/api/api.service.ts | head -10
```

**Erwartet:**
- `getMunicipalityRatesCache()` wird aufgerufen
- Cache wird an `computeTaxReturn()` übergeben

**✅ PASS:** Cache wird geladen und übergeben  
**❌ FAIL:** Cache wird nicht verwendet

---

### 2.6 Prüfe Frontend: `gemeindeBfsNumber` in Types
**Datei:** `Wetax-app-server-main/src/types.ts` (Zeile 48)

**Check:**
```bash
# Terminal Command:
grep "gemeindeBfsNumber" Wetax-app-server-main/src/types.ts
```

**Erwartet:**
```typescript
gemeindeBfsNumber: number | undefined // BFS number of municipality
```

**✅ PASS:** `gemeindeBfsNumber` existiert in `personData.data`  
**❌ FAIL:** Feld fehlt

---

## ✅ 3. Kinderabzüge Feature Sanity Checks

### 3.1 Prüfe Backend: Kinderabzüge Berechnung
**Datei:** `Wetax-app-server-main/src/computer.ts` (Zeilen 91-113)

**Check:**
```bash
# Terminal Command:
grep -A 20 "Kinderabzüge berechnen" Wetax-app-server-main/src/computer.ts
```

**Erwartet:**
```typescript
// Kinderabzüge berechnen
const anzahlKinderImHaushalt = data.kinderImHaushalt?.data?.length ?? 0
const anzahlKinderAusserhalb = data.kinderAusserhalb?.data?.length ?? 0
const totalKinder = anzahlKinderImHaushalt + anzahlKinderAusserhalb

// Abzüge: 9'300 CHF pro Kind für Staatssteuer, 6'800 CHF pro Kind für Bundessteuer
const kinderabzugStaat = totalKinder * 9300
const kinderabzugBund = totalKinder * 6800
```

**✅ PASS:** Berechnung ist korrekt (9300/6800 CHF pro Kind)  
**❌ FAIL:** Berechnung fehlt oder Werte sind falsch

---

### 3.2 Prüfe Backend: Integration in Abzüge
**Datei:** `Wetax-app-server-main/src/computer.ts` (Zeilen 100-113)

**Check:**
```bash
# Terminal Command:
grep -A 10 "totalAbzuegeStaat" Wetax-app-server-main/src/computer.ts | head -15
```

**Erwartet:**
```typescript
const totalAbzuegeStaat =
  totalBerufsauslagenStaat +
  (data.saeule3a?.data?.betrag ?? 0) +
  versicherungenTotalStaat +
  (data.ahvIVsaeule2Selber?.data.betrag ?? 0) +
  selbstgetrageneKostenAusbildung +
  kinderabzugStaat  // ← Muss enthalten sein
```

**✅ PASS:** `kinderabzugStaat` und `kinderabzugBund` sind in den Abzügen enthalten  
**❌ FAIL:** Kinderabzüge fehlen in den Abzügen

---

### 3.3 Prüfe Backend: Types für Kinder
**Datei:** `Wetax-app-server-main/src/types.ts` (Zeilen 75-100)

**Check:**
```bash
# Terminal Command:
grep -A 15 "kinderImHaushalt:" Wetax-app-server-main/src/types.ts
```

**Erwartet:**
```typescript
kinderImHaushalt: {
  start: boolean | undefined
  finished: boolean | undefined
  data: Array<{...}>
}
kinderAusserhalb: {
  start: boolean | undefined
  finished: boolean | undefined
  data: Array<{...}>
}
```

**✅ PASS:** Beide Typen existieren mit korrekter Struktur  
**❌ FAIL:** Typen fehlen oder Struktur ist falsch

---

### 3.4 Prüfe Backend: Tests vorhanden
**Datei:** `Wetax-app-server-main/src/tests/computer.kinderabzug.test.ts`

**Check:**
```bash
# Terminal Command:
ls -la Wetax-app-server-main/src/tests/computer.kinderabzug.test.ts
```

**Erwartet:**
- Test-Datei existiert
- Tests laufen durch

**✅ PASS:** Test-Datei existiert  
**❌ FAIL:** Test-Datei fehlt

**Optional - Tests ausführen:**
```bash
cd Wetax-app-server-main
npm test -- computer.kinderabzug.test.ts
```

---

## 📋 Quick Sanity Check Script

Führe alle Checks in einem Rutsch aus:

```bash
# Navigate to project root
cd "C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb"

# 1. ENV-Injection Checks
echo "=== ENV-Injection Checks ==="
echo "1.1 app.json.extra.apiUrl:"
grep -A 2 '"apiUrl"' Wetax-master/app.json
echo ""
echo "1.2 OpenAPI.BASE:"
grep -A 3 "OpenAPI.BASE" Wetax-master/src/shared/openapi.ts
echo ""
echo "1.3 eas.json env:"
grep -A 3 '"env"' Wetax-master/eas.json
echo ""
echo "1.4 Build Number:"
grep "buildNumber" Wetax-master/app.json
grep "autoIncrement" Wetax-master/eas.json
echo ""

# 2. Municipalities Checks
echo "=== Municipalities Checks ==="
echo "2.1 calculateMunicipalTax exists:"
grep "export function calculateMunicipalTax" Wetax-app-server-main/src/computeTaxes.ts && echo "✅" || echo "❌"
echo ""
echo "2.2 CSV file exists:"
ls Wetax-app-server-main/src/data/Gemeindesteuerfuesse_2026.csv && echo "✅" || echo "❌"
echo ""
echo "2.3 Integration in computer.ts:"
grep "calculateMunicipalTax" Wetax-app-server-main/src/computer.ts && echo "✅" || echo "❌"
echo ""

# 3. Kinderabzüge Checks
echo "=== Kinderabzüge Checks ==="
echo "3.1 Berechnung exists:"
grep "Kinderabzüge berechnen" Wetax-app-server-main/src/computer.ts && echo "✅" || echo "❌"
echo ""
echo "3.2 In totalAbzuegeStaat:"
grep "kinderabzugStaat" Wetax-app-server-main/src/computer.ts && echo "✅" || echo "❌"
echo ""
echo "3.3 Types exist:"
grep "kinderImHaushalt:" Wetax-app-server-main/src/types.ts && echo "✅" || echo "❌"
echo ""
```

---

## ✅ Checkliste vor Build

- [ ] **ENV-Injection:**
  - [ ] `app.json.extra.apiUrl` = `"https://wetaxorg.ch"`
  - [ ] `OpenAPI.BASE` verwendet `Constants.default?.expoConfig?.extra?.apiUrl`
  - [ ] `eas.json` ENV-Variablen sind korrekt
  - [ ] Build number ist inkrementiert oder `autoIncrement: true`

- [ ] **Municipalities:**
  - [ ] `calculateMunicipalTax` Funktion existiert
  - [ ] CSV-Datei existiert
  - [ ] Integration in `computeTaxReturn` vorhanden
  - [ ] API Service verwendet Cache

- [ ] **Kinderabzüge:**
  - [ ] Berechnung existiert (9300/6800 CHF)
  - [ ] Integration in Abzüge vorhanden
  - [ ] Types sind korrekt

---

## 🚨 Wenn Checks fehlschlagen

Siehe `BUILD_DEBUGGING_GUIDE.md` für detaillierte Debugging-Anleitung.



