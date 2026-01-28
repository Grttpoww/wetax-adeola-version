# 🔍 VOLLSTÄNDIGE CODEBASE-ANALYSE FÜR VERHEIRATETEN-WORKFLOW

**Datum:** Vollständige Inventarisierung aller Codebase-Elemente  
**Zweck:** Systematische Analyse für Implementation des Verheirateten-Workflows

---

## 📋 INVENTAR 1: DATENMODELL-INVENTAR

### **TaxReturnData - Vollständige TypeScript Definition**

**Datei:** `Wetax-app-server-main/src/types.ts:32-332`

```typescript
export type TaxReturnData = {
  // ========== PERSONENDATEN ==========
  personData: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      geburtsdatum: string | undefined        // Format: '10.12.2002' (required)
      vorname: string | undefined             // 'Andri' (required)
      nachname: string | undefined            // 'Meier' (required)
      adresse: string | undefined             // 'Gossauerstrasse 42' (required)
      plz: number | undefined                  // 8050 (required)
      stadt: string | undefined                // 'zurich' (required)
      land: string | undefined                // 'schweiz' (optional)
      zivilstand: string | undefined          // 'Ledig' | 'Verheiratet' (required) ⚠️ NO ENUM
      konfession: string | undefined          // 'reformiert' | 'roemischKatholisch' | ... (required)
      beruf: string | undefined               // (required)
      email: string | undefined                // (required)
      gemeindeBfsNumber: number | undefined   // BFS number of municipality (required)
    }
  }

  // ========== ZIVILSTAND & KINDER ==========
  verheiratet: {
    start: boolean | undefined                 // Yes/No Frage (required)
    finished: boolean | undefined
    data: {}                                   // ⚠️ LEER - keine Partnerdaten!
  }

  hatKinder: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  kinderImHaushalt: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      vorname: string | undefined
      nachname: string | undefined
      geburtsdatum: string | undefined
      inAusbildung: boolean | undefined
      schuleOderLehrfirma: string | undefined
      voraussichtlichBis: string | undefined
      andererElternteilZahlt: boolean | undefined
      unterhaltsbeitragProJahr: number | undefined
    }>
  }

  kinderAusserhalb: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      vorname: string | undefined
      nachname: string | undefined
      geburtsdatum: string | undefined
      adresse: string | undefined
      inAusbildung: boolean | undefined
      schuleOderLehrfirma: string | undefined
      voraussichtlichBis: string | undefined
    }>
  }

  // ========== EINKOMMEN ==========
  geldVerdient: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      von: string | undefined                  // Date format
      bis: string | undefined                  // Date format
      arbeitgeber: string | undefined
      arbeitsort: string | undefined
      urlaubstage: number | undefined
      nettolohn: number | undefined            // ⚠️ NUR Person 1 - kein partner2Nettolohn
      uploadedLohnausweis: boolean | undefined
      anzahlarbeitstage: number | undefined
    }>
  }

  // ========== ABZÜGE - BERUFSWEG ==========
  oevArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      kosten: number | undefined                // ⚠️ NUR Person 1
    }
  }

  veloArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}                                    // Yes/No only - fixed 700 CHF
  }

  autoMotorradArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      fehlenVonOev: boolean | undefined
      zeitersparnisUeber1h: boolean | undefined
      staendigeBenutzungArbeitszeit: boolean | undefined
      keinOevWeilKrankOderGebrechlich: boolean | undefined
      geleastesFahrzeug: boolean | undefined
    }
  }

  autoMotorradArbeitWege: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      arbeitsort: string | undefined
      anzahlArbeitstage: number | undefined
      anzahlKm: number | undefined
      fahrtenProTag: number | undefined
      rappenProKm: number | undefined
    }>
  }

  verpflegungAufArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      anzahlTage: number | undefined            // ⚠️ NUR Person 1
    }
  }

  essenVerbilligungenVomArbeitgeber: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  schichtarbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      wieVieleTageImJahr: number | undefined    // ⚠️ NUR Person 1
      immerSchichtarbeit: boolean | undefined
    }
  }

  wochenaufenthalt: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      datum: string | undefined
      bezeichung: string | undefined
      betrag: number | undefined
    }>
  }

  // ========== ABZÜGE - AUSBILDUNG ==========
  inAusbildung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      bezeichung: string | undefined
      betrag: number | undefined               // ⚠️ NUR Person 1
    }>
  }

  beitragArbeitgeberAusbildung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betragArbeitGeber: number | undefined     // ⚠️ NUR Person 1
    }
  }

  // ========== ABZÜGE - VORSORGE ==========
  saeule2: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      ordentlichBetrag: number | undefined     // ⚠️ NUR Person 1
      einkaufBetrag: number | undefined         // ⚠️ NUR Person 1
    }
  }

  ahvIVsaeule2Selber: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined                // ⚠️ NUR Person 1
    }
  }

  saeule3a: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined                // ⚠️ NUR Person 1
    }
  }

  // ========== ABZÜGE - VERSICHERUNGEN ==========
  versicherungspraemie: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined                // ⚠️ NUR Person 1 - KEIN partner2Betrag
    }
  }

  privateUnfall: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined                // ⚠️ NUR Person 1
    }
  }

  // ========== ABZÜGE - SPENDEN ==========
  spenden: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      datum: string | undefined
      bezeichnung: string | undefined
      betrag: number | undefined                // ⚠️ NUR Person 1
    }>
  }

  // ========== VERMÖGEN ==========
  bargeld: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined                // ⚠️ NUR Person 1
    }
  }

  edelmetalle: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined                // ⚠️ NUR Person 1
    }
  }

  bankkonto: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      bankGesellschaft: string | undefined
      kontoOderDepotNr: string | undefined
      staat: string | undefined
      bezeichnung: string | undefined
      waehrung: string | undefined
      steuerwertEndeJahr: number | undefined     // ⚠️ NUR Person 1
      zinsUeber200: boolean | undefined
      zinsbetrag: number | undefined
    }>
  }

  aktien: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      valorenNr: string | undefined
      ISIN: string | undefined
      gesellschaftTitel: string | undefined
      staat: string | undefined
      waehrung: string | undefined
      steuerwertEndeJahr: number | undefined    // ⚠️ NUR Person 1
      stueckzahl: number | undefined
      steuerwertProStueck: number | undefined
    }>
  }

  krypto: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      bank: string | undefined
      waehrung: string | undefined
      steuerwert: number | undefined            // ⚠️ NUR Person 1
      stueckzahl: number | undefined
      steuerwertProStueck: number | undefined
      ertragMitVerrechnungssteuer: number | undefined
    }>
  }

  motorfahrzeug: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      bezeichung: string | undefined
      kaufjahr: number | undefined
      kaufpreis: number | undefined              // ⚠️ NUR Person 1
    }
  }

  liegenschaften: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}                                     // ⚠️ LEER - nicht implementiert
  }

  // ========== SONSTIGE ==========
  rueckzahlungBank: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      vorname: string | undefined
      nachname: string | undefined
      iban: string | undefined
    }
  }

  inZuerich: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  einkuenfteSozialversicherung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  erwerbsausfallentschaedigung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  lebensOderRentenversicherung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  geschaeftsOderKorporationsanteile: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }

  verschuldet: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
}
```

### **⚠️ KRITISCHE BEFUNDE:**

1. **KEINE Partner-Datenfelder:**
   - ❌ Kein `partner2Vorname`, `partner2Nachname`, `partner2Geburtsdatum`
   - ❌ Kein `partner2Nettolohn` in `geldVerdient`
   - ❌ Kein `partner2Versicherungspraemie`
   - ❌ Keine separaten Arrays für Partner-Einkommen/Abzüge

2. **Zivilstand-Feld:**
   - ✅ Existiert: `personData.data.zivilstand: string | undefined`
   - ❌ **KEIN ENUM** - nur freier Text
   - ⚠️ Aktuell: Wird gesetzt durch `verheiratetScreen.update()` → `'Verheiratet'` oder `'Ledig'`
   - ⚠️ **Problem:** Keine Type-Safety, keine Validierung

3. **Verheiratet-Section:**
   - ✅ Existiert: `verheiratet: { start, finished, data: {} }`
   - ❌ **data ist LEER** - keine Partner-Informationen

4. **Default Values:**
   - **Datei:** `Wetax-app-server-main/src/constants.ts:4-228`
   - Alle Felder defaulten zu `undefined`
   - Keine Partner-Defaults vorhanden

---

## 📋 INVENTAR 2: BERECHNUNGS-INVENTAR

### **A. Einkommensberechnung**

**Datei:** `Wetax-app-server-main/src/computeTaxAmount.ts`

```typescript
export const computeTaxAmount = (taxReturn: TaxReturnData): IncomeReturnType => {
  // ⚠️ NUR geldVerdient wird berechnet
  // ⚠️ NUR Person 1 - keine Partner-Logik
  
  switch (key) {
    case 'geldVerdient': {
      income['geldVerdient'] = (value.data as TaxReturnData['geldVerdient']['data']).reduce(
        (acc, curr) => acc + (curr.nettolohn ?? 0),
        0,
      )
      return
    }
  }
}
```

**⚠️ PROBLEM:** Keine Partner-Einkommensberechnung

---

### **B. Abzugsberechnung**

**Datei:** `Wetax-app-server-main/src/computeDeductible.ts`

#### **1. Versicherungsprämien**

```typescript
case 'versicherungspraemie': {
  const data = value.data as TaxReturnData['versicherungspraemie']['data']
  const deductibleAmount = data.betrag ?? 0
  deductibles['versicherungspraemie'] = deductibleAmount
  // ⚠️ KEIN Limit hier - Limit wird in computer.ts gesetzt
  break
}

case 'privateUnfall': {
  const data = value.data as TaxReturnData['privateUnfall']['data']
  const deductibleAmount = data.betrag ?? 0
  deductibles['privateUnfall'] = deductibleAmount
  break
}
```

**⚠️ PROBLEM:** 
- NUR Person 1 wird berechnet
- Keine Partner-Aggregation
- Limits werden in `computer.ts` gesetzt (siehe unten)

#### **2. Berufsauslagen**

```typescript
case 'veloArbeit': {
  const fixedDeductibleAmount = 700  // ⚠️ HARDCODED
  deductibles['veloArbeit'] = value.start ? fixedDeductibleAmount : 0
  break
}

case 'autoMotorradArbeitWege': {
  // Berechnet: anzahlArbeitstage * anzahlKm * fahrtenProTag * rappenProKm
  deductibles['autoMotorradArbeitWege'] = data.reduce(
    (acc, { anzahlArbeitstage = 0, anzahlKm = 0, fahrtenProTag = 0, rappenProKm = 0 }) => {
      const betrag = anzahlArbeitstage * anzahlKm * fahrtenProTag * rappenToChf(rappenProKm)
      return acc + betrag
    },
    0,
  )
  break
}

case 'verpflegungAufArbeit': {
  const maxDays = Math.floor(3200 / 15)  // ⚠️ HARDCODED Limits
  const deductibleWithVerbilligung = 7.5  // ⚠️ HARDCODED
  const deductibleWithoutVerbilligung = 15  // ⚠️ HARDCODED
  // ... Berechnung
  break
}

case 'schichtarbeit': {
  const maxDays = Math.floor(3200 / 15)  // ⚠️ HARDCODED
  const deductiblePerDay = 15  // ⚠️ HARDCODED
  // ... Berechnung
  break
}
```

**⚠️ PROBLEM:** Alle Limits hardcoded, keine Partner-Logik

#### **3. Ausbildung**

```typescript
case 'inAusbildung': {
  const totalAmount = data.reduce((acc, { betrag = 0 }) => acc + betrag, 0)
  const paidByEmployer = taxReturn['beitragArbeitgeberAusbildung'].data.betragArbeitGeber ?? 0
  const deductibleAmount = totalAmount - paidByEmployer
  deductibles['inAusbildung'] = deductibleAmount
  break
}
```

**⚠️ PROBLEM:** NUR Person 1

#### **4. Säule 3a**

```typescript
case 'saeule3a': {
  const maxDeductibleAmount = 7056  // ⚠️ HARDCODED
  const deductibleAmount = Math.min(data.betrag ?? 0, maxDeductibleAmount)
  deductibles['saeule3a'] = deductibleAmount
  break
}
```

**⚠️ PROBLEM:** 
- Limit hardcoded
- NUR Person 1
- **Für Verheiratete:** Limit sollte verdoppelt werden (2x 7056)

#### **5. Spenden**

```typescript
case 'spenden': {
  const minSingleAmount = 100  // ⚠️ HARDCODED
  // TODO: Implement the total income calculation
  deductibles['spenden'] = data.reduce(
    (acc, { betrag = 0 }) => (acc + betrag >= minSingleAmount ? betrag : 0),
    0,
  )
  break
}
```

**⚠️ PROBLEM:** NUR Person 1, TODO vorhanden

---

### **C. Hauptberechnung (Orchestrator)**

**Datei:** `Wetax-app-server-main/src/computer.ts`

#### **1. Einkommen**

```typescript
const totalEinkuenfte = data.geldVerdient.data.reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)
const haupterwerb = data.geldVerdient.data.reduce((max, v) => {
  const currentNettolohn = v.nettolohn ?? 0
  return currentNettolohn > max ? currentNettolohn : max
}, 0)
const nebenerwerb = totalEinkuenfte - haupterwerb
```

**⚠️ PROBLEM:** NUR Person 1

#### **2. Versicherungsprämien Limits**

```typescript
const versicherungSubtotal =
  (data.versicherungspraemie.data.betrag ?? 0) + (data.privateUnfall.data.betrag ?? 0)
const saeulen3oder2 = data.saeule3a.start || data.saeule2?.start

// ⚠️ HARDCODED Limits - KEINE Zivilstand-Logik
const maxAbzugVersicherungStaat = saeulen3oder2 ? 2900 : 4350
const maxAbzugVersicherungBund = saeulen3oder2 ? 1800 : 2700

const versicherungenTotalStaat = Math.min(maxAbzugVersicherungStaat, versicherungSubtotal)
const versicherungenTotalBund = Math.min(maxAbzugVersicherungBund, versicherungSubtotal)
```

**⚠️ KRITISCHES PROBLEM:**
- Limits sind **HARDCODED** und **NICHT zivilstand-abhängig**
- Für Verheiratete sollten Limits **verdoppelt** werden:
  - Mit Säule 2/3a: Staat 5800 (2x 2900), Bund 3600 (2x 1800)
  - Ohne Säule 2/3a: Staat 8700 (2x 4350), Bund 5400 (2x 2700)

#### **3. Berufsauslagen Limits**

```typescript
// ⚠️ HARDCODED Limits
const arbeitswegTotalBund = Math.min(
  (data.oevArbeit?.data?.kosten ?? 0) + (veloArbeit ?? 0) + autoMotorradArbeitTotal,
  3200,  // ⚠️ HARDCODED
)
const arbeitswegTotalStaat = Math.min(
  (data.oevArbeit?.data?.kosten ?? 0) + (veloArbeit ?? 0) + autoMotorradArbeitTotal,
  5200,  // ⚠️ HARDCODED
)

const essenNichtVerbilligt = Math.min(15 * (data.verpflegungAufArbeit.data.anzahlTage ?? 0), 3200)
const essenVerbilligungenVomArbeitgeber = Math.min(7.5 * (data.verpflegungAufArbeit.data.anzahlTage ?? 0), 1600)

const schichtarbeit = Math.min((data.schichtarbeit.data.wieVieleTageImJahr ?? 0) * 15, 3200)

// ⚠️ HARDCODED Pauschalen
const uebrigeAbzuegeBeruf = Math.max(Math.min(4000, haupterwerb * 0.03), 2000)
const auslagenNebenerwerb = Math.max(Math.min(0.2 * nebenerwerb, 2400), 800)
```

**⚠️ PROBLEM:** 
- Alle Limits hardcoded
- Keine Partner-Logik
- Für Verheiratete sollten Limits verdoppelt werden

#### **4. Kinderabzug**

```typescript
const anzahlKinderImHaushalt = data.kinderImHaushalt?.data?.length ?? 0
const anzahlKinderAusserhalb = data.kinderAusserhalb?.data?.length ?? 0
const totalKinder = anzahlKinderImHaushalt + anzahlKinderAusserhalb

// ⚠️ HARDCODED Beträge
const kinderabzugStaat = totalKinder * 9300
const kinderabzugBund = totalKinder * 6800
```

**⚠️ PROBLEM:** 
- Beträge hardcoded
- **FUNKTIONIERT bereits für Verheiratete** (wird pro Kind berechnet, unabhängig von Zivilstand)

#### **5. Steuerberechnung**

```typescript
// Bundessteuer
const einkommenssteuerBund = einkommenssteuerBundCalc(reineinkommenBund)

// Kantonssteuer (nur Zürich)
const baseCantonalTax = calculateEinkommenssteuerStaat(
  reineinkommenStaat,
  data.personData?.data?.konfession ?? 'andere',
)

// Gemeindesteuer
const einkommenssteuerStaat = calculateMunicipalTax(
  baseCantonalTax,
  data.personData?.data?.gemeindeBfsNumber,
  data.personData?.data?.konfession ?? 'andere',
  municipalityRatesCache,
)
```

**⚠️ PROBLEM:** 
- Steuerberechnung berücksichtigt **NICHT** Zivilstand
- Für Verheiratete: **Splitting-Verfahren** notwendig (Einkommen wird halbiert, Steuer verdoppelt)

---

### **D. Steuerberechnungsfunktionen**

**Datei:** `Wetax-app-server-main/src/computeTaxes.ts`

#### **1. Bundessteuer**

```typescript
export function einkommenssteuerBundCalc(amount: number): number {
  // ⚠️ HARDCODED Brackets - für EINZELPERSONEN
  if (amount <= 15000) return 0
  else if (amount <= 32800) return 137.05 + (amount - 15000) * 0.0077
  // ... weitere Brackets
}
```

**⚠️ PROBLEM:** 
- Brackets für **Einzelpersonen**
- Für Verheiratete: **Splitting-Verfahren** (Einkommen / 2, Steuer * 2)

#### **2. Kantonssteuer (Zürich)**

```typescript
export function calculateEinkommenssteuerStaat(income: number, religion: string) {
  const brackets: Bracket[] = [
    [6700, 0.0],
    [4700, 0.02],
    // ... weitere Brackets
  ]
  
  const totalIncomeTaxKt = calculateIncomeTaxKt(income, brackets) * 2.19  // ⚠️ HARDCODED Multiplier
  
  const religionen: { [key: string]: number } = {
    reformiert: 1.1,
    roemischKatholisch: 1.1,
    christKatholisch: 1.14,
    andere: 1,
    keine: 1,
  }
  const multiplier = religionen[religion] ?? 1
  
  return totalIncomeTaxKt * multiplier
}
```

**⚠️ PROBLEM:** 
- Brackets für **Einzelpersonen**
- Für Verheiratete: **Splitting-Verfahren** notwendig

#### **3. Vermögenssteuer**

```typescript
export function calculateVermoegenssteuer(amount: number): number {
  // ⚠️ HARDCODED Brackets
  if (amount <= 77000) return 0
  else if (amount <= 308000) return (amount - 77000) * 0.0005
  // ... weitere Brackets
}
```

**⚠️ PROBLEM:** 
- Für Verheiratete: Vermögen wird **zusammen** versteuert (kein Splitting)
- **FUNKTIONIERT bereits** wenn beide Vermögen erfasst werden

---

## 📋 INVENTAR 3: FORMULAR-INVENTAR

### **A. Screen-Definitionen**

**Datei:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts`

#### **1. Verheiratet-Screen (YesNo)**

```typescript
const verheiratetScreen: ScreenT<'verheiratet'> = {
  name: ScreenEnum.Verheiratet,
  type: ScreenTypeEnum.YesNo,
  title: 'Zivilstand',
  question: 'Bist du Verheiratet?',
  text: '',
  dataKey: 'verheiratet',
  isDone: (v) => v.start !== undefined,
  update: (res, data) => ({
    ...data,
    personData: {
      ...data.personData,
      data: {
        ...data.personData.data,
        zivilstand: res.start ? 'Verheiratet' : 'Ledig',  // ⚠️ Setzt zivilstand
      },
    },
  }),
}
```

**⚠️ PROBLEM:**
- Setzt `zivilstand` auf `'Verheiratet'` oder `'Ledig'`
- **KEINE Partner-Datenfelder** werden angezeigt
- **KEINE conditional navigation** zu Partner-Screens

#### **2. PersonData-Screen (ObjForm)**

```typescript
const personalienScreen: ScreenT<'personData'> = {
  name: ScreenEnum.Personalien,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'personData',
  title: 'Personalien',
  isDone: (v) => {
    const d = v.data
    return !!(
      d.vorname &&
      d.nachname &&
      d.geburtsdatum &&
      d.zivilstand &&          // ⚠️ Required
      d.konfession &&
      d.gemeindeBfsNumber &&
      d.beruf &&
      d.adresse &&
      d.plz &&
      d.stadt &&
      d.email
    )
  },
  form: {
    fields: [
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('vorname'),
        // ⚠️ KEIN required-Flag, aber isDone prüft es
      },
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('nachname'),
      },
      {
        label: 'Geburtsdatum',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('geburtsdatum'),
      },
      {
        label: 'Zivilstand',
        type: FormFieldType.TextInput,  // ⚠️ TEXTINPUT - sollte SelectInput sein!
        inputProps: { placeholder: 'Zivilstand' },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('zivilstand'),
      },
      {
        label: 'Konfession',
        type: FormFieldType.SelectInput,
        items: [
          { label: 'Reformiert', value: 'reformiert' },
          { label: 'Römisch-katholisch', value: 'roemischKatholisch' },
          { label: 'Christ-katholisch', value: 'christKatholisch' },
          { label: 'Andere', value: 'andere' },
          { label: 'Keine', value: 'keine' },
        ],
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('konfession'),
      },
      {
        label: 'Gemeinde',
        type: FormFieldType.NumberSelectInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('gemeindeBfsNumber'),
      },
      {
        label: 'Beruf',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('beruf'),
      },
      {
        label: 'Adresse',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('adresse'),
      },
      {
        label: 'PLZ',
        type: FormFieldType.NumberInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('plz'),
      },
      {
        label: 'Stadt',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('stadt'),
      },
      {
        label: 'Email',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('email'),
      },
    ],
  },
}
```

**⚠️ PROBLEME:**
1. **Zivilstand ist TextInput** - sollte SelectInput sein
2. **KEINE Partner-Felder** (partner2Vorname, partner2Nachname, etc.)
3. **KEINE conditional rendering** basierend auf zivilstand

#### **3. GeldVerdient-Screen (ArrayForm)**

```typescript
const geldVerdientDetailScreen: ScreenT<'geldVerdient', TaxReturnData['geldVerdient']['data'][0]> = {
  name: ScreenEnum.GeldVerdientDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Lohn Hinzufügen',
  dataKey: 'geldVerdient',
  form: {
    fields: [
      {
        label: 'von',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('von'),
      },
      {
        label: 'bis',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('bis'),
      },
      {
        label: 'Arbeitgeber',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('arbeitgeber'),
      },
      {
        label: 'Arbeitsort',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('arbeitsort'),
      },
      {
        label: 'Nettolohn',
        type: FormFieldType.CurrencyInput,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('nettolohn'),
      },
      {
        label: 'Urlaubstage',
        type: FormFieldType.NumberInput,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('urlaubstage'),
      },
    ],
  },
}
```

**⚠️ PROBLEM:**
- **KEIN Feld** um zu markieren ob Einkommen von Person 1 oder Person 2 ist
- **KEINE separate Arrays** für Partner-Einkommen

#### **4. Versicherungspraemie-Screen (ObjForm)**

```typescript
const versicherungspraemieAmountScreen: ScreenT<'versicherungspraemie'> = {
  name: ScreenEnum.VersicherungspraemieAmount,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'versicherungspraemie',
  title: 'Versicherungsprämien',
  form: {
    fields: [
      {
        label: 'Betrag',
        type: FormFieldType.CurrencyInput,
        lens: Lens.fromProp<TaxReturnData['versicherungspraemie']['data']>()('betrag'),
      },
    ],
  },
}
```

**⚠️ PROBLEM:**
- **NUR ein Betrag-Feld** - keine Trennung Person 1 / Person 2
- **KEINE conditional logic** für Verheiratete

---

### **B. Conditional Rendering Pattern**

**Datei:** `Wetax-master/src/components/form/Form.tsx`

```typescript
type CommonFieldProps<FormData> = {
  isVisible?: (formData: FormData) => boolean  // ⚠️ Conditional rendering
  hide?: boolean
  isDisabled?: boolean
  validate?: (formData: FormData) => boolean
  required?: boolean
  // ...
}
```

**✅ FUNKTIONIERT:** `isVisible` wird bereits verwendet (z.B. in `kinderImHaushaltDetailScreen`)

**Beispiel:**
```typescript
{
  label: 'Schule oder Lehrfirma',
  type: FormFieldType.TextInput,
  lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('schuleOderLehrfirma'),
  isVisible: (data) => data.inAusbildung === true,  // ⚠️ Conditional
}
```

**⚠️ PROBLEM:**
- **KEINE Verwendung** von `isVisible` basierend auf `zivilstand`
- **KEINE Partner-Felder** die conditional angezeigt werden

---

### **C. Screen Navigation Pattern**

**Datei:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts`

```typescript
// YesNo Screens können conditional navigation haben
const verheiratetScreen: ScreenT<'verheiratet'> = {
  // ⚠️ KEINE yesScreen / noScreen definiert
  // Aktuell: awaitNext() navigiert zum nächsten Screen in SCREENS array
}
```

**⚠️ PROBLEM:**
- **KEINE conditional navigation** basierend auf Verheiratet-Status
- Wenn `verheiratet.start === true`, sollten Partner-Screens angezeigt werden

---

## 📋 INVENTAR 4: VALIDIERUNGS-INVENTAR

### **A. Field-Level Validations**

**Datei:** `Wetax-master/src/components/form/Form.tsx:194-234`

```typescript
const isFieldInvalid = (f: SingleFormField<FormData>): boolean => {
  // 1. Custom validate function
  if ('validate' in f && f.validate !== undefined) {
    const res = f.validate(props.data)
    invalidString = `Invalid value for: ${'label' in f ? f.label : ''}`
    return res
  }
  
  // 2. Required check
  if ('required' in f && f.required) {
    let val = f.lens.get(props.data)
    val = typeof val === 'string' ? val.trim() : val
    let isInvalid = val === '' || val === null || val === undefined
    invalidString = `Missing value for: ${'label' in f ? f.label : ''}`
    return isInvalid
  }
  
  return false
}
```

**⚠️ PROBLEM:**
- **KEINE Format-Validierung** für zivilstand (sollte Enum sein)
- **KEINE Cross-Field-Validierung** (z.B. "Wenn verheiratet, dann partner2Vorname required")

---

### **B. Format Validations**

**Datei:** `Wetax-master/src/shared/util.ts`

```typescript
// AHV-Nummer
export const AHV_REGEX = /^\d{3}\.\d{4}\.\d{4}\.\d{2}$/
export const testAHVNumber = (str: string) => {
  return AHV_REGEX.test(str)
}

// Email
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const testEmail = (str: string) => {
  return emailRegex.test(str)
}

// Phone
export const testPhoneNumber = (str: string) => {
  // ... komplexe Validierung
}
```

**⚠️ PROBLEM:**
- **KEINE Validierung** für zivilstand-Format
- **KEINE Validierung** für Partner-AHV-Nummer

---

### **C. Cross-Field Validations**

**⚠️ NICHT VORHANDEN:**
- Keine Validierung: "Wenn `zivilstand === 'Verheiratet'`, dann `partner2Vorname` required"
- Keine Validierung: "Wenn `verheiratet.start === true`, dann Partner-Daten erforderlich"

---

### **D. Zivilstand-abhängige Validations**

**⚠️ NICHT VORHANDEN:**
- Keine Logik die prüft: "Wenn verheiratet, dann..."
- Keine conditional required-Flags

---

## 📋 INVENTAR 5: KONSTANTEN-INVENTAR

### **A. Limits/Schwellenwerte**

#### **1. Versicherungsprämien Limits**

**Datei:** `Wetax-app-server-main/src/computer.ts:80-83`

```typescript
// ⚠️ HARDCODED - NICHT zivilstand-abhängig
const maxAbzugVersicherungStaat = saeulen3oder2 ? 2900 : 4350
const maxAbzugVersicherungBund = saeulen3oder2 ? 1800 : 2700
```

**⚠️ KRITISCH:**
- **Für Verheiratete sollten verdoppelt werden:**
  - Mit Säule 2/3a: Staat 5800, Bund 3600
  - Ohne Säule 2/3a: Staat 8700, Bund 5400

#### **2. Berufsauslagen Limits**

**Datei:** `Wetax-app-server-main/src/computer.ts:38-45`

```typescript
// ⚠️ HARDCODED
const arbeitswegTotalBund = Math.min(..., 3200)   // CHF 3'200
const arbeitswegTotalStaat = Math.min(..., 5200) // CHF 5'200
```

**Datei:** `Wetax-app-server-main/src/computeDeductible.ts:59-60`

```typescript
// ⚠️ HARDCODED
const maxDays = Math.floor(3200 / 15)  // Max 3200 CHF für Verpflegung
const deductibleWithVerbilligung = 7.5
const deductibleWithoutVerbilligung = 15
```

**Datei:** `Wetax-app-server-main/src/computer.ts:58`

```typescript
// ⚠️ HARDCODED Pauschalen
const uebrigeAbzuegeBeruf = Math.max(Math.min(4000, haupterwerb * 0.03), 2000)
const auslagenNebenerwerb = Math.max(Math.min(0.2 * nebenerwerb, 2400), 800)
```

**⚠️ PROBLEM:** Alle Limits hardcoded, keine Verdopplung für Verheiratete

#### **3. Säule 3a Limit**

**Datei:** `Wetax-app-server-main/src/computeDeductible.ts:127`

```typescript
const maxDeductibleAmount = 7056  // ⚠️ HARDCODED
```

**⚠️ PROBLEM:**
- **Für Verheiratete:** Sollte 2x 7056 = 14112 sein (pro Person)

#### **4. VeloArbeit Pauschale**

**Datei:** `Wetax-app-server-main/src/computeDeductible.ts:36`

```typescript
const fixedDeductibleAmount = 700  // ⚠️ HARDCODED
```

**⚠️ PROBLEM:** Für Verheiratete: 2x 700 = 1400 (wenn beide Velo nutzen)

#### **5. Kinderabzug Beträge**

**Datei:** `Wetax-app-server-main/src/computer.ts:97-98`

```typescript
const kinderabzugStaat = totalKinder * 9300  // ⚠️ HARDCODED
const kinderabzugBund = totalKinder * 6800   // ⚠️ HARDCODED
```

**✅ FUNKTIONIERT:** Bereits korrekt (pro Kind, unabhängig von Zivilstand)

#### **6. Spenden Minimum**

**Datei:** `Wetax-app-server-main/src/computeDeductible.ts:160`

```typescript
const minSingleAmount = 100  // ⚠️ HARDCODED
```

**✅ FUNKTIONIERT:** Bereits korrekt

---

### **B. Steuertarife**

#### **1. Bundessteuer Brackets**

**Datei:** `Wetax-app-server-main/src/computeTaxes.ts:1-25`

```typescript
export function einkommenssteuerBundCalc(amount: number): number {
  // ⚠️ HARDCODED Brackets für EINZELPERSONEN
  if (amount <= 15000) return 0
  else if (amount <= 32800) return 137.05 + (amount - 15000) * 0.0077
  else if (amount <= 42900) return 225.9 + (amount - 32800) * 0.0088
  // ... weitere Brackets
}
```

**⚠️ PROBLEM:** Brackets für Einzelpersonen, Splitting-Verfahren für Verheiratete notwendig

#### **2. Kantonssteuer Brackets (Zürich)**

**Datei:** `Wetax-app-server-main/src/computeTaxes.ts:45-59`

```typescript
const brackets: Bracket[] = [
  [6700, 0.0],
  [4700, 0.02],
  [4700, 0.03],
  [7600, 0.04],
  // ... weitere Brackets
]
const totalIncomeTaxKt = calculateIncomeTaxKt(income, brackets) * 2.19  // ⚠️ HARDCODED
```

**⚠️ PROBLEM:** Brackets für Einzelpersonen, Splitting-Verfahren notwendig

#### **3. Vermögenssteuer Brackets**

**Datei:** `Wetax-app-server-main/src/computeTaxes.ts:79-95`

```typescript
export function calculateVermoegenssteuer(amount: number): number {
  // ⚠️ HARDCODED Brackets
  if (amount <= 77000) return 0
  else if (amount <= 308000) return (amount - 77000) * 0.0005
  // ... weitere Brackets
}
```

**✅ FUNKTIONIERT:** Bereits korrekt (Vermögen wird zusammen versteuert)

---

### **C. Config-System**

**⚠️ KEIN Config-System vorhanden:**
- Alle Werte sind **HARDCODED** im Code
- **KEINE** Config-Datei für Limits
- **KEINE** Datenbank-Tabelle für Steuertarife
- **KEINE** Environment-Variablen

**Empfehlung:**
- Erstelle `Wetax-app-server-main/src/config/taxLimits.ts` für alle Limits
- Mache Limits zivilstand-abhängig

---

## 📊 ZUSAMMENFASSUNG: KRITISCHE LÜCKEN

### **P0 (Breaking - Muss implementiert werden):**

1. **Partner-Datenfelder fehlen komplett:**
   - ❌ `personData.data.partner2Vorname`
   - ❌ `personData.data.partner2Nachname`
   - ❌ `personData.data.partner2Geburtsdatum`
   - ❌ `personData.data.partner2Konfession`
   - ❌ Separate Einkommen/Abzüge für Partner

2. **Zivilstand-Enum fehlt:**
   - ❌ Aktuell: `string | undefined` (keine Type-Safety)
   - ✅ Sollte: `'ledig' | 'verheiratet' | 'geschieden' | 'verwitwet'`

3. **Versicherungsprämien Limits nicht zivilstand-abhängig:**
   - ❌ Aktuell: Hardcoded 2900/4350 (Staat), 1800/2700 (Bund)
   - ✅ Sollte: Verdoppelt für Verheiratete

4. **Steuerberechnung ohne Splitting-Verfahren:**
   - ❌ Aktuell: Einkommen wird direkt versteuert
   - ✅ Sollte: Splitting (Einkommen / 2, Steuer * 2)

### **P1 (Important):**

5. **Säule 3a Limit nicht verdoppelt:**
   - ❌ Aktuell: 7056 CHF
   - ✅ Sollte: 2x 7056 = 14112 für Verheiratete

6. **Berufsauslagen Limits nicht verdoppelt:**
   - ❌ Aktuell: 3200/5200 CHF
   - ✅ Sollte: Verdoppelt für Verheiratete

7. **Conditional Rendering fehlt:**
   - ❌ Partner-Felder werden nicht angezeigt wenn verheiratet
   - ❌ Conditional navigation fehlt

### **P2 (Nice-to-have):**

8. **Config-System für Limits:**
   - ❌ Aktuell: Alles hardcoded
   - ✅ Sollte: Config-Datei

9. **Validierung:**
   - ❌ Keine Cross-Field-Validierung
   - ❌ Keine Zivilstand-abhängige Validierung

---

**ENDE DES INVENTARS**



