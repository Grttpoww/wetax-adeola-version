# Build Debugging Guide - TestFlight Build

**Datum:** 2026-01-24  
**Build-Profil:** `development-adeola`  
**Zweck:** Differenzierung zwischen ENV-Injection-Problem und neuen Features bei Build-Fehlern

---

## 🎯 Übersicht

Dieses Dokument hilft dir, zu identifizieren, ob ein Build-Problem durch:
1. **ENV-Injection Fix** (Freeze nach Login)
2. **Neue Features** (Municipalities oder Kinderabzüge)

verursacht wird.

---

## 🔍 Problem-Differenzierung: Freeze nach Login

### Symptome: App friert nach Apple Sign-In ein

**Mögliche Ursachen:**
1. ❌ **ENV-Injection Problem** - `OpenAPI.BASE` ist leer oder falsch
2. ❌ **API-Verbindung** - Server nicht erreichbar
3. ❌ **Token-Problem** - Token wird nicht gespeichert/geladen

---

### Schritt 1: ENV-Injection Problem identifizieren

#### 1.1 Prüfe Logs nach Login

**Im TestFlight Build:**
- Öffne die App
- Führe Apple Sign-In durch
- Prüfe die Logs (falls verfügbar)

**Erwartete Logs:**
```
Connected to: https://wetaxorg.ch  // ✅ Korrekt
```

**Fehler-Logs:**
```
Connected to:   // ❌ Leer = ENV-Injection Problem
Connected to: http://172.20.10.3:3000  // ⚠️ Fallback zu Dev-IP = ENV nicht gesetzt
```

#### 1.2 Prüfe Network Requests

**Falls möglich, prüfe Network-Logs:**
- **Korrekt:** `https://wetaxorg.ch/v1/loginWithEmail`
- **Falsch:** `/v1/loginWithEmail` (leere BASE URL)
- **Falsch:** `http://172.20.10.3:3000/v1/loginWithEmail` (Dev-Fallback)

#### 1.3 Debugging: ENV-Injection Problem

**Problem:** `OpenAPI.BASE` ist leer oder verwendet Fallback

**Lösung:**
1. Prüfe `app.json.extra.apiUrl`:
   ```json
   "extra": {
     "apiUrl": "https://wetaxorg.ch"
   }
   ```

2. Prüfe `src/shared/openapi.ts`:
   ```typescript
   OpenAPI.BASE = 
     Constants.default?.expoConfig?.extra?.apiUrl || 
     API_URL;
   ```

3. Prüfe `eas.json`:
   ```json
   "development-adeola": {
     "env": {
       "EXPO_PUBLIC_PROD_API_URL": "https://wetaxorg.ch"
     }
   }
   ```

4. **Rebuild erforderlich** - ENV-Variablen werden nur zur Build-Zeit injiziert

---

### Schritt 2: API-Verbindung Problem

#### 2.1 Prüfe Server-Erreichbarkeit

**Test:**
```bash
curl https://wetaxorg.ch/v1/health
# oder
curl https://wetaxorg.ch/v1/user
```

**Erwartet:** HTTP 200 oder 401 (nicht 404 oder Connection Error)

#### 2.2 Prüfe CORS/Network Errors

**Falls Network-Logs verfügbar:**
- **CORS Error:** Backend-Problem, nicht Frontend
- **Connection Timeout:** Server nicht erreichbar
- **404:** Endpoint existiert nicht

---

### Schritt 3: Token-Problem

#### 3.1 Prüfe Token-Speicherung

**Falls möglich, prüfe AsyncStorage:**
- Token sollte nach Login gespeichert werden
- Token sollte in `OpenAPI.HEADERS` verwendet werden

**Debugging:**
```typescript
// In src/shared/openapi.ts temporär hinzufügen:
OpenAPI.HEADERS = async () => {
  const token = await AsyncStorage.getItem('@token')
  console.log('Token from storage:', token ? 'EXISTS' : 'MISSING')
  return {
    'x-access-token': token || '',
  }
}
```

---

## 🔍 Problem-Differenzierung: Municipalities Feature

### Symptome: App crasht oder zeigt Fehler bei Steuerberechnung

**Mögliche Ursachen:**
1. ❌ **Municipality Cache nicht geladen** - CSV-Datei fehlt oder kann nicht geladen werden
2. ❌ **BFS-Nummer fehlt** - `gemeindeBfsNumber` ist `undefined`
3. ❌ **Municipality nicht gefunden** - BFS-Nummer existiert nicht im Cache
4. ❌ **Steuerfuss ist null/0** - Fehlerhafte CSV-Daten

---

### Schritt 1: Municipality Cache Problem

#### 1.1 Prüfe CSV-Datei

**Backend-Logs prüfen:**
```
Error: Municipality tax rates CSV file not found: .../Gemeindesteuerfuesse_2026.csv
```

**Lösung:**
- Prüfe, ob CSV-Datei in `Wetax-app-server-main/src/data/` existiert
- Prüfe, ob CSV-Datei nicht leer ist

#### 1.2 Prüfe Cache-Loading

**Backend-Logs prüfen:**
```
Error: Gemeinde mit BFS-Nummer XXX nicht gefunden
```

**Lösung:**
- Prüfe, ob `loadMunicipalityTaxRates()` erfolgreich ausgeführt wird
- Prüfe, ob CSV-Datei korrekt geparst wird

---

### Schritt 2: BFS-Nummer Problem

#### 2.1 Prüfe Frontend: BFS-Nummer wird gesetzt

**Falls möglich, prüfe `personData.data.gemeindeBfsNumber`:**
- Sollte eine Zahl sein (z.B. `261` für Zürich)
- Sollte nicht `undefined` oder `null` sein

#### 2.2 Prüfe Backend: BFS-Nummer wird verwendet

**Backend-Logs prüfen:**
```typescript
// In computer.ts temporär hinzufügen:
console.log('BFS Number:', data.personData?.data?.gemeindeBfsNumber)
```

**Erwartet:** Zahl (z.B. `261`)  
**Fehler:** `undefined` oder `null`

---

### Schritt 3: Municipality nicht gefunden

#### 3.1 Prüfe BFS-Nummer im Cache

**Backend-Logs prüfen:**
```
Error: Gemeinde mit BFS-Nummer 99999 nicht gefunden
```

**Lösung:**
- Prüfe, ob BFS-Nummer in CSV-Datei existiert
- Prüfe, ob CSV-Datei korrekt geladen wurde

#### 3.2 Prüfe Fallback-Logik

**Backend sollte Fallback zu Zürich (261) verwenden:**
```typescript
// In computeTaxes.ts:
const bfsNumber = municipalityBfsNumber ?? 261  // Fallback zu Zürich
```

---

### Schritt 4: Steuerfuss Problem

#### 4.1 Prüfe Steuerfuss-Werte

**Backend-Logs prüfen:**
```
Error: Ungültiger Steuerfuss für Gemeinde XXX: null
```

**Lösung:**
- Prüfe CSV-Datei: Sind alle Steuerfuss-Werte vorhanden?
- Prüfe, ob Fallback zu Zürich funktioniert

---

## 🔍 Problem-Differenzierung: Kinderabzüge Feature

### Symptome: Steuerberechnung ist falsch oder crasht

**Mögliche Ursachen:**
1. ❌ **Kinder-Daten fehlen** - `kinderImHaushalt` oder `kinderAusserhalb` sind `undefined`
2. ❌ **Berechnung fehlt** - Kinderabzüge werden nicht berechnet
3. ❌ **Integration fehlt** - Kinderabzüge werden nicht zu Abzügen hinzugefügt

---

### Schritt 1: Kinder-Daten Problem

#### 1.1 Prüfe Frontend: Kinder-Daten werden gespeichert

**Falls möglich, prüfe `taxReturn.data`:**
```typescript
console.log('Kinder im Haushalt:', data.kinderImHaushalt?.data?.length)
console.log('Kinder ausserhalb:', data.kinderAusserhalb?.data?.length)
```

**Erwartet:** Array mit Kindern oder leeres Array  
**Fehler:** `undefined` oder `null`

#### 1.2 Prüfe Backend: Kinder-Daten werden empfangen

**Backend-Logs prüfen:**
```typescript
// In computer.ts temporär hinzufügen:
console.log('Kinder im Haushalt:', data.kinderImHaushalt?.data?.length ?? 0)
console.log('Kinder ausserhalb:', data.kinderAusserhalb?.data?.length ?? 0)
```

---

### Schritt 2: Berechnung Problem

#### 2.1 Prüfe Berechnung existiert

**Backend-Code prüfen:**
```typescript
// In computer.ts sollte existieren:
const kinderabzugStaat = totalKinder * 9300
const kinderabzugBund = totalKinder * 6800
```

**Erwartet:** Berechnung existiert  
**Fehler:** Berechnung fehlt

#### 2.2 Prüfe Werte

**Erwartete Werte:**
- Staatssteuer: **9'300 CHF** pro Kind
- Bundessteuer: **6'800 CHF** pro Kind

**Falls falsch:** Prüfe, ob Werte korrekt sind

---

### Schritt 3: Integration Problem

#### 3.1 Prüfe Integration in Abzüge

**Backend-Code prüfen:**
```typescript
// In computer.ts sollte existieren:
const totalAbzuegeStaat =
  ... +
  kinderabzugStaat  // ← Muss enthalten sein

const totalAbzuegeBund =
  ... +
  kinderabzugBund  // ← Muss enthalten sein
```

**Erwartet:** `kinderabzugStaat` und `kinderabzugBund` sind in den Abzügen enthalten  
**Fehler:** Fehlen in den Abzügen

---

## 📊 Entscheidungsbaum: Welches Problem?

```
App friert nach Login ein?
│
├─ OpenAPI.BASE ist leer oder falsch?
│  └─ ✅ ENV-Injection Problem
│
├─ API-Calls gehen zu falscher URL?
│  └─ ✅ ENV-Injection Problem
│
└─ Token wird nicht gespeichert/geladen?
   └─ ✅ Token-Problem (nicht ENV-Injection)

Steuerberechnung crasht oder ist falsch?
│
├─ Fehler: "Gemeinde mit BFS-Nummer nicht gefunden"?
│  └─ ✅ Municipalities Problem
│
├─ Fehler: "Municipality tax rates CSV file not found"?
│  └─ ✅ Municipalities Problem (CSV fehlt)
│
├─ Steuerbetrag ist falsch (zu hoch/niedrig)?
│  ├─ Prüfe: Werden Kinderabzüge abgezogen?
│  │  └─ Nein → ✅ Kinderabzüge Problem
│  │  └─ Ja → ⚠️ Anderes Problem (nicht Kinderabzüge)
│  │
│  └─ Prüfe: Wird Municipality-Steuerfuss angewendet?
│     └─ Nein → ✅ Municipalities Problem
│     └─ Ja → ⚠️ Anderes Problem
│
└─ App crasht bei Steuerberechnung?
   ├─ Stack-Trace zeigt "calculateMunicipalTax"?
   │  └─ ✅ Municipalities Problem
   │
   └─ Stack-Trace zeigt "kinderabzug"?
      └─ ✅ Kinderabzüge Problem
```

---

## 🛠️ Quick-Fix Anleitung

### ENV-Injection Problem beheben:

1. **Prüfe `app.json.extra.apiUrl`:**
   ```json
   "extra": {
     "apiUrl": "https://wetaxorg.ch"
   }
   ```

2. **Prüfe `src/shared/openapi.ts`:**
   ```typescript
   OpenAPI.BASE = 
     Constants.default?.expoConfig?.extra?.apiUrl || 
     API_URL;
   ```

3. **Rebuild:**
   ```bash
   eas build --platform ios --profile development-adeola
   ```

---

### Municipalities Problem beheben:

1. **Prüfe CSV-Datei existiert:**
   ```bash
   ls Wetax-app-server-main/src/data/Gemeindesteuerfuesse_2026.csv
   ```

2. **Prüfe Backend-Logs:**
   - Cache wird geladen?
   - BFS-Nummer existiert im Cache?

3. **Prüfe Frontend:**
   - Wird `gemeindeBfsNumber` gesetzt?

---

### Kinderabzüge Problem beheben:

1. **Prüfe Berechnung existiert:**
   ```bash
   grep "kinderabzugStaat" Wetax-app-server-main/src/computer.ts
   ```

2. **Prüfe Integration:**
   ```bash
   grep "kinderabzugStaat\|kinderabzugBund" Wetax-app-server-main/src/computer.ts
   ```

3. **Prüfe Frontend:**
   - Werden Kinder-Daten gespeichert?

---

## 📝 Logging-Empfehlungen

### Für ENV-Injection Debugging:

**In `src/shared/openapi.ts`:**
```typescript
console.log('OpenAPI.BASE:', OpenAPI.BASE)
console.log('Constants.expoConfig?.extra?.apiUrl:', Constants.default?.expoConfig?.extra?.apiUrl)
console.log('API_URL fallback:', API_URL)
```

### Für Municipalities Debugging:

**In `Wetax-app-server-main/src/computer.ts`:**
```typescript
console.log('BFS Number:', data.personData?.data?.gemeindeBfsNumber)
console.log('Municipality Cache loaded:', municipalityRatesCache.size > 0)
```

### Für Kinderabzüge Debugging:

**In `Wetax-app-server-main/src/computer.ts`:**
```typescript
console.log('Kinder im Haushalt:', anzahlKinderImHaushalt)
console.log('Kinder ausserhalb:', anzahlKinderAusserhalb)
console.log('Kinderabzug Staat:', kinderabzugStaat)
console.log('Kinderabzug Bund:', kinderabzugBund)
```

---

## ✅ Checkliste nach Build-Fehler

- [ ] **ENV-Injection:**
  - [ ] `OpenAPI.BASE` ist nicht leer
  - [ ] API-Calls gehen zu `https://wetaxorg.ch`
  - [ ] Keine Fallback-zu-Dev-IP

- [ ] **Municipalities:**
  - [ ] CSV-Datei existiert
  - [ ] Cache wird geladen
  - [ ] BFS-Nummer wird gesetzt
  - [ ] Keine "Gemeinde nicht gefunden" Fehler

- [ ] **Kinderabzüge:**
  - [ ] Berechnung existiert
  - [ ] Integration in Abzüge vorhanden
  - [ ] Werte sind korrekt (9300/6800)

---

## 🚨 Wenn Problem nicht identifizierbar

1. **Prüfe alle Logs** (Frontend + Backend)
2. **Prüfe Network-Requests** (falls möglich)
3. **Prüfe Stack-Traces** (falls Crash)
4. **Vergleiche mit vorherigem Build** (was hat sich geändert?)
5. **Isoliere Features** (deaktiviere Municipalities/Kinderabzüge temporär)



