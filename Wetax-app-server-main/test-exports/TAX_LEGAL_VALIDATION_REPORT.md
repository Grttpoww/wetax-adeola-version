# Steuerrechtliche Validierungsprüfung
## Umfassende Prüfung des eCH-0119 XML-Exports gegen Zürcher Steuerrecht

**Datum:** 2026-01-30  
**XML-Datei:** `ech0119-complex-2026-01-30T11-24-02-314Z.xml`  
**Steuerperiode:** 2024 (aber Wegleitung 2025 als Referenz)  
**Rechtsgrundlage:** Steuergesetz (StG), Direkte Bundessteuer (DBG), Wegleitung Kanton Zürich 2025

---

## WICHTIGER HINWEIS

**Diese Prüfung erfolgt unter der Annahme, dass die programmierten Berechnungen in WETAX falsch sein könnten.**  
**Jede Berechnung wird manuell gegen die Wegleitung validiert.**

---

## 1. EINKÜNFTE - PRÜFUNG

### 1.1 Einkünfte aus unselbständiger Erwerbstätigkeit (Ziffer 1)

#### Testfall-Daten:
- **Hauptberuf:** 120'000 CHF (Tech Solutions AG)
- **Nebenerwerb:** 15'000 CHF (Startup Consulting GmbH)
- **Total Erwerbseinkommen:** 135'000 CHF

#### XML-Werte:
```xml
<employedMainRevenue>
  <partner1Amount>156900</partner1Amount>
</employedMainRevenue>
```

#### ❌ **FEHLER GEFUNDEN**

**Problem:**  
- **Erwartet:** 135'000 CHF (120'000 + 15'000)
- **Tatsächlich im XML:** 156'900 CHF
- **Differenz:** +21'900 CHF

**Mögliche Ursachen:**
1. ❌ **Falsche Berechnung:** Nebenerwerb wird doppelt gezählt?
2. ❌ **Falsche Datenquelle:** Werden andere Einkünfte fälschlicherweise dazugerechnet?
3. ❌ **Fehler in `computeTaxReturn()`:** Summierung der `geldVerdient.data` ist falsch

**Wegleitung (2.1.1):**
> "Als Einkommen aus unselbständiger Erwerbstätigkeit sind alle im Zusammenhang mit einem Arbeitsverhältnis empfangenen Leistungen anzugeben"

**✅ KORREKTUR ERFORDERLICH**

---

### 1.2 Wertschriftenertrag (Ziffer 4)

#### Testfall-Daten:
- **Bankkonto:** 1'200 CHF Zinserträge (zinsUeber200: true → mit Verrechnungssteuer)
- **Aktien:** 1'500 CHF Dividenden (Nestlé SA)
- **Total Wertschriftenertrag:** 2'700 CHF

#### XML-Werte:
```xml
<securitiesRevenue>
  <cantonalTax>1200</cantonalTax>
</securitiesRevenue>
```

#### ❌ **FEHLER GEFUNDEN**

**Problem:**  
- **Erwartet:** 2'700 CHF (1'200 Zinsen + 1'500 Dividenden)
- **Tatsächlich im XML:** 1'200 CHF (nur Zinsen)
- **Differenz:** -1'500 CHF (Dividenden fehlen!)

**Wegleitung (2.4):**
> "Ertrag aus Nutzniessung ist zu 100% einzutragen."

**Wegleitung (8.5):**
> "Die Zinsen und Dividenden schweizerischer Wertpapiere sind der schweizerischen Verrechnungssteuer unterworfen."

**✅ KORREKTUR ERFORDERLICH:** Dividenden müssen hinzugefügt werden

---

### 1.3 Verrechnungssteuer

#### Berechnung gemäss Wegleitung (15.1-15.4):

**Verrechnungssteuer = 35% des Bruttoertrags**

- **Zinsen:** 1'200 CHF × 35% = **420 CHF**
- **Dividenden:** 1'500 CHF × 35% = **525 CHF**
- **Total Verrechnungssteuer:** **945 CHF**

#### XML-Prüfung:

**❌ FEHLER:** Verrechnungssteuer wird **NICHT im XML deklariert**

**Wegleitung (15.3):**
> "Bei korrekter Deklaration in Steuererklärung wird Verrechnungssteuer vollständig zurückerstattet"

**Wegleitung (8.5):**
> "Aufzuführen wenn Verrechnungssteuer abgezogen wurde. Bescheinigung der Lotteriegesellschaft oder Bank bzw. Auszahlungsabschnitt der Post ist beizulegen."

**eCH-0119 XSD:**  
Verrechnungssteuer sollte in `listOfSecurities` mit `withholdingTax` (moneyType2) deklariert werden.

**✅ KORREKTUR ERFORDERLICH:** Verrechnungssteuer muss deklariert werden

---

## 2. ABZÜGE - PRÜFUNG

### 2.1 Berufsauslagen (Ziffer 11)

#### Testfall-Daten:
- **ÖV-Kosten:** 1'200 CHF

#### XML-Werte:
```xml
<jobExpensesPartner1>
  <cantonalTax>4800</cantonalTax>
  <federalTax>4800</federalTax>
</jobExpensesPartner1>
```

#### Prüfung gemäss Wegleitung (3.1.1):

**ÖV-Kosten:**
- **Maximum Staat:** CHF 5'200
- **Maximum Bund:** CHF 3'300
- **Tatsächlich:** 1'200 CHF
- **Abzugsfähig:** 1'200 CHF ✅

**Übrige Berufsauslagen (3.1.3):**
- **Pauschale:** 3% des Nettolohnes, mindestens CHF 2'000, höchstens CHF 4'000
- **Nettolohn:** 135'000 CHF (Hauptberuf + Nebenerwerb)
- **3% von 135'000:** 4'050 CHF → **Maximum 4'000 CHF** ✅

**Total Berufsauslagen:**
- **Erwartet:** 1'200 (ÖV) + 4'000 (Pauschale) = **5'200 CHF**
- **Tatsächlich im XML:** 4'800 CHF
- **Differenz:** -400 CHF

**⚠️ WARNUNG:** Pauschale könnte falsch berechnet sein (3% von 135'000 = 4'050, aber Maximum 4'000)

**✅ PRÜFUNG ERFORDERLICH:** Berechnung der Pauschale prüfen

---

### 2.2 Beiträge an die 3. Säule a (Ziffer 14)

#### Testfall-Daten:
- **Beitrag:** 7'056 CHF

#### XML-Werte:
```xml
<provision3aPartner1Deduction>
  <cantonalTax>7056</cantonalTax>
  <federalTax>7056</federalTax>
</provision3aPartner1Deduction>
```

#### ❌ **FEHLER GEFUNDEN**

**Wegleitung (3.4):**
> "Mit Anschluss an 2. Säule (Pensionskasse): **CHF 7'258**"

**Problem:**
- **Wegleitung 2025:** Maximum 7'258 CHF
- **Tatsächlich im XML:** 7'056 CHF (Maximum 2024!)
- **Code verwendet:** 7'056 CHF in `mappers.ts:279` (falsch für 2025)

**Hinweis:** Testfall ist für 2024, aber Wegleitung ist 2025. Für 2024 wäre 7'056 CHF korrekt.

**✅ FÜR 2025 KORREKTUR ERFORDERLICH:** Maximum auf 7'258 CHF erhöhen

---

### 2.3 Versicherungsprämien und Zinsen (Ziffer 15)

#### Testfall-Daten:
- **Versicherungsprämien:** 3'500 CHF

#### XML-Werte:
```xml
<insuranceAndInterest>
  <cantonalTax>2900</cantonalTax>
  <federalTax>1800</federalTax>
</insuranceAndInterest>
```

#### Prüfung gemäss Wegleitung (3.5):

**Maximale Abzüge für Ledige mit Beiträgen an 2. oder 3. Säule a:**
- **Staatssteuer:** CHF 2'900 ✅
- **Bundessteuer:** CHF 1'800 ✅

**Berechnungsregel:**
- **(A)** Total bezahlte Prämien: 3'500 CHF
- **(B)** Maximum: 2'900 CHF (Staat) / 1'800 CHF (Bund)
- **Abzugsfähig:** Minimum von (A) und (B)

**Prüfung:**
- **Staat:** min(3'500, 2'900) = **2'900 CHF** ✅
- **Bund:** min(3'500, 1'800) = **1'800 CHF** ✅

**✅ KORREKT**

---

### 2.4 Spenden (Ziffer 16.5)

#### Testfall-Daten:
- **Spenden:** 500 CHF (300 + 200)

#### XML-Werte:
```xml
<deductionCharity>
  <cantonalTax>500</cantonalTax>
  <federalTax>500</federalTax>
</deductionCharity>
```

#### Prüfung gemäss Wegleitung (3.6.1):

**Gemeinnützige Zuwendungen:**
- **Abzugsfähig:** 20% des steuerbaren Einkommens (Staat) / 20% des steuerbaren Einkommens (Bund)
- **Maximum:** Keine explizite Obergrenze in Wegleitung

**Prüfung:**
- **Spenden:** 500 CHF
- **Bei Einkommen von 135'000 CHF:** 20% = 27'000 CHF (Maximum weit über 500 CHF)
- **Abzugsfähig:** 500 CHF ✅

**✅ KORREKT**

---

## 3. REVENUE-BERECHNUNG - PRÜFUNG

### 3.1 Total Amount Revenue

#### XML-Werte:
```xml
<totalAmountRevenue>
  <cantonalTax>158100</cantonalTax>
  <federalTax>156900</federalTax>
</totalAmountRevenue>
```

#### Manuelle Berechnung:

**Einkünfte:**
- Erwerbseinkommen: 135'000 CHF (sollte sein, aber XML zeigt 156'900)
- Wertschriftenertrag: 2'700 CHF (sollte sein, aber XML zeigt 1'200)

**Erwartet (korrekt):**
- **Kantonal:** 135'000 + 2'700 = **137'700 CHF**
- **Bundes:** 135'000 + 2'700 = **137'700 CHF**

**Tatsächlich im XML:**
- **Kantonal:** 158'100 CHF
- **Bundes:** 156'900 CHF

#### ❌ **FEHLER GEFUNDEN**

**Problem:**  
- **Kantonal:** +20'400 CHF zu hoch
- **Bundes:** +19'200 CHF zu hoch

**Ursachen:**
1. ❌ Erwerbseinkommen falsch (156'900 statt 135'000)
2. ❌ Wertschriftenertrag unvollständig (1'200 statt 2'700)

**✅ KORREKTUR ERFORDERLICH**

---

### 3.2 Total Amount Deduction

#### XML-Werte:
```xml
<totalAmountDeduction>
  <cantonalTax>14756</cantonalTax>
  <federalTax>13656</federalTax>
</totalAmountDeduction>
```

#### Manuelle Berechnung:

**Abzüge:**
- Berufsauslagen: 5'200 CHF (Staat) / 5'200 CHF (Bund) - aber XML zeigt 4'800
- Säule 3a: 7'056 CHF (beide)
- Versicherungen: 2'900 CHF (Staat) / 1'800 CHF (Bund)

**Erwartet (korrekt):**
- **Kantonal:** 5'200 + 7'056 + 2'900 = **15'156 CHF**
- **Bundes:** 5'200 + 7'056 + 1'800 = **14'056 CHF**

**Tatsächlich im XML:**
- **Kantonal:** 14'756 CHF
- **Bundes:** 13'656 CHF

#### ⚠️ **WARNUNG**

**Differenz:**
- **Kantonal:** -400 CHF (Berufsauslagen zu niedrig)
- **Bundes:** -400 CHF (Berufsauslagen zu niedrig)

**✅ PRÜFUNG ERFORDERLICH:** Berufsauslagen-Berechnung prüfen

---

### 3.3 Net Income

#### XML-Werte:
```xml
<netIncome>
  <cantonalTax>142144</cantonalTax>
  <federalTax>143244</federalTax>
</netIncome>
```

#### Manuelle Berechnung:

**Net Income = Total Revenue - Total Deduction**

**Erwartet (mit korrigierten Werten):**
- **Kantonal:** 137'700 - 15'156 = **122'544 CHF**
- **Bundes:** 137'700 - 14'056 = **123'644 CHF**

**Tatsächlich im XML:**
- **Kantonal:** 142'144 CHF
- **Bundes:** 143'244 CHF

#### ❌ **FEHLER GEFUNDEN**

**Problem:**  
- **Kantonal:** +19'600 CHF zu hoch
- **Bundes:** +19'600 CHF zu hoch

**Ursache:** Falsche Revenue- und Deduction-Berechnungen

**✅ KORREKTUR ERFORDERLICH**

---

### 3.4 Adjusted Net Income

#### XML-Werte:
```xml
<adjustedNetIncome>
  <cantonalTax>131644</cantonalTax>
  <federalTax>132744</federalTax>
</adjustedNetIncome>
```

#### Manuelle Berechnung:

**Adjusted Net Income = Net Income - Spenden - weitere Abzüge**

**Erwartet (mit korrigierten Werten):**
- **Kantonal:** 122'544 - 500 = **122'044 CHF**
- **Bundes:** 123'644 - 500 = **123'144 CHF**

**Tatsächlich im XML:**
- **Kantonal:** 131'644 CHF
- **Bundes:** 132'744 CHF

#### ❌ **FEHLER GEFUNDEN**

**Problem:**  
- **Kantonal:** +9'600 CHF zu hoch
- **Bundes:** +9'600 CHF zu hoch

**Ursache:** Falsche Net Income-Berechnung

**✅ KORREKTUR ERFORDERLICH**

---

## 4. VERRECHNUNGSSTEUER - DETAILLIERTE PRÜFUNG

### 4.1 Verrechnungssteuerpflichtige Erträge

#### Testfall:
- **Bankkonto:** 1'200 CHF Zinserträge (zinsUeber200: true)
- **Aktien:** 1'500 CHF Dividenden (Nestlé SA, schweizerisch)

#### Wegleitung (15.2):
> "Ja, Verrechnungssteuer: Zinsen auf Bankkonti (ab CHF 200 Bruttozins), Dividenden von schweizerischen Aktiengesellschaften"

**✅ Beide Erträge sind verrechnungssteuerpflichtig**

### 4.2 Verrechnungssteuer-Berechnung

**Formel:** Bruttoertrag × 35%

- **Zinsen:** 1'200 CHF × 35% = **420 CHF**
- **Dividenden:** 1'500 CHF × 35% = **525 CHF**
- **Total:** **945 CHF**

### 4.3 Rückerstattungsanspruch

#### Wegleitung (15.3):
> "Bei korrekter Deklaration in Steuererklärung wird Verrechnungssteuer vollständig zurückerstattet"

**Rückerstattungsanspruch:** **945 CHF**

### 4.4 XML-Deklaration

#### ❌ **FEHLER: Verrechnungssteuer wird NICHT deklariert**

**eCH-0119 Anforderung:**
- Verrechnungssteuer sollte in `listOfSecurities` deklariert werden
- Feld: `withholdingTax` (moneyType2, Decimal mit 2 Nachkommastellen)

**Aktuelles XML:** Keine `listOfSecurities` vorhanden

**✅ KORREKTUR ERFORDERLICH:** `listOfSecurities` mit Verrechnungssteuer hinzufügen

---

## 5. WERTSCHRIFTENERTRAG - DETAILLIERTE PRÜFUNG

### 5.1 Zinserträge (Bankkonto)

#### Testfall:
- **Bankkonto:** 50'000 CHF
- **Zinsertrag:** 1'200 CHF
- **zinsUeber200:** true → **mit Verrechnungssteuer**

#### Wegleitung (8.5):
> "Kundenguthaben mit einem Bruttozins von mehr als CHF 200 im Jahr" → Kolonne A (mit Verrechnungssteuer)

**✅ Korrekt:** Zinsertrag > 200 CHF, daher mit Verrechnungssteuer

#### XML:
```xml
<securitiesRevenue>
  <cantonalTax>1200</cantonalTax>
</securitiesRevenue>
```

**✅ Zinserträge korrekt deklariert (1'200 CHF)**

---

### 5.2 Dividenden (Aktien)

#### Testfall:
- **Aktien:** Nestlé SA, 30'000 CHF
- **Dividendenertrag:** 1'500 CHF
- **istQualifizierteBeteiligung:** false (1% Beteiligung)

#### Wegleitung (2.4.1):
> "Ausschüttungen aus Beteiligungen, die mindestens 10% des Grund- oder Stammkapitals darstellen" → Teilbesteuerung

**Prüfung:**
- **Beteiligungsquote:** 1% (< 10%)
- **Qualifizierte Beteiligung:** Nein
- **Besteuerung:** **100% steuerbar** (keine Teilbesteuerung)

#### Wegleitung (8.5):
> "Aktien, Partizipations- und Genussscheine von inländischen Gesellschaften" → Kolonne A (mit Verrechnungssteuer)

**✅ Dividenden sind verrechnungssteuerpflichtig**

#### ❌ **FEHLER: Dividenden fehlen im XML**

**XML zeigt nur:**
- `securitiesRevenue.cantonalTax = 1200` (nur Zinsen)

**Erwartet:**
- `securitiesRevenue.cantonalTax = 2700` (1'200 + 1'500)
- `securitiesRevenue.federalTax = 2700` (1'200 + 1'500)

**✅ KORREKTUR ERFORDERLICH:** Dividenden hinzufügen

---

## 6. LIEGENSCHAFTEN - PRÜFUNG

### 6.1 Eigenmietwert

#### Testfall:
- **Liegenschaft:** Eigentumswohnung, 520'000 CHF
- **eigenmietwertOderMietertrag:** 24'000 CHF (2% des Werts)

#### Wegleitung (9.3):
> "Stockwerkeigentum: 4,25% des Land- und Zeitbauwertanteils"

**Prüfung:**
- **Wert:** 520'000 CHF
- **4,25%:** 520'000 × 0.0425 = **22'100 CHF**
- **Deklariert:** 24'000 CHF

#### ⚠️ **WARNUNG**

**Problem:**  
- **Erwartet:** 22'100 CHF (4,25% von 520'000)
- **Tatsächlich:** 24'000 CHF
- **Differenz:** +1'900 CHF

**Mögliche Ursachen:**
1. ⚠️ **Falsche Berechnung:** Sollte 4,25% sein, nicht 2%
2. ⚠️ **Anderer Liegenschaftstyp:** Vielleicht nicht Stockwerkeigentum?

**✅ PRÜFUNG ERFORDERLICH:** Eigenmietwert-Berechnung prüfen

### 6.2 Liegenschaften im XML

#### XML-Prüfung:

**❌ FEHLER:** Liegenschaften werden **NICHT im XML deklariert**

**eCH-0119 Anforderung:**
- Liegenschaften sollten in `revenue.propertyNotionalRentalValue` oder `revenue.propertyRevenueRent` deklariert werden
- Vermögenswert sollte in `asset.propertyHouseOrFlat` deklariert werden

**Aktuelles XML:** Keine Liegenschaften-Felder vorhanden

**✅ KORREKTUR ERFORDERLICH:** Liegenschaften hinzufügen

---

## 7. SCHULDZINSEN - PRÜFUNG

### 7.1 Schuldzinsen-Abzug

#### Testfall:
- **Hypothek:** 400'000 CHF
- **Schuldzinsen:** 10'000 CHF

#### Wegleitung (3.2):
> "Die Schuldzinsen auf Privatvermögen können von den steuerbaren Einkünften so weit in Abzug gebracht werden, als sie den Bruttoertrag aus beweglichem und unbeweglichem Privatvermögen (inkl. Eigenmietwert) und weiterer CHF 50'000 nicht übersteigen."

**Formel:**
```
Maximaler Schuldzinsenabzug = 
  Bruttoertrag Wertschriften
  + Bruttoertrag Liegenschaften (inkl. Eigenmietwert)
  + CHF 50'000
```

**Berechnung:**
- **Wertschriftenertrag:** 2'700 CHF (1'200 + 1'500)
- **Liegenschaftenertrag:** 24'000 CHF (Eigenmietwert)
- **Pauschale:** 50'000 CHF
- **Maximum:** 2'700 + 24'000 + 50'000 = **76'700 CHF**
- **Bezahlt:** 10'000 CHF
- **Abzugsfähig:** min(10'000, 76'700) = **10'000 CHF** ✅

#### XML-Prüfung:

**❌ FEHLER:** Schuldzinsen werden **NICHT im XML deklariert**

**eCH-0119 Anforderung:**
- Schuldzinsen sollten in `deduction.amountLiabilitiesInterest` deklariert werden

**Aktuelles XML:** Keine `amountLiabilitiesInterest` vorhanden

**✅ KORREKTUR ERFORDERLICH:** Schuldzinsen hinzufügen

---

## 8. VERMÖGEN - PRÜFUNG

### 8.1 Bewegliches Vermögen

#### XML-Werte:
```xml
<movablePropertyCashValue>
  <fiscalValue>5000</fiscalValue>
</movablePropertyCashValue>
<movablePropertySecuritiesAndAssets>
  <fiscalValue>85000</fiscalValue>
</movablePropertySecuritiesAndAssets>
<movablePropertyHeritageEtc>
  <fiscalValue>10000</fiscalValue>
</movablePropertyHeritageEtc>
<movablePropertyVehicle>
  <fiscalValue>15000</fiscalValue>
</movablePropertyVehicle>
<totalAmountAssets>
  <fiscalValue>235000</fiscalValue>
</totalAmountAssets>
```

#### Manuelle Berechnung:

**Vermögenswerte:**
- Bargeld: 5'000 CHF ✅
- Wertschriften: 50'000 (Bank) + 30'000 (Aktien) + 5'000 (Krypto) = 85'000 CHF ✅
- Edelmetalle: 10'000 CHF ✅
- Fahrzeug: 15'000 CHF ✅
- **Total beweglich:** 115'000 CHF

**Liegenschaften:**
- Eigentumswohnung: 520'000 CHF
- **Total Vermögen:** 115'000 + 520'000 = **635'000 CHF**

**Schulden:**
- Hypothek: 400'000 CHF
- **Nettovermögen:** 635'000 - 400'000 = **235'000 CHF** ✅

**✅ KORREKT:** Nettovermögen stimmt

---

## 9. ZUSAMMENFASSUNG DER FEHLER

### 9.1 Kritische Fehler (müssen behoben werden)

1. ❌ **Erwerbseinkommen falsch:**
   - **Erwartet:** 135'000 CHF
   - **Tatsächlich:** 156'900 CHF
   - **Differenz:** +21'900 CHF

2. ❌ **Dividenden fehlen:**
   - **Erwartet:** 1'500 CHF
   - **Tatsächlich:** 0 CHF
   - **Differenz:** -1'500 CHF

3. ❌ **Verrechnungssteuer nicht deklariert:**
   - **Erwartet:** 945 CHF (420 + 525)
   - **Tatsächlich:** Nicht vorhanden
   - **Konsequenz:** Rückerstattung nicht möglich

4. ❌ **Schuldzinsen nicht deklariert:**
   - **Erwartet:** 10'000 CHF
   - **Tatsächlich:** Nicht vorhanden
   - **Konsequenz:** Abzug nicht geltend gemacht

5. ❌ **Liegenschaften nicht deklariert:**
   - **Erwartet:** Eigenmietwert 24'000 CHF, Vermögenswert 520'000 CHF
   - **Tatsächlich:** Nicht vorhanden
   - **Konsequenz:** Einkommen und Vermögen unvollständig

### 9.2 Warnungen (sollten geprüft werden)

1. ⚠️ **Berufsauslagen zu niedrig:**
   - **Erwartet:** 5'200 CHF (1'200 ÖV + 4'000 Pauschale)
   - **Tatsächlich:** 4'800 CHF
   - **Differenz:** -400 CHF

2. ⚠️ **Säule 3a Limit:**
   - **Für 2025:** 7'258 CHF (aktuell 7'056 verwendet)
   - **Hinweis:** Testfall ist für 2024, daher aktuell OK

3. ⚠️ **Eigenmietwert-Berechnung:**
   - **Erwartet:** 22'100 CHF (4,25% von 520'000)
   - **Tatsächlich:** 24'000 CHF
   - **Differenz:** +1'900 CHF

---

## 10. EMPFEHLUNGEN

### 10.1 Sofortige Korrekturen

1. ✅ **Erwerbseinkommen-Berechnung korrigieren:**
   - Prüfen warum 156'900 statt 135'000 CHF
   - Vermutlich falsche Summierung in `computeTaxReturn()`

2. ✅ **Dividenden hinzufügen:**
   - `securitiesRevenue` muss Dividenden enthalten
   - Aktuell nur Zinsen deklariert

3. ✅ **Verrechnungssteuer deklarieren:**
   - `listOfSecurities` mit `withholdingTax` hinzufügen
   - Rückerstattungsanspruch von 945 CHF deklarieren

4. ✅ **Schuldzinsen hinzufügen:**
   - `deduction.amountLiabilitiesInterest` hinzufügen
   - Abzug von 10'000 CHF geltend machen

5. ✅ **Liegenschaften hinzufügen:**
   - `revenue.propertyNotionalRentalValue` für Eigenmietwert
   - `asset.propertyHouseOrFlat` für Vermögenswert

### 10.2 Code-Änderungen

1. ✅ **`computer.ts`:**
   - Erwerbseinkommen-Berechnung prüfen
   - Dividenden in Wertschriftenertrag einbeziehen

2. ✅ **`mappers.ts`:**
   - `securitiesRevenue` muss Zinsen + Dividenden enthalten
   - `amountLiabilitiesInterest` hinzufügen
   - Liegenschaften-Mapping implementieren

3. ✅ **`xml-generator.ts`:**
   - `listOfSecurities` mit Verrechnungssteuer generieren
   - Liegenschaften-Felder generieren

---

## 11. CODE-ANALYSE - URSACHEN DER FEHLER

### 11.1 Erwerbseinkommen falsch berechnet

#### Problem in `mappers.ts:224`:
```typescript
const employedMainRevenue: PartnerAmountType = {
  partner1Amount: computed.totalEinkuenfte > 0 ? formatMoney(computed.totalEinkuenfte) : undefined,
}
```

#### Problem in `computer.ts:270-274`:
```typescript
totalEinkuenfte = einkuenfteLohn + 
  nettoertragLiegenschaften + wertschriftenertragSteuerbar + 
  einkuenfteSozialversicherungTotal + erwerbsausfallentschaedigungTotal + 
  lebensOderRentenversicherungTotal + ertragGeschaeftsanteile
```

**❌ FEHLER:**  
`employedMainRevenue` sollte nur **Erwerbseinkommen** enthalten (Ziffer 1), nicht alle Einkünfte!

**Korrektur:**
```typescript
// FALSCH:
partner1Amount: computed.totalEinkuenfte

// RICHTIG:
partner1Amount: einkuenfteLohn  // Nur Erwerbseinkommen (135'000 CHF)
```

---

### 11.2 Dividenden fehlen in securitiesRevenue

#### Problem in `computer.ts:623-630`:
Aktien werden nur als Vermögenswert gemappt, nicht als Ertrag:
```typescript
data.aktien.data.map((v) =>
  wertschriftenArray.push({
    // ... nur Vermögenswert, kein Ertrag!
  }),
)
```

**❌ FEHLER:**  
Dividenden werden nicht in `wertschriftenArray` aufgenommen!

**Korrektur:**
```typescript
data.aktien.data.map((v) =>
  wertschriftenArray.push({
    // ... Vermögenswert ...
    wertMitVerrechnungssteuer: v.dividendenertrag, // wenn schweizerisch
  }),
)
```

---

### 11.3 Verrechnungssteuer nicht deklariert

**❌ FEHLER:**  
Keine `listOfSecurities` im XML generiert

**Ursache:**  
- `mappers.ts` mappt keine `listOfSecurities`
- `xml-generator.ts` generiert keine `listOfSecurities`

**Korrektur erforderlich:**
- `listOfSecurities` in `mappers.ts` implementieren
- `withholdingTax` (moneyType2) für Verrechnungssteuer berechnen

---

### 11.4 Schuldzinsen nicht deklariert

#### Problem in `mappers.ts:344`:
```typescript
// Note: amountLiabilitiesInterest - we don't have interest amount stored, only boolean "verschuldet"
```

**❌ FEHLER:**  
In `types.ts` gibt es `schuldzinsen.data.betrag`, aber es wird nicht gemappt!

**Korrektur:**
```typescript
const amountLiabilitiesInterest: TaxAmountType | undefined =
  data.schuldzinsen?.data?.betrag && data.schuldzinsen.data.betrag > 0
    ? {
        cantonalTax: formatMoney(data.schuldzinsen.data.betrag),
        federalTax: formatMoney(data.schuldzinsen.data.betrag),
      }
    : undefined
```

---

### 11.5 Liegenschaften nicht deklariert

**❌ FEHLER:**  
Keine Liegenschaften-Felder im XML

**Korrektur erforderlich:**
- `revenue.propertyNotionalRentalValue` für Eigenmietwert
- `asset.propertyHouseOrFlat` für Vermögenswert

---

## 12. FINALE BEWERTUNG

### 11.1 Steuerrechtliche Korrektheit

- ❌ **Einkünfte:** Teilweise falsch (Erwerbseinkommen zu hoch, Dividenden fehlen)
- ❌ **Abzüge:** Teilweise unvollständig (Schuldzinsen fehlen)
- ❌ **Verrechnungssteuer:** Nicht deklariert
- ❌ **Liegenschaften:** Nicht deklariert

### 11.2 Schema-Konformität

- ✅ **XSD:** Technisch korrekt (alle vorhandenen Felder sind schema-konform)
- ⚠️ **Vollständigkeit:** Unvollständig (wichtige Felder fehlen)

### 11.3 Sandbox-Tauglichkeit

- ❌ **NICHT sandbox-tauglich** in aktueller Form
- **Grund:** Fehlende Verrechnungssteuer-Deklaration, fehlende Liegenschaften, falsche Einkünfte

---

**Erstellt:** 2026-01-30  
**Prüfer:** Steuerrechtliche Validierung gegen Wegleitung  
**Status:** ❌ **KORREKTUREN ERFORDERLICH**

