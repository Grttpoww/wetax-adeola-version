# KINDERABZUG IMPLEMENTATION PLAN

## ÜBERBLICK

Dieses Dokument beschreibt, wie die Kinderabzüge in die bestehende Steuererklärungs-Applikation integriert worden wären. Die Implementierung erweitert die bestehende Funktionalität, ohne die vorhandene Architektur zu verändern.

**Wichtige Abweichung von Claude's Vorschlag:**
- **Kinderabzug Staatssteuer:** CHF 9'300 pro Kind
- **Kinderabzug Bundessteuer:** CHF 6'800 pro Kind
- Die Abzüge werden **separat** in `totalAbzuegeStaat` und `totalAbzuegeBund` verarbeitet (nicht in `computeDeductible.ts`)

---

## 1. BACKEND-ÄNDERUNGEN

### 1.1 Types (`Wetax-app-server-main/src/types.ts`)

**Lage:** Nach `hatKinder` (Zeile 69-73), vor `einkuenfteSozialversicherung`

**Hinzufügen:**

```typescript
kinderImHaushalt: {
  start: boolean | undefined
  finished: boolean | undefined
  data: Array<{
    vorname: string | undefined
    nachname: string | undefined
    geburtsdatum: string | undefined  // ISO date string
    inAusbildung: boolean | undefined
    schuleOderLehrfirma: string | undefined  // conditional on inAusbildung
    voraussichtlichBis: string | undefined  // conditional on inAusbildung, ISO date
    andererElternteilZahlt: boolean | undefined
    unterhaltsbeitragProJahr: number | undefined  // conditional on andererElternteilZahlt, CHF
  }>
}

kinderAusserhalb: {
  start: boolean | undefined
  finished: boolean | undefined
  data: Array<{
    vorname: string | undefined
    nachname: string | undefined
    geburtsdatum: string | undefined  // ISO date string
    adresse: string | undefined
    inAusbildung: boolean | undefined
    schuleOderLehrfirma: string | undefined  // conditional on inAusbildung
    voraussichtlichBis: string | undefined  // conditional on inAusbildung, ISO date
  }>
}
```

**Begründung:** Folgt dem bestehenden Pattern für Array-Datenstrukturen (z.B. `geldVerdient`, `inAusbildung`). Die Struktur mit `start`, `finished` und `data` ist konsistent mit dem Rest der Applikation.

---

### 1.2 Constants (`Wetax-app-server-main/src/constants.ts`)

**Lage:** In der `defaultTaxReturnData` Funktion, nach `hatKinder`

**Hinzufügen:**

```typescript
kinderImHaushalt: { start: undefined, finished: undefined, data: [] },
kinderAusserhalb: { start: undefined, finished: undefined, data: [] },
```

**Begründung:** Standard-Initialisierung für neue Datenfelder, konsistent mit anderen Array-Feldern.

---

### 1.3 Steuerberechnung (`Wetax-app-server-main/src/computer.ts`)

**WICHTIG:** Die Kinderabzüge werden **NICHT** in `computeDeductible.ts` hinzugefügt, sondern **direkt** in `computeTaxReturn()` berechnet, da sie unterschiedliche Beträge für Staat und Bund haben.

**Lage:** Nach der Berechnung von `versicherungenTotalStaat` und `versicherungenTotalBund` (Zeile 78-79), vor `totalAbzuegeStaat` (Zeile 86)

**Hinzufügen:**

```typescript
// Kinderabzüge berechnen
const anzahlKinderImHaushalt = data.kinderImHaushalt?.data?.length ?? 0
const anzahlKinderAusserhalb = data.kinderAusserhalb?.data?.length ?? 0
const totalKinder = anzahlKinderImHaushalt + anzahlKinderAusserhalb

// Abzüge: 9'300 CHF pro Kind für Staatssteuer, 6'800 CHF pro Kind für Bundessteuer
const kinderabzugStaat = totalKinder * 9300
const kinderabzugBund = totalKinder * 6800
```

**Dann in `totalAbzuegeStaat` integrieren (Zeile 86-91):**

```typescript
const totalAbzuegeStaat =
  totalBerufsauslagenStaat +
  (data.saeule3a?.data?.betrag ?? 0) +
  versicherungenTotalStaat +
  (data.ahvIVsaeule2Selber?.data.betrag ?? 0) +
  selbstgetrageneKostenAusbildung +
  kinderabzugStaat  // ← NEU
```

**Und in `totalAbzuegeBund` integrieren (Zeile 92-97):**

```typescript
const totalAbzuegeBund =
  totalBerufsauslagenBund +
  (data.saeule3a?.data?.betrag ?? 0) +
  versicherungenTotalBund +
  (data.ahvIVsaeule2Selber?.data.betrag ?? 0) +
  selbstgetrageneKostenAusbildung +
  kinderabzugBund  // ← NEU
```

**Begründung:**
- Die bestehende Architektur trennt bereits Staat- und Bund-Abzüge (siehe `arbeitswegTotalStaat` vs `arbeitswegTotalBund`, `versicherungenTotalStaat` vs `versicherungenTotalBund`)
- `computeDeductible.ts` gibt nur einen einzigen Wert pro Abzug zurück, daher passt die direkte Integration in `computer.ts` besser
- Die Berechnung erfolgt nach dem gleichen Pattern wie andere steuerart-spezifische Abzüge

**Optional - für Debugging/Transparenz in `ComputedTaxReturnT`:**

Falls die Kinderabzüge auch in der berechneten Steuererklärung sichtbar sein sollen, könnten folgende Felder zu `ComputedTaxReturnT` hinzugefügt werden:

```typescript
kinderabzugStaat: number
kinderabzugBund: number
anzahlKinder: number
```

Diese wären dann im Return-Objekt von `computeTaxReturn()` enthalten. **Dies ist optional** und hängt davon ab, ob diese Werte im PDF oder in der UI angezeigt werden sollen.

---

### 1.4 PDF-Generierung (`Wetax-app-server-main/src/pdf.ts`) - OPTIONAL

**Lage:** In der `PdfFieldsT` Definition, nach `personData` Mapping

**Hinzufügen (falls PDF-Template aktualisiert wird):**

```typescript
// Kinder im Haushalt
...kinderImHaushalt: ({ data }) => {
  return data.kinderImHaushalt.data.map((kind, index) => ({
    [`kind${index + 1}_name`]: `${kind.vorname || ''} ${kind.nachname || ''}`.trim(),
    [`kind${index + 1}_geburtsdatum`]: kind.geburtsdatum || '',
    [`kind${index + 1}_wohnort`]: 'Im Haushalt',
    [`kind${index + 1}_ausbildung`]: kind.inAusbildung 
      ? `${kind.schuleOderLehrfirma || ''} bis ${kind.voraussichtlichBis || ''}` 
      : '-',
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
},

// Kinder ausserhalb
...kinderAusserhalb: ({ data }) => {
  return data.kinderAusserhalb.data.map((kind, index) => ({
    [`kind_extern${index + 1}_name`]: `${kind.vorname || ''} ${kind.nachname || ''}`.trim(),
    [`kind_extern${index + 1}_geburtsdatum`]: kind.geburtsdatum || '',
    [`kind_extern${index + 1}_wohnort`]: kind.adresse || '',
    [`kind_extern${index + 1}_ausbildung`]: kind.inAusbildung 
      ? `${kind.schuleOderLehrfirma || ''} bis ${kind.voraussichtlichBis || ''}` 
      : '-',
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
},
```

**Begründung:** Diese Implementierung ist optional und hängt davon ab, ob das PDF-Template bereits Felder für Kinder enthält. Die Feldnamen müssen an das tatsächliche PDF-Template angepasst werden.

**Hinweis:** Die PDF-Generierung sollte erst implementiert werden, nachdem das PDF-Template aktualisiert wurde und die genauen Feldnamen bekannt sind.

---

## 2. FRONTEND-ÄNDERUNGEN

### 2.1 Enums (`Wetax-master/src/view/authenticated/taxReturn/enums.ts`)

**Lage:** Nach `HatKinder` (falls vorhanden) oder nach `Verheiratet`

**Hinzufügen:**

```typescript
KinderImHaushaltYesNo = 'KinderImHaushaltYesNo',
KinderImHaushaltOverview = 'KinderImHaushaltOverview',
KinderImHaushaltDetail = 'KinderImHaushaltDetail',

KinderAusserhalbYesNo = 'KinderAusserhalbYesNo',
KinderAusserhalbOverview = 'KinderAusserhalbOverview',
KinderAusserhalbDetail = 'KinderAusserhalbDetail',
```

**Begründung:** Folgt dem bestehenden Pattern für Screen-Enums.

---

### 2.2 Screen Types (`Wetax-master/src/view/authenticated/taxReturn/types.ts`)

**Lage:** In `ScreenArrayOverview` Type (Zeile 63-75)

**Erweitern um `maxItems` Property:**

```typescript
export type ScreenArrayOverview<K extends TaxReturnDataKey, U extends {}> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ArrayOverview
  helpText?: string
  text?: string
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  dataKey: K
  getLabel: (v: U) => string
  getSublabel?: (v: U) => string
  detailScreen: ScreenEnum
  maxItems?: number  // ← NEU: Optional property für maximale Anzahl Items
}
```

**Begründung:** 
- Erlaubt eine generische Lösung für Array-Übersichten mit Maximalanzahl
- Wiederverwendbar für zukünftige Fälle
- Optional, daher keine Breaking Changes für bestehende Screens

---

### 2.3 ArrayOverview Template (`Wetax-master/src/view/authenticated/taxReturn/screenTemplates/ArrayOverview.template.tsx`)

**Lage:** Beim "Hinzufügen" Button (Zeile 130-153)

**Ändern:**

```typescript
<Button
  label={'Hinzufügen'}
  type={ButtonType.ChromelessDark}
  disabled={screen.maxItems !== undefined && array.length >= screen.maxItems}  // ← NEU
  onPress={() => {
    // ... existing code
  }}
  style={{
    background: {
      borderRadius: 30,
      height: 55,
    },
  }}
/>
```

**Begründung:** 
- Einfache, saubere Implementierung
- Nutzt die neue `maxItems` Property
- Deaktiviert den Button, wenn das Maximum erreicht ist (bessere UX als Button zu verstecken)

---

### 2.4 Form Types - Conditional Fields (`Wetax-master/src/components/form/Form.tsx`)

**Status:** Das `hide` Property existiert bereits in `CommonFieldProps` (Zeile 85) und wird bereits verwendet (Zeile 331, 350).

**Keine Änderung nötig** - das bestehende `hide` Property kann direkt verwendet werden.

**Verwendung in Screen-Definitionen:**

```typescript
{
  label: 'Schule oder Lehrfirma',
  type: FormFieldType.TextInput,
  inputProps: { placeholder: 'Schule oder Lehrfirma' },
  lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('schuleOderLehrfirma'),
  hide: (data) => data.inAusbildung !== true,  // ← Bestehendes Pattern
}
```

**Begründung:** Das bestehende System unterstützt bereits conditional fields, keine Erweiterung nötig.

---

### 2.5 Screen Definitions (`Wetax-master/src/view/authenticated/taxReturn/screens.ts`)

**Lage:** Nach `verheiratetScreen`, vor den Einkommens-Screens

**Referenz-Pattern:** `inAusbildung` Screens (Zeile 559-628)

#### 2.5.1 Kinder im Haushalt - YesNo Screen

```typescript
const kinderImHaushaltYesNoScreen: ScreenT<'kinderImHaushalt'> = {
  name: ScreenEnum.KinderImHaushaltYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'kinderImHaushalt',
  title: 'Kinder im Haushalt',
  question: 'Hast du Kinder im Haushalt?',
  text: 'Kinder, die bei dir wohnen',
  isDone: (v) => v.start !== undefined,
}
```

**Begründung:** Standard YesNo-Screen, identisch mit anderen YesNo-Screens.

---

#### 2.5.2 Kinder im Haushalt - Overview Screen

```typescript
const kinderImHaushaltOverviewScreen: ScreenT<
  'kinderImHaushalt',
  TaxReturnData['kinderImHaushalt']['data'][0]
> = {
  name: ScreenEnum.KinderImHaushaltOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Kinder im Haushalt - Übersicht',
  dataKey: 'kinderImHaushalt',
  helpText: 'Gib alle Kinder an, die bei dir im Haushalt leben (max. 3).',
  detailScreen: ScreenEnum.KinderImHaushaltDetail,
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  getSublabel: (data) => data.geburtsdatum || '',
  isDone: (v) => v.data.length > 0 && v.data.length <= 3,
  hide: (v) => v.start !== true,
  maxItems: 3,  // ← Nutzt neue Property
}
```

**Begründung:**
- Folgt dem Pattern von `inAusbildungOverview`
- `maxItems: 3` aktiviert die Maximalanzahl-Logik im Template
- `isDone` validiert, dass mindestens 1 Kind vorhanden ist und max. 3

---

#### 2.5.3 Kinder im Haushalt - Detail Screen

```typescript
const kinderImHaushaltDetailScreen: ScreenT<
  'kinderImHaushalt',
  TaxReturnData['kinderImHaushalt']['data'][0]
> = {
  name: ScreenEnum.KinderImHaushaltDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Kind Hinzufügen',
  dataKey: 'kinderImHaushalt',
  helpText: 'Gib die Informationen zum Kind ein.',
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  overviewScreen: ScreenEnum.KinderImHaushaltOverview,
  isDone: (item) => {
    // Basis-Felder required
    const basicValid = !!(item.vorname && item.nachname && item.geburtsdatum)
    
    // Wenn in Ausbildung, dann Schule und Bis-Datum required
    const ausbildungValid = item.inAusbildung 
      ? !!(item.schuleOderLehrfirma && item.voraussichtlichBis)
      : true
    
    // Wenn andere Elternteil zahlt, dann Betrag required
    const unterhaltValid = item.andererElternteilZahlt
      ? !!(item.unterhaltsbeitragProJahr && item.unterhaltsbeitragProJahr > 0)
      : true
    
    return basicValid && ausbildungValid && unterhaltValid
  },
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Vorname' },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('vorname'),
      },
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Nachname' },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('nachname'),
      },
      {
        label: 'Geburtsdatum',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('geburtsdatum'),
      },
      {
        label: 'In Ausbildung',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('inAusbildung'),
      },
      {
        label: 'Schule oder Lehrfirma',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Schule oder Lehrfirma' },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('schuleOderLehrfirma'),
        hide: (data) => data.inAusbildung !== true,  // ← Conditional field
      },
      {
        label: 'Voraussichtlich bis',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('voraussichtlichBis'),
        hide: (data) => data.inAusbildung !== true,  // ← Conditional field
      },
      {
        label: 'Leistet der andere Elternteil Unterhaltsbeiträge?',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('andererElternteilZahlt'),
      },
      {
        label: 'Betrag pro Jahr (CHF)',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Betrag',
        },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('unterhaltsbeitragProJahr'),
        hide: (data) => data.andererElternteilZahlt !== true,  // ← Conditional field
      },
    ],
  },
}
```

**Begründung:**
- Folgt dem Pattern von `inAusbildungDetail`
- Conditional fields nutzen das bestehende `hide` Property
- `isDone` validiert alle required und conditional required Felder
- Die Validierung ist strikt: wenn eine Bedingung erfüllt ist, müssen die zugehörigen Felder ausgefüllt sein

---

#### 2.5.4 Kinder ausserhalb - YesNo Screen

```typescript
const kinderAusserhalbYesNoScreen: ScreenT<'kinderAusserhalb'> = {
  name: ScreenEnum.KinderAusserhalbYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'kinderAusserhalb',
  title: 'Kinder ausserhalb des Haushalts',
  question: 'Hast du Kinder ausserhalb des Haushalts, für die du unterhaltspflichtig bist?',
  text: 'Kinder, die nicht bei dir wohnen',
  isDone: (v) => v.start !== undefined,
}
```

---

#### 2.5.5 Kinder ausserhalb - Overview Screen

```typescript
const kinderAusserhalbOverviewScreen: ScreenT<
  'kinderAusserhalb',
  TaxReturnData['kinderAusserhalb']['data'][0]
> = {
  name: ScreenEnum.KinderAusserhalbOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Kinder ausserhalb - Übersicht',
  dataKey: 'kinderAusserhalb',
  helpText: 'Gib alle Kinder an, die ausserhalb deines Haushalts leben und für die du unterhaltspflichtig bist (max. 2).',
  detailScreen: ScreenEnum.KinderAusserhalbDetail,
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  getSublabel: (data) => data.adresse || '',
  isDone: (v) => v.data.length > 0 && v.data.length <= 2,
  hide: (v) => v.start !== true,
  maxItems: 2,  // ← Nutzt neue Property
}
```

---

#### 2.5.6 Kinder ausserhalb - Detail Screen

```typescript
const kinderAusserhalbDetailScreen: ScreenT<
  'kinderAusserhalb',
  TaxReturnData['kinderAusserhalb']['data'][0]
> = {
  name: ScreenEnum.KinderAusserhalbDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Kind Hinzufügen',
  dataKey: 'kinderAusserhalb',
  helpText: 'Gib die Informationen zum Kind ein.',
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  overviewScreen: ScreenEnum.KinderAusserhalbOverview,
  isDone: (item) => {
    // Basis-Felder required (inkl. Adresse)
    const basicValid = !!(item.vorname && item.nachname && item.geburtsdatum && item.adresse)
    
    // Wenn in Ausbildung, dann Schule und Bis-Datum required
    const ausbildungValid = item.inAusbildung 
      ? !!(item.schuleOderLehrfirma && item.voraussichtlichBis)
      : true
    
    return basicValid && ausbildungValid
  },
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Vorname' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('vorname'),
      },
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Nachname' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('nachname'),
      },
      {
        label: 'Geburtsdatum',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('geburtsdatum'),
      },
      {
        label: 'Adresse',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Strasse, PLZ, Ort' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('adresse'),
      },
      {
        label: 'In Ausbildung',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('inAusbildung'),
      },
      {
        label: 'Schule oder Lehrfirma',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Schule oder Lehrfirma' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('schuleOderLehrfirma'),
        hide: (data) => data.inAusbildung !== true,
      },
      {
        label: 'Voraussichtlich bis',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('voraussichtlichBis'),
        hide: (data) => data.inAusbildung !== true,
      },
    ],
  },
}
```

---

### 2.6 SCREENS Array (`Wetax-master/src/view/authenticated/taxReturn/screens.ts`)

**Lage:** Nach `verheiratetScreen`, vor den Einkommens-Screens

**Hinzufügen:**

```typescript
// Kinder im Haushalt
kinderImHaushaltYesNoScreen,
kinderImHaushaltOverviewScreen,
kinderImHaushaltDetailScreen,

// Kinder ausserhalb
kinderAusserhalbYesNoScreen,
kinderAusserhalbOverviewScreen,
kinderAusserhalbDetailScreen,
```

**Begründung:** Die Screens müssen in der richtigen Reihenfolge im Array stehen, damit die Navigation funktioniert.

---

## 3. ABWEICHUNGEN VON CLAUDE'S VORSCHLAG

### 3.1 Abzugsbeträge

**Claude:** CHF 9'500 pro Kind (einheitlich)  
**Diese Implementierung:** CHF 9'300 (Staat) und CHF 6'800 (Bund) pro Kind

**Begründung:** Die Anforderung des Users ist klar: unterschiedliche Beträge für Staat und Bund.

---

### 3.2 Berechnungsort

**Claude:** In `computeDeductible.ts`  
**Diese Implementierung:** Direkt in `computer.ts` in `totalAbzuegeStaat` und `totalAbzuegeBund`

**Begründung:**
- `computeDeductible.ts` gibt nur einen Wert pro Abzug zurück (siehe Return-Type `DeductibleReturnType`)
- Die bestehende Architektur trennt bereits Staat- und Bund-Abzüge direkt in `computer.ts`
- Andere steuerart-spezifische Abzüge (z.B. `arbeitswegTotalStaat` vs `arbeitswegTotalBund`) werden auch direkt in `computer.ts` berechnet
- Konsistenter mit der bestehenden Codebase

---

### 3.3 Max Items Property

**Claude:** Vorschlag, `maxItems` zu implementieren  
**Diese Implementierung:** Implementiert `maxItems` als optional Property in `ScreenArrayOverview`

**Begründung:**
- Generische, wiederverwendbare Lösung
- Optional, daher keine Breaking Changes
- Saubere Integration in bestehende Architektur

---

### 3.4 Conditional Fields

**Claude:** Vorschlag, `hide` Property zu prüfen/implementieren  
**Diese Implementierung:** Nutzt bestehendes `hide` Property (bereits vorhanden)

**Begründung:** Das Property existiert bereits in `Form.tsx`, keine Änderung nötig.

---

### 3.5 PDF-Generierung

**Claude:** Detaillierte PDF-Mapping-Implementierung  
**Diese Implementierung:** Markiert als optional, da PDF-Template-Feldnamen unbekannt

**Begründung:** 
- PDF-Template muss zuerst aktualisiert werden
- Feldnamen müssen an tatsächliches Template angepasst werden
- Besser, diese Implementierung später zu machen, wenn Template bekannt ist

---

## 4. IMPLEMENTATION CHECKLIST

### Backend
- [ ] Types in `types.ts` hinzugefügt
- [ ] Constants in `constants.ts` hinzugefügt
- [ ] Kinderabzug-Berechnung in `computer.ts` implementiert
- [ ] `totalAbzuegeStaat` erweitert
- [ ] `totalAbzuegeBund` erweitert
- [ ] Optional: `ComputedTaxReturnT` erweitert (für Debugging)
- [ ] `npm run generate:spec` ausgeführt (OpenAPI regeneriert)
- [ ] Backend kompiliert ohne Fehler

### Frontend
- [ ] Enums hinzugefügt
- [ ] `maxItems` Property zu `ScreenArrayOverview` hinzugefügt
- [ ] `ArrayOverview.template.tsx` erweitert (disabled-Logik)
- [ ] 6 neue Screens definiert (YesNo, Overview, Detail für beide)
- [ ] Screens zu `SCREENS` Array hinzugefügt
- [ ] `npm run openapi` ausgeführt (Frontend OpenAPI Client regeneriert)
- [ ] Frontend kompiliert ohne Fehler

### Testing
- [ ] Navigation zu Kinder-Screens funktioniert
- [ ] YesNo-Screen navigiert korrekt
- [ ] Overview zeigt Liste korrekt an
- [ ] Detail-Form rendert alle Felder
- [ ] Conditional fields erscheinen/verschwinden korrekt
- [ ] Max Items: "Hinzufügen" deaktiviert bei 3 (im Haushalt) / 2 (ausserhalb)
- [ ] Validierung funktioniert (required + conditional required)
- [ ] Daten werden korrekt gespeichert
- [ ] Steuerbetrag aktualisiert sich (kinderabzugStaat und kinderabzugBund angewendet)

### Optional (später)
- [ ] PDF-Template aktualisiert
- [ ] PDF-Mapping implementiert
- [ ] PDF-Generierung getestet

---

## 5. TECHNISCHE NOTIZEN

### 5.1 Datenfluss

```
User Input (Frontend)
  ↓
TaxReturnData (MongoDB)
  ↓
computeTaxReturn() (Backend)
  ├─ Berechnet kinderabzugStaat (9'300 × Anzahl)
  ├─ Berechnet kinderabzugBund (6'800 × Anzahl)
  ├─ Addiert zu totalAbzuegeStaat
  ├─ Addiert zu totalAbzuegeBund
  ├─ Berechnet nettoEinkommenStaat/Bund
  └─ Berechnet Steuern
```

### 5.2 Abhängigkeiten

- **Backend:** Keine neuen Dependencies
- **Frontend:** Keine neuen Dependencies
- **OpenAPI:** Muss nach Backend-Änderungen regeneriert werden

### 5.3 Breaking Changes

**Keine Breaking Changes:**
- Alle neuen Types sind optional (`| undefined`)
- `maxItems` ist optional
- Bestehende Screens bleiben unverändert

### 5.4 Migration

**Keine Migration nötig:**
- Neue Felder haben Default-Werte (`start: undefined, finished: undefined, data: []`)
- Bestehende TaxReturns funktionieren weiterhin

---

## 6. ZUSAMMENFASSUNG

Diese Implementierung erweitert die bestehende Applikation um Kinderabzüge, ohne die Architektur zu verändern. Die wichtigsten Punkte:

1. **Backend:** Kinderabzüge werden direkt in `computer.ts` berechnet (nicht in `computeDeductible.ts`), da unterschiedliche Beträge für Staat und Bund
2. **Frontend:** Folgt dem bestehenden Pattern (`inAusbildung` als Referenz)
3. **Conditional Fields:** Nutzt bestehendes `hide` Property
4. **Max Items:** Neue, optionale Property für generische Lösung
5. **PDF:** Optional, kann später implementiert werden

Die Implementierung ist konsistent mit der bestehenden Codebase und erfordert keine Breaking Changes.









