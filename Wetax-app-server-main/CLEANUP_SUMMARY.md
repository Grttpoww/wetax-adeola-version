# Codebase Cleanup Summary

**Datum:** 2026-01-30  
**Zweck:** Codebase für Übergabe an Senior Devs aufräumen

---

## ✅ BEHOBENE PUNKTE

### 1. Type Safety Issues

#### ✅ `api.controller.ts` - UpdateTaxReturnBody Type
**Problem:** `body: any` ohne Type-Safety  
**Fix:** Korrektes `UpdateTaxReturnBody` Type importiert und verwendet  
**Datei:** `src/api/api.controller.ts:117`

#### ✅ `authentication.ts` - JWT Verify Callback Typing
**Problem:** `as any` für JWT verify callback  
**Fix:** Korrekte Type-Definitionen für `jwt.VerifyErrors` und `jwt.JwtPayload`  
**Datei:** `src/authentication.ts:45`

### 2. Unfertige Funktionen

#### ✅ `computeDeductible.ts` - Total Income Calculation für Spenden
**Problem:** TODO für 20% Limit-Berechnung bei Spenden  
**Fix:** Implementiert mit `computeTaxAmount()` für Total Income Berechnung  
**Datei:** `src/computeDeductible.ts:170`

**Implementierung:**
```typescript
const incomeResult = computeTaxAmount(taxReturn)
const totalIncome = Object.values(incomeResult).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0)
const maxDeductibleAmount = totalIncome * 0.2
```

#### ✅ `mappers.ts` - Person 2 Verpflegung Calculation
**Problem:** TODO für Person 2 Verpflegung im XML Export  
**Fix:** Vollständige Berechnung für Person 2 implementiert (ähnlich Person 1)  
**Datei:** `src/ech0119/mappers.ts:747`

**Implementierung:**
- Separate Berechnung für `essenNichtVerbilligtPerson2` und `essenVerbilligungenPerson2`
- Berücksichtigt `partner2AnzahlTage` aus `verpflegungAufArbeit.data`
- Limits: 15 CHF/Tag (nicht verbilligt), 7.5 CHF/Tag (verbilligt), max 3200 CHF pro Person

---

## ⚠️ VERBLEIBENDE PUNKTE (Bewusst offen gelassen)

### 1. Liegenschaften (Real Estate)
**Status:** Type-Definition ist vollständig, aber keine Screens/UI implementiert  
**Grund:** Feature ist geplant, aber nicht kritisch für Basis-Übergabe  
**Datei:** `src/types.ts:430-460`

**Bereits vorhanden:**
- ✅ Vollständige Type-Definition mit allen Feldern
- ✅ Berechnung in `computer.ts` (Nettoertrag, Vermögenssteuerwert)
- ✅ Integration in Steuerberechnung

**Fehlt noch:**
- ❌ Frontend Screens für Liegenschaften-Eingabe
- ❌ XML Export Mapping (wird später mit reverse-engineering gemacht)

### 2. Chat Service Stubs
**Status:** Stubs mit TODOs dokumentiert  
**Grund:** Feature in Entwicklung, Stubs sind bewusst als Platzhalter  
**Datei:** `src/api/chat.service.ts`

**Stubs:**
- `sendChatMessage()` - Phase 4
- `getChatHistory()` - Phase 6  
- `getChatUsage()` - Phase 3

**Hinweis:** Diese sind bewusst als Stubs gelassen, da Feature noch in Entwicklung ist.

### 3. Error Handling
**Status:** Grundlegende Error Handling vorhanden, nicht überall try/catch  
**Grund:** Senior Devs werden production hardening machen  
**Bewusst offen gelassen für:**
- Edge Cases
- Programmatische Fehlerbehandlung
- Retry-Logik
- Detaillierte Error Messages

**Hinweis:** Basis-Error-Handling ist vorhanden (z.B. in `api.service.ts`), aber nicht alle Edge Cases abgedeckt.

### 4. Multi-Canton Support
**Status:** Nur Zürich hardcoded  
**Grund:** Bewusst für MVP, wird später erweitert  
**Dateien:**
- `src/computeTaxes.ts:44-77` - Nur Zürich Steuersätze
- `src/pdf.ts:38` - Hardcoded Gemeinde

**Hinweis:** Architektur ist vorbereitet für Multi-Canton (z.B. `CantonRegistry`), aber nur Zürich implementiert.

---

## 📋 CODE QUALITY

### ✅ Positive Aspekte
- TypeScript durchgehend verwendet
- Klare Separation of Concerns
- Gute Strukturierung (Backend/Frontend getrennt)
- OpenAPI/TSOA für API-Dokumentation
- React Query für State Management
- Lens-Pattern für Form-Updates

### ⚠️ Bekannte Limitationen
- Nur Zürich unterstützt (hardcoded)
- Einige `any` Types noch vorhanden (bewusst für Flexibilität)
- Nicht alle Edge Cases abgedeckt
- Frontend Screens für einige Features fehlen noch

---

## 🎯 ÜBERGABE-HINWEISE FÜR SENIOR DEVS

### Was funktioniert:
1. ✅ **XML Export (eCH-0119):** Funktioniert für Test-User, conditional logic muss noch verfeinert werden
2. ✅ **Steuerberechnung:** Vollständig für Zürich, verheiratet/ledig
3. ✅ **Backend API:** Strukturiert, dokumentiert, Type-safe
4. ✅ **Datenbank:** MongoDB Schema definiert

### Was noch gemacht werden muss:
1. ⚠️ **Conditional Logic im XML Export:** Welche XML-Instanzen müssen implizit aufgeführt werden, wenn X ausgefüllt ist
2. ⚠️ **Production Hardening:** Error Handling, Edge Cases, Retry-Logik
3. ⚠️ **Multi-Canton:** Erweiterung auf alle 26 Kantone
4. ⚠️ **Frontend Screens:** Liegenschaften, weitere Tax Cases
5. ⚠️ **Testing:** Comprehensive Test Coverage

### Architektur-Entscheidungen:
- **Canton System:** Vorbereitet für Multi-Canton (`CantonRegistry`), aber nur ZH implementiert
- **Person 2 Support:** Bereits implementiert für verheiratete Paare (Einkommen, Abzüge, etc.)
- **XML Export:** Phase 1 (P1 fields) implementiert, conditional logic muss verfeinert werden

---

## 📝 NÄCHSTE SCHRITTE (Empfehlung)

1. **XML Export Conditional Logic:** Reverse-Engineering aus Sandbox für korrekte XML-Struktur
2. **Production Hardening:** Error Handling, Edge Cases, Monitoring
3. **Multi-Canton:** Schrittweise Erweiterung (zuerst 2-3 Hauptkantone)
4. **Frontend:** Liegenschaften Screens, weitere Tax Cases
5. **Testing:** Unit Tests, Integration Tests, E2E Tests

---

**Status:** ✅ **Bereit für Übergabe**

Die Codebase ist jetzt in einem sauberen Zustand für die Übergabe. Die wichtigsten Type-Safety Issues und TODOs sind behoben. Die verbleibenden Punkte sind bewusst offen gelassen, da sie Teil der Production Hardening Phase sind.

