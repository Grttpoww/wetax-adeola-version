# Authenticated Screens Analysis - Real Estate Tax Pattern Guide

**Date:** Analysis of existing authenticated screens  
**Purpose:** Understand form patterns to replicate for real estate tax

---

## 1. SCREEN INVENTORY

### All Screens in `Wetax-master/src/view/authenticated/taxReturn/`

**File:** `screens.ts` (1653 lines) - Contains all screen definitions

| Screen Type | File Path | Purpose | Key Components |
|------------|-----------|---------|----------------|
| **YesNo Screens** | `screenTemplates/YesNo.template.tsx` | Binary questions (e.g., "Do you own property?") | Yes/No buttons, conditional navigation |
| **Object Form** | `screenTemplates/FormObj.template.tsx` | Single object data entry (e.g., insurance amount) | Form component, lens-based updates |
| **Array Form** | `screenTemplates/FormArray.template.tsx` | Multiple items (e.g., multiple properties) | Form component, array management |
| **Array Overview** | `screenTemplates/ArrayOverview.template.tsx` | List of items with add/edit/delete | TouchableOpacity list, add button |
| **Category Overview** | `screenTemplates/Category.template.tsx` | Category grouping (e.g., "Assets", "Deductions") | Category navigation |
| **Scan/Upload** | `screenTemplates/ScanOrUpload.template.tsx` | Document scanning/upload | Camera, file picker |
| **Generate PDF** | `screenTemplates/GeneratePdf.template.tsx` | PDF generation | PDF download |

### Representative Financial Data Screens

**1. Education (`inAusbildung`) - Array Pattern**
- **YesNo:** `inAusbildungScreen` (line 559-567)
- **Overview:** `inAusbildungOverview` (line 569-581)
- **Detail:** `inAusbildungDetail` (line 583-628)
- **Purpose:** Collect multiple education expenses

**2. Bank Accounts (`bankkonto`) - Array Pattern**
- **Overview:** `bankkontoOverview` (line 882-892)
- **Detail:** `bankkontoDetail` (line 894-975)
- **Upload:** `bankkontoUpload` (line 1506-1554)
- **Purpose:** Multiple bank accounts with complex fields

**3. Motor Vehicle (`motorfahrzeug`) - Object Pattern**
- **YesNo:** `motorfahrzeugYesNoScreen` (line 1178-1186)
- **Detail:** `motorfahrzeugDetailScreen` (line 1187-1230)
- **Purpose:** Single vehicle with description, purchase year, price

---

## 2. FORM PATTERN ANALYSIS

### Pattern 1: Array Form (Multiple Properties) - `inAusbildungDetail`

**File:** `screens.ts:583-628`

```typescript
const inAusbildungDetail: ScreenT<'inAusbildung', TaxReturnData['inAusbildung']['data'][0]> = {
  name: ScreenEnum.InAusbildungDetail,
  type: ScreenTypeEnum.ArrayForm,  // ← Array form type
  title: 'Ausbildung Detail',
  dataKey: 'inAusbildung',  // ← Maps to taxReturn.data.inAusbildung
  helpText: `Gib die Kosten der Aus- oder Weiterbildung an...`,
  getLabel: (data) => data.bezeichung || 'Not finished',
  overviewScreen: ScreenEnum.InAusbildungOverview,  // ← Navigation back
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,  // ← Conditional visibility
  form: {
    fields: [
      {
        label: 'Bezeichung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bezeichung',
        },
        lens: Lens.fromProp<TaxReturnData['inAusbildung']['data'][0]>()('bezeichung'),  // ← Lens binding
      },
      {
        label: 'Betrag',
        type: FormFieldType.CurrencyInput,  // ← Currency input
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: '',
        },
        lens: Lens.fromProp<TaxReturnData['inAusbildung']['data'][0]>()('betrag'),
      },
    ],
  },
}
```

**Key Patterns:**
1. **Type:** `ScreenTypeEnum.ArrayForm` for multiple items
2. **Data Key:** Maps to `taxReturn.data.inAusbildung.data[]` (array)
3. **Lens Binding:** `Lens.fromProp<Type>()('fieldName')` for each field
4. **Navigation:** `overviewScreen` for back navigation
5. **Validation:** `isDone` checks if form is complete
6. **Conditional:** `hide` function for conditional display

**Template Implementation:** `FormArray.template.tsx:11-201`

```typescript
export const FormArrayTemplate = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenArrayForm<T, U>
}) => {
  const { item } = useArrayManager<U>()  // ← Gets current item from array manager
  const { taxReturn, update } = useTaxReturn()  // ← Context access
  const { setScreen } = useScreenManager()  // ← Navigation

  const [formState, setFormState] = useState<U>(props.item)

  return (
    <ContentScrollView>
      <Form<U>
        formFields={screen.form.fields}  // ← Fields from screen definition
        data={formState}
        onChange={setFormState}  // ← Local state update
        setError={() => {}}
      />
      <Button
        label={'Weiter'}
        onPress={() => {
          updateItem(formState)  // ← Saves to array
          setScreen(screen.overviewScreen)  // ← Navigate back
        }}
      />
    </ContentScrollView>
  )
}
```

**Data Flow:**
1. User fills form → `setFormState` updates local state
2. User clicks "Weiter" → `updateItem(formState)` saves to array manager
3. Array manager updates → `update()` saves to backend via TaxReturn context
4. Navigation → `setScreen(overviewScreen)` goes back to list

---

### Pattern 2: Object Form (Single Property) - `motorfahrzeugDetailScreen`

**File:** `screens.ts:1187-1230`

```typescript
const motorfahrzeugDetailScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.MotorfahrzeugDetail,
  type: ScreenTypeEnum.ObjForm,  // ← Object form (single item)
  dataKey: 'motorfahrzeug',
  title: 'Motorfahrzeug',
  isDone: (v) =>
    v.data.bezeichung !== undefined && 
    v.data.kaufjahr !== undefined && 
    v.data.kaufpreis !== undefined,  // ← Validation
  hide: (v) => v?.start !== true,
  form: {
    fields: [
      {
        label: 'Bezeichnung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bezeichnung',
        },
        lens: Lens.fromProp<TaxReturnData['motorfahrzeug']['data']>()('bezeichung'),
      },
      {
        label: 'Kaufjahr',
        type: FormFieldType.NumberInput,  // ← Number input
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Kaufjahr',
        },
        lens: Lens.fromProp<TaxReturnData['motorfahrzeug']['data']>()('kaufjahr'),
      },
      {
        label: 'Kaufpreis',
        type: FormFieldType.CurrencyInput,  // ← Currency input
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Kaufpreis',
        },
        lens: Lens.fromProp<TaxReturnData['motorfahrzeug']['data']>()('kaufpreis'),
      },
    ],
  },
}
```

**Template Implementation:** `FormObj.template.tsx:11-67`

```typescript
export const FormObjTemplate = <T extends TaxReturnDataKey>(props: { screen: ScreenObjForm<T> }) => {
  const { screen } = props
  const { taxReturn, update } = useTaxReturn()  // ← Context access
  const { awaitNext } = useScreenManager()  // ← Navigation

  const lens = Lens.fromPath<TaxReturnData>()([screen.dataKey, 'data'])  // ← Lens to data object
  const initialData = lens.get(taxReturn.data)  // ← Get current data

  const [formState, setFormState] = useState<TaxReturnData[T]['data']>(initialData)

  return (
    <ContentScrollView>
      <Form<TaxReturnData[T]['data']>
        formFields={screen.form.fields}
        data={formState}
        onChange={setFormState}
        setError={() => {}}
      />
      <Button
        label={'Next'}
        onPress={() => {
          const updatedData = lens.set(formState)(taxReturn.data)  // ← Update via lens
          awaitNext()  // ← Auto-navigate to next screen
          update(updatedData)  // ← Save to backend
        }}
      />
    </ContentScrollView>
  )
}
```

**Key Differences from Array Form:**
1. **Type:** `ScreenTypeEnum.ObjForm` (single object, not array)
2. **Lens:** `Lens.fromPath([dataKey, 'data'])` (direct to object, not array item)
3. **Update:** Direct `lens.set(formState)(taxReturn.data)` (no array manager)
4. **Navigation:** `awaitNext()` (auto-advances to next screen in flow)

---

### Pattern 3: YesNo Screen (Gate Screen) - `motorfahrzeugYesNoScreen`

**File:** `screens.ts:1178-1186`

```typescript
const motorfahrzeugYesNoScreen: ScreenT<'motorfahrzeug'> = {
  name: ScreenEnum.MotorfahrzeugYesNo,
  type: ScreenTypeEnum.YesNo,  // ← Yes/No question
  dataKey: 'motorfahrzeug',
  title: 'Motorfahrzeug',
  text: '',
  question: 'Hast du ein eigenes Auto oder Motorrad?',  // ← Question text
  isDone: (v) => v?.start !== undefined,  // ← Done when answered
}
```

**Template Implementation:** `YesNo.template.tsx:12-156`

```typescript
export const YesNoTemplate = <T extends TaxReturnDataKey>(props: { screen: ScreenYesNo<T> }) => {
  const { taxReturn, update } = useTaxReturn()
  const { awaitNext, setScreen } = useScreenManager()

  const lens = Lens.fromPath<TaxReturnData>()([screen.dataKey, 'start'])  // ← Lens to 'start' boolean
  const value = lens.get(taxReturn.data)  // ← Current value (true/false/undefined)

  return (
    <ContentScrollView>
      <Text>{screen.question}</Text>
      <TouchableOpacity
        onPress={() => {
          const updatedData = lens.set(true)(taxReturn.data)  // ← Set start: true
          const finalData = screen.update
            ? screen.update({ ...taxReturn.data[screen.dataKey], start: true }, updatedData)  // ← Optional update function
            : updatedData
          update(finalData)  // ← Save to backend
          if (screen.yesScreen) {
            setScreen(screen.yesScreen)  // ← Navigate to yes screen
          } else {
            awaitNext()  // ← Auto-advance
          }
        }}
        style={{
          backgroundColor: value === true ? '#1d2dba' : '#fff',  // ← Visual feedback
        }}
      >
        <Text>Ja</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          const updatedData = lens.set(false)(taxReturn.data)  // ← Set start: false
          update(updatedData)
          if (screen.noScreen) {
            setScreen(screen.noScreen)  // ← Navigate to no screen
          } else {
            awaitNext()  // ← Auto-advance
          }
        }}
      >
        <Text>Nein</Text>
      </TouchableOpacity>
    </ContentScrollView>
  )
}
```

**Key Patterns:**
1. **Lens:** `Lens.fromPath([dataKey, 'start'])` (boolean flag)
2. **Update:** Sets `start: true` or `start: false`
3. **Navigation:** `yesScreen`/`noScreen` for conditional routing
4. **Optional:** `update` function for side effects (e.g., auto-fill other fields)

---

### Pattern 4: Array Overview (List Screen) - `inAusbildungOverview`

**File:** `screens.ts:569-581`

```typescript
const inAusbildungOverview: ScreenT<'inAusbildung', TaxReturnData['inAusbildung']['data'][0]> = {
  name: ScreenEnum.InAusbildungOverview,
  type: ScreenTypeEnum.ArrayOverview,  // ← List of items
  title: 'Übersicht Aus- und Weiterbildung',
  dataKey: 'inAusbildung',
  helpText: `Gib die Kosten der Aus- oder Weiterbildung an...`,
  detailScreen: ScreenEnum.InAusbildungDetail,  // ← Screen to edit item
  getLabel: (data) => data.bezeichung || 'Not finished',  // ← Display label
  getSublabel: (data) => `CHF ${data.betrag || 0}`,  // ← Display sublabel
  isDone: (v) => v.data.length > 0,  // ← Done if array has items
  hide: (v) => v.start !== true,  // ← Hide if not started
}
```

**Template Implementation:** `ArrayOverview.template.tsx:15-177`

```typescript
export const ArrayOverviewTemplate = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenArrayOverview<T, U>
}) => {
  const { update, taxReturn } = useTaxReturn()
  const { setScreen, next, awaitNext } = useScreenManager()
  const { setIndex, removeItem, data } = useArrayManager<U>()  // ← Array manager

  const array = data || []  // ← Get array from manager

  return (
    <ContentScrollView>
      {array.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setScreen(screen.detailScreen)  // ← Navigate to detail
            setIndex(index)  // ← Set which item to edit
          }}
        >
          <Text>{screen.getLabel(item)}</Text>  // ← Display label
          {screen.getSublabel && (
            <Text>{screen.getSublabel(item)}</Text>  // ← Display sublabel
          )}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation()
              removeItem(index)  // ← Delete item
            }}
          >
            <AntDesign name="delete" size={20} color="#a60202" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <Button
        label={'Hinzufügen'}  // ← Add new item
        onPress={() => {
          setIndex(array.length)  // ← Set index to end
          setScreen(screen.detailScreen)  // ← Navigate to detail
        }}
      />
      <Button
        label={'Weiter'}
        onPress={() => {
          update(lens.set(true)(taxReturn.data))  // ← Mark as finished
          setScreen(nextScreen)  // ← Navigate to next
        }}
      />
    </ContentScrollView>
  )
}
```

**Key Patterns:**
1. **Array Manager:** `useArrayManager<U>()` manages array state
2. **Display:** `getLabel` and `getSublabel` for item display
3. **Edit:** `setIndex(index)` + `setScreen(detailScreen)` to edit item
4. **Add:** `setIndex(array.length)` + `setScreen(detailScreen)` to add new
5. **Delete:** `removeItem(index)` to delete

---

## 3. TAXRETURN CONTEXT

**File:** `Wetax-master/src/context/TaxReturn.context.tsx`

### How Tax Return State is Managed

```typescript
export const TaxReturnProvider = (props: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [taxReturnId, _setTaxReturnId] = useState<string | undefined>()

  // Fetch tax return from API
  const { data: taxReturn } = useQuery({
    queryKey: ['taxReturn', taxReturnId],
    queryFn: fetchTaxReturn,
    enabled: !!taxReturnId,
  })

  // Fetch tax amount (calculated)
  const { data: taxAmount, refetch: refetchTaxAmount } = useQuery({
    queryKey: ['taxAmount', taxReturnId],
    queryFn: fetchTaxAmount,
    enabled: !!taxReturnId,
  })

  // Update mutation
  const update = useMutation({
    mutationFn: updateTaxReturn,
    onSuccess: (v, meta) => {
      // Update React Query cache
      queryClient.setQueryData<TaxReturn | undefined>(['taxReturn', taxReturnId!], (u) => {
        return u ? { ...u, data: meta, inc: new Date().getTime() } : undefined
      })
      refetchTaxAmount()  // ← Recalculate tax amount
    },
  })

  return (
    <TaxReturnContext.Provider
      value={{
        taxReturn,
        setTaxReturnId,
        taxReturnId,
        update: update.mutateAsync,  // ← Async function to update
        isUpdating: update.isPending,
        taxAmount,
      }}
    >
      {props.children}
    </TaxReturnContext.Provider>
  )
}
```

### Data Structure

**Matches Backend Types:** ✅ Yes - Uses `TaxReturnData` from OpenAPI client

```typescript
// From openapi client (generated)
type TaxReturn = {
  _id: string
  userId: string
  year: number
  created: Date
  archived: boolean
  validated?: boolean
  data: TaxReturnData  // ← Matches backend types.ts
}

type TaxReturnData = {
  liegenschaften: {  // ← Real estate field (currently empty)
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  // ... other fields
}
```

### Available Methods

**1. `update(data: TaxReturnData): Promise<void>`**
- Updates entire tax return data
- Calls `ApiService.updateTaxReturn(taxReturnId, { data })`
- Automatically refetches tax amount after update

**2. `setTaxReturnId(id: string | undefined): void`**
- Sets current tax return ID
- Persists to AsyncStorage (`@taxReturnId`)

**3. `taxReturn: TaxReturn | undefined`**
- Current tax return object
- Fetched via React Query

**4. `taxAmount: TaxAmount | undefined`**
- Calculated tax amounts
- `{ grossIncome, deductableAmount, taxableIncome, totalTaxes }`

### Integration with React Query

- **Query:** `useQuery` for fetching tax return and tax amount
- **Mutation:** `useMutation` for updates
- **Cache:** React Query cache automatically updated on mutation
- **Refetch:** Tax amount refetched after data update

### How `liegenschaften` Field is Currently Handled

**Current State:**
```typescript
// In types.ts (backend)
liegenschaften: {
  start: boolean | undefined
  finished: boolean | undefined
  data: {}  // ← Empty object
}
```

**Access Pattern:**
```typescript
const { taxReturn, update } = useTaxReturn()

// Access current data
const liegenschaften = taxReturn.data.liegenschaften

// Update via lens
const lens = Lens.fromPath<TaxReturnData>()(['liegenschaften', 'data'])
const newData = lens.set({ /* new data */ })(taxReturn.data)
update(newData)
```

**No screens currently use `liegenschaften`** - it's defined but unused.

---

## 4. NAVIGATION STRUCTURE

**File:** `Wetax-master/src/view/authenticated/Authenticated.navigator.tsx`

### Screen Organization

**Stack Navigator:**
```typescript
<AuthStack.Navigator>
  <AuthStack.Screen
    name={AuthenticatedNavigatorEnum.User}
    component={UserNavigator}  // ← User profile, subscriptions
  />
  <AuthStack.Screen
    name={AuthenticatedNavigatorEnum.TaxReturn}
    component={TaxReturnNavigator}  // ← Tax return flow
  />
</AuthStack.Navigator>
```

**Tax Return Navigator:** `TaxReturnNavigator.tsx`

```typescript
<TaxReturnStack.Navigator>
  <TaxReturnStack.Screen
    name={TaxReturnScreen.Overview}  // ← Overview/categories
    component={TaxReturnOverview}
  />
  <TaxReturnStack.Screen
    name={TaxReturnScreen.Flow}  // ← Individual form screens
    component={ScreenTemplateDelegator}
  />
</TaxReturnStack.Navigator>
```

### Navigation Flow

**1. Overview Screen** (`TaxReturnOverview.tsx`)
- Shows categories: Eignungsfragen, Einkünfte, Abzüge, Vermögen, Übersicht
- User clicks category → navigates to `TaxReturnScreen.Flow`

**2. Flow Screen** (`ScreenTemplateDelegator.tsx`)
- Delegates to appropriate template based on screen type
- Uses `ScreenManager.context` to track current screen
- Auto-advances through screens in `SCREENS` array

**3. Screen Order** (`screens.ts:1565-1652`)
```typescript
export const SCREENS: Array<ScreenT<any, any>> = [
  // Eignungsfragen (Eligibility)
  eignungsfragenOverviewScreen,
  inZuerichScreen,
  verheiratetScreen,
  // ...

  // Einkuenfte (Income)
  einkuenfteOverviewScreen,
  geldVerdientScreen,
  geldVerdientDetailScreen,
  geldVerdientOverviewScreen,

  // Abzuege (Deductions)
  abzuegeOverviewScreen,
  oevArbeitScreen,
  // ...

  // Vermoegen (Assets)
  vermoegenOverviewScreen,
  bargeldYesNoScreen,
  bankkontoOverview,
  aktienYesNoScreen,
  motorfahrzeugYesNoScreen,
  // ...

  // Übersicht (Summary)
  endOverviewScreen,
  personalienScreen,
  rueckzahlungBankScreen,
  generateScreen,
]
```

### Where Tax Input Screens Are

**Location:** Under `Vermoegen` (Assets) category:
- `bargeldYesNoScreen` → `bargeldAmountScreen`
- `bankkontoOverview` → `bankkontoDetail`
- `aktienYesNoScreen` → `aktienDetail` → `aktienOverview`
- `kryptoYesNoScreen` → `kryptoDetail` → `kryptoOverview`
- `motorfahrzeugYesNoScreen` → `motorfahrzeugDetailScreen`

### Where to Add Real Estate Screen

**Recommended Location:** After `motorfahrzeugDetailScreen` in `SCREENS` array

```typescript
export const SCREENS: Array<ScreenT<any, any>> = [
  // ... existing screens
  motorfahrzeugYesNoScreen,
  motorfahrzeugDetailScreen,
  
  // ← ADD HERE
  liegenschaftenYesNoScreen,  // ← New YesNo screen
  liegenschaftenOverviewScreen,  // ← New overview screen
  liegenschaftenDetailScreen,  // ← New detail screen
  
  endOverviewScreen,
  // ...
]
```

**Category:** Under `Vermoegen` (Assets) category, same as other assets

### How Navigation Between Tax Sections Works

**1. Category Overview → First Screen**
- User clicks category → `setScreen(firstScreenInCategory)`

**2. Screen-to-Screen Navigation**
- **Auto-advance:** `awaitNext()` moves to next screen in `SCREENS` array
- **Conditional:** `yesScreen`/`noScreen` for YesNo screens
- **Manual:** `setScreen(ScreenEnum.SpecificScreen)` for specific navigation

**3. Array Overview → Detail**
- `setIndex(index)` + `setScreen(detailScreen)` to edit item
- `setIndex(array.length)` + `setScreen(detailScreen)` to add new

**4. Detail → Overview**
- `setScreen(overviewScreen)` to go back to list

---

## 5. REAL ESTATE TEMPLATE

### Complete Template for Real Estate Form

**File:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts`

```typescript
// 1. Add to ScreenEnum (enums.ts)
export enum ScreenEnum {
  // ... existing
  LiegenschaftenYesNo = 'LiegenschaftenYesNo',
  LiegenschaftenOverview = 'LiegenschaftenOverview',
  LiegenschaftenDetail = 'LiegenschaftenDetail',
}

// 2. YesNo Screen (Gate)
const liegenschaftenYesNoScreen: ScreenT<'liegenschaften'> = {
  name: ScreenEnum.LiegenschaftenYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'liegenschaften',
  title: 'Liegenschaften',
  question: 'Besitzt du Immobilien (Grundstücke, Häuser, Wohnungen)?',
  text: 'z.B. Eigentumswohnung, Haus, Grundstück',
  helpText: 'Immobilien müssen für die Vermögenssteuer angegeben werden.',
  isDone: (v) => v.start !== undefined,
}

// 3. Array Overview Screen (List)
const liegenschaftenOverviewScreen: ScreenT<
  'liegenschaften',
  TaxReturnData['liegenschaften']['data'][0]  // ← Array item type
> = {
  name: ScreenEnum.LiegenschaftenOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Übersicht Liegenschaften',
  dataKey: 'liegenschaften',
  helpText: 'Gib alle deine Immobilien an. Für jede Immobilie benötigst du den Steuerwert.',
  detailScreen: ScreenEnum.LiegenschaftenDetail,
  getLabel: (data) => data.bezeichnung || data.adresse || 'Not finished',
  getSublabel: (data) => {
    const canton = data.canton ? ` (${data.canton})` : ''
    const value = data.steuerwert ? `CHF ${data.steuerwert}` : ''
    return `${value}${canton}`
  },
  isDone: (v) => v.data.length > 0,
  hide: (v) => v.start !== true,
}

// 4. Array Detail Screen (Form)
const liegenschaftenDetailScreen: ScreenT<
  'liegenschaften',
  TaxReturnData['liegenschaften']['data'][0]
> = {
  name: ScreenEnum.LiegenschaftenDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Liegenschaft Hinzufügen',
  dataKey: 'liegenschaften',
  helpText: 'Gib alle relevanten Informationen zu deiner Immobilie an.',
  getLabel: (data) => data.bezeichnung || data.adresse || 'Not finished',
  overviewScreen: ScreenEnum.LiegenschaftenOverview,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      // Property Description
      {
        label: 'Bezeichnung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'z.B. Eigentumswohnung, Einfamilienhaus',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('bezeichnung'),
      },
      // Address
      {
        label: 'Adresse',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Musterstrasse 30',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('adresse'),
      },
      // Postal Code
      {
        label: 'PLZ',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 4,
          placeholder: '8000',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('plz'),
      },
      // City
      {
        label: 'Stadt',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Zürich',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('stadt'),
      },
      // Canton (Select)
      {
        label: 'Kanton',
        type: FormFieldType.SelectInput,
        items: [
          { label: 'Zürich', value: 'ZH' },
          { label: 'Bern', value: 'BE' },
          { label: 'Luzern', value: 'LU' },
          { label: 'Uri', value: 'UR' },
          { label: 'Schwyz', value: 'SZ' },
          { label: 'Obwalden', value: 'OW' },
          { label: 'Nidwalden', value: 'NW' },
          { label: 'Glarus', value: 'GL' },
          { label: 'Zug', value: 'ZG' },
          { label: 'Fribourg', value: 'FR' },
          { label: 'Solothurn', value: 'SO' },
          { label: 'Basel-Stadt', value: 'BS' },
          { label: 'Basel-Landschaft', value: 'BL' },
          { label: 'Schaffhausen', value: 'SH' },
          { label: 'Appenzell Ausserrhoden', value: 'AR' },
          { label: 'Appenzell Innerrhoden', value: 'AI' },
          { label: 'St. Gallen', value: 'SG' },
          { label: 'Graubünden', value: 'GR' },
          { label: 'Aargau', value: 'AG' },
          { label: 'Thurgau', value: 'TG' },
          { label: 'Ticino', value: 'TI' },
          { label: 'Vaud', value: 'VD' },
          { label: 'Valais', value: 'VS' },
          { label: 'Neuchâtel', value: 'NE' },
          { label: 'Genève', value: 'GE' },
          { label: 'Jura', value: 'JU' },
        ],
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('canton'),
      },
      // Tax Value (Currency)
      {
        label: 'Steuerwert (CHF)',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Steuerwert',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('steuerwert'),
      },
      // Rental Value (Optional)
      {
        label: 'Mietwert (CHF)',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Mietwert (optional)',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('mietwert'),
      },
      // Owner-Occupied (Checkbox)
      {
        label: 'Eigennutzung (selbst bewohnt)',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('eigennutzung'),
      },
      // Purchase Year (Optional)
      {
        label: 'Kaufjahr',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 4,
          placeholder: '2020',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('kaufjahr'),
      },
      // Purchase Price (Optional)
      {
        label: 'Kaufpreis (CHF)',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Kaufpreis (optional)',
        },
        lens: Lens.fromProp<TaxReturnData['liegenschaften']['data'][0]>()('kaufpreis'),
      },
    ],
  },
}

// 5. Add to SCREENS array (after motorfahrzeug)
export const SCREENS: Array<ScreenT<any, any>> = [
  // ... existing screens
  motorfahrzeugYesNoScreen,
  motorfahrzeugDetailScreen,
  
  // Real Estate
  liegenschaftenYesNoScreen,
  liegenschaftenOverviewScreen,
  liegenschaftenDetailScreen,
  
  endOverviewScreen,
  // ...
]
```

### Required Backend Type Update

**File:** `Wetax-app-server-main/src/types.ts:298-303`

```typescript
liegenschaften: {
  start: boolean | undefined
  finished: boolean | undefined
  data: Array<{  // ← Change from {} to Array
    bezeichnung: string | undefined
    adresse: string | undefined
    plz: number | undefined
    stadt: string | undefined
    canton: string | undefined  // ← Canton code (ZH, BE, etc.)
    steuerwert: number | undefined  // ← Tax value (CHF)
    mietwert: number | undefined  // ← Rental value (optional)
    eigennutzung: boolean | undefined  // ← Owner-occupied
    kaufjahr: number | undefined  // ← Purchase year
    kaufpreis: number | undefined  // ← Purchase price
  }>
}
```

### Validation Logic

**In `isDone` functions:**
```typescript
// Overview: Done if array has at least one item
isDone: (v) => v.data.length > 0

// Detail: Done if required fields are filled
isDone: (v) => {
  const item = v.data[v.data.length - 1]  // Last item
  return !!(
    item.bezeichnung &&
    item.adresse &&
    item.plz &&
    item.stadt &&
    item.canton &&
    item.steuerwert !== undefined &&
    item.steuerwert > 0
  )
}
```

### API Mutation Call

**Automatic via TaxReturn Context:**
```typescript
// In FormArray.template.tsx
const { update } = useTaxReturn()  // ← Already available

// When user clicks "Weiter"
updateItem(formState)  // ← ArrayManager handles update
// → ArrayManager calls update() internally
// → update() calls ApiService.updateTaxReturn()
// → Backend saves to MongoDB
```

**No manual API call needed** - handled by context and array manager.

### Navigation Handling

**Automatic:**
- **YesNo → Overview:** `yesScreen: ScreenEnum.LiegenschaftenOverview`
- **Overview → Detail:** `setScreen(detailScreen)` when clicking item or "Hinzufügen"
- **Detail → Overview:** `setScreen(overviewScreen)` when clicking "Weiter" or "Cancel"
- **Overview → Next:** `awaitNext()` or manual `setScreen(nextScreen)`

---

## 6. DATA FLOW VERIFICATION

### Complete Example: Education Deduction (`inAusbildung`)

**Step 1: User Clicks Category**
```
TaxReturnOverview.tsx
  ↓ User clicks "Abzüge" category
  ↓ setScreen(ScreenEnum.Abzuege)
  ↓ Navigates to TaxReturnScreen.Flow
```

**Step 2: Screen Manager Routes to First Screen**
```
ScreenTemplateDelegator.tsx
  ↓ Reads currentScreen from ScreenManager.context
  ↓ Finds screen in SCREENS array
  ↓ Renders appropriate template
```

**Step 3: YesNo Screen**
```
YesNo.template.tsx (inAusbildungScreen)
  ↓ User clicks "Ja"
  ↓ lens.set(true)(taxReturn.data) → sets inAusbildung.start = true
  ↓ update(updatedData)
  ↓ API: POST /api/v1/tax-return/{id}/update
  ↓ Backend: MongoDB update
  ↓ React Query cache updated
  ↓ awaitNext() → moves to next screen (InAusbildungOverview)
```

**Step 4: Array Overview Screen**
```
ArrayOverview.template.tsx (inAusbildungOverview)
  ↓ useArrayManager() gets data from taxReturn.data.inAusbildung.data
  ↓ Displays list of items (empty initially)
  ↓ User clicks "Hinzufügen"
  ↓ setIndex(array.length) → sets index to 0 (new item)
  ↓ setScreen(ScreenEnum.InAusbildungDetail)
```

**Step 5: Array Form Screen**
```
FormArray.template.tsx (inAusbildungDetail)
  ↓ useArrayManager() provides item (empty object for new item)
  ↓ Form component renders fields:
     - bezeichung (TextInput)
     - betrag (CurrencyInput)
  ↓ User fills form → setFormState updates local state
  ↓ User clicks "Weiter"
  ↓ updateItem(formState) → ArrayManager adds/updates item in array
  ↓ ArrayManager calls update() with full taxReturn.data
  ↓ API: POST /api/v1/tax-return/{id}/update
  ↓ Backend: MongoDB update
  ↓ setScreen(ScreenEnum.InAusbildungOverview) → back to list
```

**Step 6: Back to Overview**
```
ArrayOverview.template.tsx
  ↓ React Query refetches tax return
  ↓ Array now has 1 item
  ↓ Displays item in list
  ↓ User can:
     - Click item → edit
     - Click "Hinzufügen" → add another
     - Click "Weiter" → mark finished and continue
```

**Step 7: Tax Amount Recalculation**
```
TaxReturn.context.tsx
  ↓ update() mutation onSuccess
  ↓ refetchTaxAmount()
  ↓ API: GET /api/v1/{taxReturnId}/tax-amount
  ↓ Backend: computeTaxReturn() recalculates
  ↓ Returns: { grossIncome, deductableAmount, taxableIncome, totalTaxes }
  ↓ React Query cache updated
  ↓ UI displays updated tax amount
```

### Data Structure at Each Step

**1. Initial State:**
```json
{
  "inAusbildung": {
    "start": undefined,
    "finished": undefined,
    "data": []
  }
}
```

**2. After YesNo:**
```json
{
  "inAusbildung": {
    "start": true,
    "finished": undefined,
    "data": []
  }
}
```

**3. After Adding Item:**
```json
{
  "inAusbildung": {
    "start": true,
    "finished": undefined,
    "data": [
      {
        "bezeichung": "Programmierkurs",
        "betrag": 1500
      }
    ]
  }
}
```

**4. After Marking Finished:**
```json
{
  "inAusbildung": {
    "start": true,
    "finished": true,
    "data": [
      {
        "bezeichung": "Programmierkurs",
        "betrag": 1500
      }
    ]
  }
}
```

### API Calls Made

**1. Update Tax Return:**
```typescript
POST /api/v1/tax-return/{taxReturnId}/update
Body: {
  data: {
    inAusbildung: {
      start: true,
      finished: true,
      data: [{ bezeichung: "...", betrag: 1500 }]
    }
  }
}
Response: {}
```

**2. Get Tax Amount:**
```typescript
GET /api/v1/{taxReturnId}/tax-amount
Response: {
  grossIncome: 80000,
  deductableAmount: 1500,
  taxableIncome: 78500,
  totalTaxes: 12000
}
```

---

## SUMMARY: KEY PATTERNS FOR REAL ESTATE

### 1. Screen Definition Pattern
- **YesNo** → **ArrayOverview** → **ArrayForm** (for multiple properties)
- Or: **YesNo** → **ObjForm** (for single property)

### 2. Lens Pattern
- **Array:** `Lens.fromProp<ArrayItemType>()('fieldName')`
- **Object:** `Lens.fromPath<TaxReturnData>()([dataKey, 'data', 'fieldName'])`

### 3. Context Access
- `useTaxReturn()` → `{ taxReturn, update, taxAmount }`
- `useArrayManager<ItemType>()` → `{ item, data, setIndex, updateItem, removeItem }`
- `useScreenManager()` → `{ setScreen, awaitNext, next }`

### 4. Form Fields
- **Text:** `FormFieldType.TextInput`
- **Number:** `FormFieldType.NumberInput`
- **Currency:** `FormFieldType.CurrencyInput`
- **Select:** `FormFieldType.SelectInput` with `items: [{ label, value }]`
- **Checkbox:** `FormFieldType.Checkbox`
- **Date:** `FormFieldType.DatePicker`

### 5. Navigation
- **Auto-advance:** `awaitNext()` (moves to next in SCREENS array)
- **Conditional:** `yesScreen`/`noScreen` for YesNo
- **Manual:** `setScreen(ScreenEnum.SpecificScreen)`

### 6. Data Update
- **Array:** `updateItem(item)` → ArrayManager → `update(fullData)`
- **Object:** `lens.set(value)(taxReturn.data)` → `update(updatedData)`
- **Backend:** Automatic via `update()` mutation

---

**END OF ANALYSIS**










