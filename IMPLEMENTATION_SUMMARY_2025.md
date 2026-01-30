# Implementation Summary - Hochkritische Tax Cases (2025)

**Datum:** 2025-01-28  
**Status:** ✅ Backend & Frontend Schema implementiert, OpenAPI Types generiert  
**Nächste Schritte:** Fehlende Frontend-Screens implementieren

---

## 1. IMPLEMENTIERTE HOCHKRITISCHE CASES

### ✅ 1.1 Schulden (Vermögen Ziffer 34)
**Backend:**
- Schema erweitert: `verschuldet.data` ist jetzt Array mit:
  - `glauebiger: string | undefined`
  - `glauebigerAdresse: string | undefined`
  - `zinssatz: number | undefined`
  - `schuldhoehe: number | undefined` (für Vermögenssteuer)
  - `zinsenImJahr: number | undefined`
- Berechnung: `totalSchulden` wird von `totalVermoegenswerte` abgezogen
- Location: `Wetax-app-server-main/src/types.ts`, `computer.ts`

**Frontend:**
- ✅ Enums erweitert: `VerschuldetOverview`, `VerschuldetDetail`
- ✅ Screens implementiert: `verschuldetOverview`, `verschuldetDetail` (ArrayForm)
- ⚠️ Noch zu tun: Constants-Mappings (`mapScreenEnumToCategory`, `mapScreenEnumToSubcategory`)

---

### ✅ 1.2 Unterhaltsbeiträge und Rentenleistungen (Abzug Ziffer 13)
**Backend:**
- Schema erweitert: `unterhaltsbeitraege.data` mit:
  - `anEhegatten: number | undefined` (voll abzugsfähig)
  - `fuerKinder: Array<{kindName, geburtsdatum, betrag, monat18Jahre}>` (bis 18. Altersjahr)
  - `rentenleistungen: Array<{bezeichnung, gesamtbetrag, berechnungssatz, abzugsfaehigerErtragsanteil}>`
- Berechnung: Alle Abzüge werden vom Reineinkommen abgezogen
- Location: `Wetax-app-server-main/src/types.ts`, `computer.ts`

**Frontend:**
- ✅ Enums erweitert: `UnterhaltsbeitraegeYesNo`, `UnterhaltsbeitraegeEhegatten`, etc.
- ⚠️ Noch zu tun: Screens implementieren (YesNo, ObjForm für Ehegatten, ArrayForm für Kinder/Rentenleistungen)
- ⚠️ Noch zu tun: Constants-Mappings

---

### ✅ 1.3 Wertschriftenertrag (Einkommen Ziffer 4)
**Backend:**
- Schema erweitert: `aktien.data` mit:
  - `dividendenertrag: number | undefined` (als Einkommen)
  - `beteiligungsquote: number | undefined` (in Prozent)
  - `istQualifizierteBeteiligung: boolean | undefined` (mindestens 10%)
- Berechnung:
  - Zinsen von Bankkonten: `wertschriftenertragZinsen`
  - Dividenden: `wertschriftenertragDividenden`
  - Qualifizierte Beteiligungen: 50% Staat, 70% Bund steuerbar
  - Freistellungsanteile werden in Ziffer 16.5 abgezogen
- Location: `Wetax-app-server-main/src/types.ts`, `computer.ts`

**Frontend:**
- ✅ Aktien-Detail-Screen erweitert: Felder für `dividendenertrag`, `beteiligungsquote`, `istQualifizierteBeteiligung`
- ✅ Geschäfts-/Korporationsanteile: `geschaeftsOderKorporationsanteileOverview`, `geschaeftsOderKorporationsanteileDetail` implementiert
- ✅ Constants erweitert: `DATA_DEFAULTS` für neue Felder

---

### ✅ 1.4 Sozialversicherungen/Leibrenten (Einkommen Ziffer 3)
**Backend:**
- Schema erweitert:
  - `einkuenfteSozialversicherung.data`: Array mit `art`, `gesamtbetrag`, `steuerbarerAnteilProzent`, `steuerbarerBetrag`, etc.
  - `erwerbsausfallentschaedigung.data`: Array mit `art`, `betrag`, `von`, `bis`
  - `lebensOderRentenversicherung.data`: Array mit `art`, `gesamtbetrag`, `steuerbarerAnteilProzent`, `steuerbarerBetrag`, `leibrenteBerechnungssatz`
- Berechnung: Steuerbarer Anteil wird je nach Rentenart berechnet (80%, 100%, Ertragsanteil)
- Location: `Wetax-app-server-main/src/types.ts`, `computer.ts`

**Frontend:**
- ✅ Enums erweitert: `EinkuenfteSozialversicherungOverview`, `ErwerbsausfallentschaedigungOverview`, etc.
- ⚠️ Noch zu tun: Screens implementieren (ArrayForm für alle drei)
- ⚠️ Noch zu tun: Constants-Mappings

---

## 2. BACKEND-IMPLEMENTIERUNG

### Dateien geändert:
1. **`Wetax-app-server-main/src/types.ts`**
   - `TaxReturnData` erweitert mit neuen Schemas
   - `ComputedTaxReturnT` erweitert mit neuen Berechnungsfeldern

2. **`Wetax-app-server-main/src/constants.ts`**
   - Default-Werte für neue Felder hinzugefügt

3. **`Wetax-app-server-main/src/computer.ts`**
   - Berechnungen für alle neuen Cases implementiert
   - Wertschriftenertrag in `totalEinkuenfte` integriert
   - Unterhaltsbeiträge in `reineinkommenStaat/Bund` integriert
   - Schulden von Vermögenssteuer abgezogen

4. **`Wetax-app-server-main/src/api/api.controller.ts`**
   - TSOA-Fehler behoben: `exportECH0119` verwendet jetzt `TsoaResponse<200, string>`

### OpenAPI Spec:
- ✅ Erfolgreich generiert: `Wetax-app-server-main/build/swagger.json`
- ✅ Enthält alle neuen Felder

---

## 3. FRONTEND-IMPLEMENTIERUNG

### Dateien geändert:
1. **`Wetax-master/src/view/authenticated/taxReturn/enums.ts`**
   - Neue ScreenEnums hinzugefügt
   - Neue ScreenSubcategoryEnums hinzugefügt

2. **`Wetax-master/src/view/authenticated/taxReturn/screens.ts`**
   - ✅ `verschuldetOverview`, `verschuldetDetail` implementiert
   - ✅ `aktienDetailScreen` erweitert (Dividendenertrag, qualifizierte Beteiligung)
   - ✅ `geschaeftsOderKorporationsanteileOverview`, `geschaeftsOderKorporationsanteileDetail` implementiert
   - ⚠️ Screens für Unterhaltsbeiträge, Sozialversicherungen noch fehlend

3. **`Wetax-master/src/view/authenticated/taxReturn/constants.tsx`**
   - `DATA_DEFAULTS` erweitert für neue Felder
   - ⚠️ `mapScreenEnumToCategory`, `mapScreenEnumToSubcategory`, `mapSubcategoryToLabel` noch nicht aktualisiert

### OpenAPI Types:
- ✅ Erfolgreich regeneriert: `Wetax-master/src/openapi/models/TaxReturnData.ts`
- ✅ Enthält alle neuen Felder

---

## 4. VERBLEIBENDE ARBEITEN

### Frontend-Screens (hohe Priorität):
1. **Unterhaltsbeiträge:**
   - `unterhaltsbeitraegeYesNoScreen` (YesNo)
   - `unterhaltsbeitraegeEhegattenScreen` (ObjForm für `anEhegatten`)
   - `unterhaltsbeitraegeKinderOverviewScreen` (ArrayOverview)
   - `unterhaltsbeitraegeKinderDetailScreen` (ArrayForm)
   - `unterhaltsbeitraegeRentenleistungenOverviewScreen` (ArrayOverview)
   - `unterhaltsbeitraegeRentenleistungenDetailScreen` (ArrayForm)

2. **Sozialversicherungen:**
   - `einkuenfteSozialversicherungOverviewScreen` (ArrayOverview)
   - `einkuenfteSozialversicherungDetailScreen` (ArrayForm)
   - SelectInput für `art` (ahvIvRente, pensionskasse, etc.)

3. **Erwerbsausfallentschädigungen:**
   - `erwerbsausfallentschaedigungOverviewScreen` (ArrayOverview)
   - `erwerbsausfallentschaedigungDetailScreen` (ArrayForm)

4. **Lebens-/Rentenversicherungen:**
   - `lebensOderRentenversicherungOverviewScreen` (ArrayOverview)
   - `lebensOderRentenversicherungDetailScreen` (ArrayForm)

### Constants-Mappings:
- `mapScreenEnumToCategory`: Alle neuen Screens zuordnen
- `mapScreenEnumToSubcategory`: Alle neuen Screens zuordnen
- `mapSubcategoryToLabel`: Neue Subkategorien hinzufügen

### Type-Fehler (niedrige Priorität):
- Bestehende Type-Fehler in `screens.ts` (nicht kritisch, bestehende Probleme)
- Können später behoben werden

---

## 5. TESTING & DEPLOYMENT

### Backend:
- ✅ Keine Linter-Fehler
- ✅ OpenAPI Spec erfolgreich generiert
- ✅ Types korrekt

### Frontend:
- ⚠️ 6 Type-Fehler (bestehende Probleme, nicht kritisch)
- ✅ OpenAPI Types erfolgreich regeneriert
- ⚠️ Fehlende Screens müssen implementiert werden

### Deployment-Readiness:
- ⚠️ **NICHT bereit für Deployment** - Fehlende Frontend-Screens müssen implementiert werden
- ✅ Backend ist bereit
- ✅ Schema ist konsistent zwischen Backend und Frontend

---

## 6. NÄCHSTE SCHRITTE FÜR NÄCHSTEN CURSOR AGENT

### Priorität 1: Fehlende Frontend-Screens implementieren
1. Unterhaltsbeiträge-Screens (6 Screens)
2. Sozialversicherungen-Screens (2 Screens)
3. Erwerbsausfallentschädigungen-Screens (2 Screens)
4. Lebens-/Rentenversicherungen-Screens (2 Screens)

### Priorität 2: Constants-Mappings aktualisieren
- Alle neuen Screens in `mapScreenEnumToCategory` eintragen
- Alle neuen Screens in `mapScreenEnumToSubcategory` eintragen
- Neue Subkategorien in `mapSubcategoryToLabel` eintragen

### Priorität 3: Weitere fehlende Cases implementieren
- Selbständige Erwerbstätigkeit (Einkommen Ziffer 2)
- Übrige Einkünfte (Einkommen Ziffer 5) - Alimente als Einkommen, Lotteriegewinne
- Weitere Abzüge (Ziffer 16) - Details

### Priorität 4: Type-Fehler beheben
- Bestehende Type-Fehler in `screens.ts` beheben (nicht kritisch)

---

## 7. REFERENZEN

### Wichtige Dateien:
- **Backend Schema:** `Wetax-app-server-main/src/types.ts`
- **Backend Berechnungen:** `Wetax-app-server-main/src/computer.ts`
- **Frontend Screens:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts`
- **Frontend Enums:** `Wetax-master/src/view/authenticated/taxReturn/enums.ts`
- **Frontend Constants:** `Wetax-master/src/view/authenticated/taxReturn/constants.tsx`
- **OpenAPI Spec:** `Wetax-app-server-main/build/swagger.json`
- **Frontend Types:** `Wetax-master/src/openapi/models/TaxReturnData.ts`

### Tax Rules:
- **Hauptquelle:** `Wetax-app-server-main/src/data/tax-rules-zurich-2025.md`
- **Relevante Abschnitte:**
  - 2.3 Einkünfte aus Sozial- und anderen Versicherungen, Leibrenten (Ziffer 3)
  - 2.4 Wertschriftenertrag (Ziffer 4)
  - 2.5 Übrige Einkünfte (Ziffer 5)
  - 3.2 Schuldzinsen (Ziffer 12)
  - 3.3 Unterhaltsbeiträge und Rentenleistungen (Ziffer 13)
  - 5.4 Schulden (Ziffer 34)

### Bestehende Patterns:
- **Dokumentation:** `AUTHENTICATED_SCREENS_ANALYSIS.md`
- **Patterns:** YesNo → ArrayOverview → ArrayForm (für Arrays)
- **Patterns:** YesNo → ObjForm (für einzelne Objekte)

---

## 8. WICHTIGE HINWEISE

1. **OpenAPI Types:** Werden automatisch generiert, wenn Backend-Server läuft und `npm run openapi` ausgeführt wird
2. **Schema-Konsistenz:** Backend und Frontend Schema sind jetzt synchronisiert
3. **Berechnungen:** Alle neuen Berechnungen sind in `computer.ts` implementiert
4. **Type-Fehler:** Bestehende Type-Fehler sind nicht kritisch und können später behoben werden
5. **Deployment:** Nicht bereit - fehlende Frontend-Screens müssen implementiert werden

---

**Ende der Zusammenfassung**


