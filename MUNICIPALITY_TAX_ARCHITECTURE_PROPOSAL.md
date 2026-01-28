# Municipality Tax System - Architecture Proposal

## Executive Summary

This proposal outlines how to implement dynamic municipality tax calculation using CSV data for 162 Zurich municipalities. The solution follows existing codebase patterns, maintains reversibility, and handles missing data gracefully with explicit error messaging.

**Key Design Decisions:**
- CSV stored in backend `src/data/` directory (easily replaceable)
- CSV parsed at server startup, cached in memory
- Municipality selection added to `personData` form (alongside existing religion field)
- Tax calculation extends existing `computeTaxReturn()` flow
- Default: Zurich (BFS 261), no church tax
- Missing rates trigger explicit error messages per UX guidelines

---

## 1. CSV Storage & Access

### Location
**Path:** `Wetax-app-server-main/src/data/Gemeindesteuerfuesse_2026.csv`

**Rationale:**
- Backend-only access (tax calculations happen server-side)
- Easy to replace: just swap the CSV file when 2026 rates are finalized
- No need for frontend to access CSV directly
- Follows existing pattern: static data lives in `src/` (see `constants.ts`)

### File Naming Convention
- Current: `Gemeindesteuerfuesse_2026.csv`
- Future: `Gemeindesteuerfuesse_2027.csv` (when updated)
- Keep both files during transition period for rollback capability

### Access Pattern
- Backend reads CSV at server startup
- Parse and validate on startup (fail fast if CSV is malformed)
- Cache parsed data in memory (no database needed)
- No runtime file I/O (performance)

---

## 2. Data Loading & Parsing

### Loading Strategy
**Server Startup:** Parse CSV once when `server.ts` starts, cache in memory.

**Implementation Location:**
- New file: `Wetax-app-server-main/src/data/municipalityTaxRates.ts`
- Exports: `loadMunicipalityTaxRates()` function
- Called from: `server.ts` (before Express app starts)

### CSV Parsing Approach
**Library:** Use Node.js built-in `fs` + manual parsing (no new dependencies)

**Rationale:**
- CSV format is simple (semicolon-delimited, quoted strings)
- No need for heavy CSV library (keeps dependencies minimal)
- Matches existing codebase philosophy: simple, explicit code

**Parsing Logic:**
```typescript
// Pseudocode
1. Read file: fs.readFileSync('src/data/Gemeindesteuerfüße_2026.csv', 'utf-8')
2. Split by newlines
3. Skip header row
4. For each row:
   - Split by semicolon
   - Remove quotes
   - Parse BFS number (column 1)
   - Parse municipality name (column 2)
   - Parse rates (columns 3-6) - handle empty strings as null
   - Parse definitiv flag (column 8) - "1" = true, "" = false
5. Build Map<BFS number, MunicipalityData>
```

### Error Handling
- **Parse errors:** Log error, throw exception (server won't start)
- **Missing columns:** Validate header row, fail if expected columns missing
- **Invalid numbers:** Convert empty strings to `null`, log warnings for non-numeric values
- **Duplicate BFS numbers:** Log warning, use last occurrence

### TypeScript Types
```typescript
// In: Wetax-app-server-main/src/types.ts

export type MunicipalityTaxRates = {
  bfsNumber: number
  name: string
  baseRateWithoutChurch: number | null  // Column 3
  rateWithReformedChurch: number | null  // Column 4
  rateWithCatholicChurch: number | null  // Column 5
  rateWithChristCatholicChurch: number | null  // Column 6
  juristischerSteuerfuss: number | null  // Column 7 (for reference)
  definitiv: boolean  // Column 8: "1" = true, "" = false
}

// In-memory cache
export type MunicipalityTaxRatesCache = Map<number, MunicipalityTaxRates>
```

---

## 3. Data Structures & Types

### In-Memory Storage
**Structure:** `Map<number, MunicipalityTaxRates>` keyed by BFS number

**Rationale:**
- Fast lookup by BFS number (O(1))
- BFS number is unique identifier
- Also maintain sorted array for dropdown population

### Type Extensions

**Backend Types (`Wetax-app-server-main/src/types.ts`):**
```typescript
// Add to TaxReturnData.personData.data:
export type TaxReturnData = {
  personData: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      // ... existing fields ...
      gemeindeBfsNumber: number | undefined  // NEW: BFS number of municipality
      // konfession already exists
    }
  }
  // ... rest of fields ...
}
```

**Frontend Types:**
- Generated via OpenAPI after backend changes
- Run `npm run openapi` to regenerate

### Missing Data Representation
- Use `null` for missing rates (not `undefined`)
- `definitiv: false` indicates provisional/missing data
- Municipality exists in cache even if rates are missing (for dropdown)

---

## 4. Frontend Components

### Municipality Selection Field

**Location:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts`

**Add to `personalienScreen.form.fields` array:**
```typescript
{
  label: 'Gemeinde',
  type: FormFieldType.SelectInput,
  items: municipalityOptions,  // Array of { label: string, value: string (BFS number) }
  lens: Lens.fromProp<TaxReturnData['personData']['data']>()('gemeindeBfsNumber'),
  placeholder: 'Gemeinde auswählen',
}
```

**Component Pattern:**
- Uses existing `SelectInput` component (same as religion dropdown)
- Items populated from API endpoint (see API Changes section)
- Value stored as BFS number (string in form, converted to number on backend)

### Religion Field
**No changes needed** - already exists in `personalienScreen` at line 1479-1503.

**Current values:**
- `'reformiert'` → Reformed church
- `'roemischKatholisch'` → Catholic church
- `'christKatholisch'` → Christ-Catholic church
- `'andere'` → Other (no church tax)
- `'keine'` → None (no church tax)

### Visual Indicators for Missing Data
**Approach:** Show ALL municipalities in dropdown with warning icon (⚠) for missing data

**Implementation:**
- Frontend receives ALL 162 municipalities from API
- Dropdown shows all municipalities, sorted by name
- Visual indicator (⚠) next to municipalities where `hasCompleteData === false`
- If user selects municipality with missing rates:
  - Backend uses Zürich (BFS 261) rates as fallback (no error thrown)
  - Log warning to console for debugging
  - Show info message: "Steuerfuesse für [Gemeinde] sind noch nicht verfügbar. Für Ihre provisorische Steuerlast wird der Steuerfuss der Gde. Zürich verwendet."

**Error Display:**
- Use existing form error pattern: `errorString` prop in `Form.tsx`
- Info message (not error) when missing rates are used

---

## 5. Tax Calculation Logic

### Calculation Flow

**Current Flow (in `computer.ts:computeTaxReturn()`):**
```
1. Calculate deductions
2. Calculate net income
3. Calculate taxable income
4. Calculate federal tax (einkommenssteuerBundCalc)
5. Calculate cantonal tax (calculateEinkommenssteuerStaat) ← MODIFY HERE
6. Calculate wealth tax
7. Return total
```

**New Flow:**
```
1-4. Same as before
5. Calculate cantonal tax (calculateEinkommenssteuerStaat)
   a. Get base cantonal tax (existing logic)
   b. Get municipality rates from cache (by BFS number)
   c. Apply Steuerfuss multiplier:
      - If no church: use baseRateWithoutChurch
      - If Reformed: use rateWithReformedChurch
      - If Catholic: use rateWithCatholicChurch
      - If Christ-Catholic: use rateWithChristCatholicChurch
      - If andere/keine: use baseRateWithoutChurch
   d. Multiply: cantonalTax * (steuerfuss / 100)
6-7. Same as before
```

### Implementation Location

**File:** `Wetax-app-server-main/src/computeTaxes.ts`

**New Function:**
```typescript
export function calculateMunicipalTax(
  cantonalTax: number,
  municipalityBfsNumber: number | undefined,
  religion: string,
  municipalityRatesCache: MunicipalityTaxRatesCache
): number {
  // Default to Zurich (BFS 261) if no municipality selected
  const bfsNumber = municipalityBfsNumber ?? 261
  const municipality = municipalityRatesCache.get(bfsNumber)
  
  if (!municipality) {
    throw new Error(`Municipality with BFS number ${bfsNumber} not found`)
  }
  
  // Determine which rate to use based on religion
  let steuerfuss: number | null = null
  
  if (religion === 'reformiert') {
    steuerfuss = municipality.rateWithReformedChurch
  } else if (religion === 'roemischKatholisch') {
    steuerfuss = municipality.rateWithCatholicChurch
  } else if (religion === 'christKatholisch') {
    steuerfuss = municipality.rateWithChristCatholicChurch
  } else {
    // andere, keine, or undefined
    steuerfuss = municipality.baseRateWithoutChurch
  }
  
  // If rate is missing, use Zürich as fallback (don't throw error)
  if (steuerfuss === null) {
    console.warn(`Missing rates for ${municipality.name}, using Zürich fallback`)
    const zurichMunicipality = municipalityRatesCache.get(261)
    if (!zurichMunicipality) {
      throw new Error('Zürich municipality (BFS 261) not found in cache - cannot use fallback')
    }
    
    // Determine Zürich rate based on religion
    if (religion === 'reformiert') {
      steuerfuss = zurichMunicipality.rateWithReformedChurch
    } else if (religion === 'roemischKatholisch') {
      steuerfuss = zurichMunicipality.rateWithCatholicChurch
    } else if (religion === 'christKatholisch') {
      steuerfuss = zurichMunicipality.rateWithChristCatholicChurch
    } else {
      steuerfuss = zurichMunicipality.baseRateWithoutChurch
    }
    
    if (steuerfuss === null) {
      throw new Error('Zürich municipality rates are missing - cannot use fallback')
    }
  }
  
  // Apply multiplier (steuerfuss is percentage, e.g., 119 = 1.19)
  return cantonalTax * (steuerfuss / 100)
}
```

**Modify `computer.ts:computeTaxReturn()`:**
```typescript
// Around line 119-122, replace:
const einkommenssteuerStaat = calculateEinkommenssteuerStaat(
  reineinkommenStaat,
  data.personData?.data?.konfession ?? 'andere',
)

// With:
const baseCantonalTax = calculateEinkommenssteuerStaat(
  reineinkommenStaat,
  data.personData?.data?.konfession ?? 'andere',
)

// Import municipality rates cache (passed from api.service.ts)
const einkommenssteuerStaat = calculateMunicipalTax(
  baseCantonalTax,
  data.personData?.data?.gemeindeBfsNumber,
  data.personData?.data?.konfession ?? 'andere',
  municipalityRatesCache  // Passed from getTaxAmount()
)
```

### Edge Cases

1. **No municipality selected:**
   - Default to Zurich (BFS 261)
   - No error, silent fallback

2. **Missing rates for selected municipality:**
   - Use Zürich (BFS 261) rates as fallback (no error thrown)
   - Log warning to console for debugging
   - Show info message to user: "Steuerfüsse für [Gemeinde] sind noch nicht verfügbar. Für Ihre provisorische Steuerlast wird der Steuerfuss der Gde. Zürich verwendet."

3. **No religion selected:**
   - Use `baseRateWithoutChurch` (no church tax)
   - Default behavior (matches current logic)

4. **Invalid BFS number:**
   - Throw error: "Gemeinde mit BFS-Nummer [number] nicht gefunden"

---

## 6. Validation Rules

### Frontend Validation

**Location:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts`

**Update `personalienScreen.isDone()`:**
```typescript
isDone: (v) => {
  const d = v.data
  return !!(
    d.vorname &&
    d.nachname &&
    d.geburtsdatum &&
    d.zivilstand &&
    d.konfession &&
    d.beruf &&
    d.adresse &&
    d.plz &&
    d.stadt &&
    d.email &&
    d.gemeindeBfsNumber  // NEW: Required field
  )
}
```

**Form Field Validation:**
```typescript
{
  label: 'Gemeinde',
  type: FormFieldType.SelectInput,
  items: municipalityOptions,
  lens: Lens.fromProp<TaxReturnData['personData']['data']>()('gemeindeBfsNumber'),
  required: true,  // Mark as required
  validate: (data) => {
    // Additional validation if needed
    return true
  }
}
```

### Backend Validation

**Location:** `Wetax-app-server-main/src/computeTaxes.ts` (in `calculateMunicipalTax`)

**Validation Checks:**
1. Municipality exists in cache → Error if not found
2. Rate exists for selected religion → Error if null
3. Rate is valid number → Error if NaN or <= 0

**Error Messages:**
- Missing municipality: `"Gemeinde mit BFS-Nummer {bfsNumber} nicht gefunden"`
- Missing rates: Use Zürich fallback (no error thrown), log warning to console
- Invalid rate: `"Ungültiger Steuerfuss für {municipalityName}"`
- Info message (frontend): `"Steuerfuesse für {municipalityName} sind noch nicht verfügbar. Für Ihre provisorische Steuerlast wird der Steuerfuss der Gde. Zürich verwendet."`

---

## 7. API Changes

### New Endpoint: Get Available Municipalities

**Endpoint:** `GET /api/v1/municipalities`

**Purpose:** Frontend needs list of municipalities for dropdown (only those with complete data)

**Response:**
```typescript
{
  municipalities: Array<{
    bfsNumber: number
    name: string
    hasCompleteData: boolean  // true if definitiv === true
    warningMessage?: string   // Optional: for display in dropdown
  }>
}
```

**Implementation:**
- **Controller:** `Wetax-app-server-main/src/api/api.controller.ts`
- **Service:** `Wetax-app-server-main/src/api/api.service.ts`
- **Logic:** Return ALL municipalities from cache, sorted by name. Set `hasCompleteData: true` if `definitiv === true`, otherwise `false`

### Modified Endpoint: Get Tax Amount

**Endpoint:** `GET /api/v1/{taxReturnId}/tax-amount` (existing)

**Changes:**
- Pass `municipalityRatesCache` to `computeTaxReturn()` function
- No response structure changes (transparent to frontend)

**Implementation:**
```typescript
// In api.service.ts:getTaxAmount()
export const getTaxAmount = (
  taxReturn: TaxReturn, 
  injected: Injected,
  municipalityRatesCache: MunicipalityTaxRatesCache  // NEW parameter
): TaxAmount => {
  // ... existing code ...
  const computed = computeTaxReturn(taxReturn.data, municipalityRatesCache)  // Pass cache
  // ... rest unchanged ...
}
```

### OpenAPI Schema Updates

**After implementation:**
1. Run `npm run generate:spec` in backend
2. Run `npm run openapi` in frontend
3. Types will be auto-generated

---

## 8. State Management

### Frontend State

**Municipality Selection:**
- Stored in: `TaxReturnData.personData.data.gemeindeBfsNumber`
- Managed via: React Context (`TaxReturn.context.tsx`)
- Form updates via: Lens pattern (monocle-ts) - same as existing fields

**Religion Selection:**
- Already stored in: `TaxReturnData.personData.data.konfession`
- No changes needed

**Municipality Options (Dropdown Data):**
- Fetched via: React Query (`@tanstack/react-query`)
- Endpoint: `GET /api/v1/municipalities`
- Cached in: React Query cache (automatic)
- Refetch: On app start, or when tax return year changes

**Implementation:**
```typescript
// In frontend component
const { data: municipalities } = useQuery({
  queryKey: ['municipalities'],
  queryFn: () => ApiService.getMunicipalities(),
})

const municipalityOptions = municipalities?.municipalities.map(m => ({
  label: m.name,
  value: m.bfsNumber.toString(),
})) ?? []
```

### Backend State

**Municipality Rates Cache:**
- Loaded at: Server startup
- Stored in: Module-level variable (singleton pattern)
- Access: Exported function `getMunicipalityRatesCache()`

**Implementation:**
```typescript
// In: Wetax-app-server-main/src/data/municipalityTaxRates.ts

let municipalityRatesCache: MunicipalityTaxRatesCache | null = null

export function loadMunicipalityTaxRates(): MunicipalityTaxRatesCache {
  if (municipalityRatesCache) {
    return municipalityRatesCache  // Already loaded
  }
  
  // Parse CSV and build cache
  municipalityRatesCache = parseCsvFile()
  return municipalityRatesCache
}

export function getMunicipalityRatesCache(): MunicipalityTaxRatesCache {
  if (!municipalityRatesCache) {
    throw new Error('Municipality rates not loaded. Call loadMunicipalityTaxRates() first.')
  }
  return municipalityRatesCache
}
```

---

## 9. Testing Approach

### Unit Tests

**Backend Tests:**

**File:** `Wetax-app-server-main/src/tests/municipalityTaxRates.test.ts` (new)

**Test Cases:**
1. **CSV Parsing:**
   - Parse valid CSV with all columns
   - Handle empty rate values (null)
   - Handle missing definitiv flag (defaults to false)
   - Handle duplicate BFS numbers (use last)
   - Throw error on malformed CSV

2. **Tax Calculation:**
   - Zürich (119%) without church = correct multiplier
   - Zürich (129%) with Reformed church = correct multiplier
   - Winterthur (125%) without church = correct multiplier
   - Winterthur (138%) with Reformed church = correct multiplier
   - Missing municipality (Adliswil) = throws error with explicit message
   - Invalid BFS number = throws error
   - No municipality selected = defaults to Zurich

3. **Edge Cases:**
   - Religion 'andere' uses baseRateWithoutChurch
   - Religion 'keine' uses baseRateWithoutChurch
   - Religion undefined uses baseRateWithoutChurch
   - Municipality with missing rates throws error

**File:** `Wetax-app-server-main/src/tests/computeTaxes.test.ts` (modify)

**Add tests:**
- Verify `calculateMunicipalTax()` is called in `computeTaxReturn()`
- Verify municipality multiplier is applied correctly

### Integration Tests

**File:** `Wetax-app-server-main/src/tests/api.controller.test.ts` (modify)

**Add tests:**
- `GET /api/v1/municipalities` returns correct list
- `GET /api/v1/{taxReturnId}/tax-amount` uses municipality rates
- Error handling when municipality has missing rates

### Test Data

**Create:** `Wetax-app-server-main/src/tests/fixtures/municipality-tax-rates-test.csv`

**Contains:**
- Zürich (complete data)
- Winterthur (complete data)
- Adliswil (missing data - for error testing)
- 2-3 other municipalities (for variety)

---

## 10. Deployment Plan

### Incremental Deployment Strategy

**Phase 1: Backend Infrastructure (Non-Breaking)**
1. Add CSV file to `src/data/`
2. Create `municipalityTaxRates.ts` module
3. Load cache at server startup
4. Add `GET /api/v1/municipalities` endpoint
5. **Deploy** - No frontend changes yet, feature not visible

**Phase 2: Backend Calculation (Non-Breaking)**
1. Add `gemeindeBfsNumber` field to types (optional)
2. Implement `calculateMunicipalTax()` function
3. Modify `computeTaxReturn()` to use municipality rates
4. Default to Zurich if `gemeindeBfsNumber` is undefined (backwards compatible)
5. **Deploy** - Existing users unaffected (defaults to Zurich)

**Phase 3: Frontend UI (Feature Complete)**
1. Add municipality dropdown to `personalienScreen`
2. Fetch municipalities list via React Query
3. Update form validation
4. **Deploy** - Feature now visible and functional

### Rollback Plan

**If issues arise:**

1. **Rollback Frontend (Phase 3):**
   - Revert frontend changes
   - Backend continues to work (defaults to Zurich)
   - **Impact:** Low - users see old form, calculations still work

2. **Rollback Backend Calculation (Phase 2):**
   - Revert `computeTaxReturn()` changes
   - Keep CSV loading (harmless)
   - **Impact:** Medium - need to redeploy backend

3. **Full Rollback (Phase 1):**
   - Remove CSV file
   - Remove municipality rates module
   - Remove API endpoint
   - **Impact:** High - requires code changes and redeploy

### Backwards Compatibility

**Existing Tax Returns:**
- `gemeindeBfsNumber` is optional (undefined for existing returns)
- Default to Zurich (BFS 261) if undefined
- No data migration needed

**Existing API Clients:**
- `GET /api/v1/municipalities` is new endpoint (no breaking changes)
- `GET /api/v1/{taxReturnId}/tax-amount` response unchanged (transparent)

### CSV Update Process (Future)

**When 2026 rates are finalized:**

1. **Preparation:**
   - Download new CSV from source
   - Validate format matches expected structure
   - Test parsing locally

2. **Deployment:**
   - Replace `Gemeindesteuerfuesse_2026.csv` with new file
   - Restart server (cache reloads automatically)
   - Monitor for errors

3. **Verification:**
   - Check server logs for parse errors
   - Test tax calculation with known municipality
   - Verify missing data municipalities are now complete

---

## Key Files Modified/Created

### Backend Files

**New Files:**
- `Wetax-app-server-main/src/data/Gemeindesteuerfuesse_2026.csv` - CSV data file
- `Wetax-app-server-main/src/data/municipalityTaxRates.ts` - CSV parsing and cache management
- `Wetax-app-server-main/src/tests/municipalityTaxRates.test.ts` - Unit tests

**Modified Files:**
- `Wetax-app-server-main/src/types.ts` - Add `gemeindeBfsNumber` to `TaxReturnData.personData.data`
- `Wetax-app-server-main/src/computeTaxes.ts` - Add `calculateMunicipalTax()` function
- `Wetax-app-server-main/src/computer.ts` - Modify `computeTaxReturn()` to use municipality rates
- `Wetax-app-server-main/src/api/api.service.ts` - Add `getMunicipalities()`, modify `getTaxAmount()`
- `Wetax-app-server-main/src/api/api.controller.ts` - Add `GET /api/v1/municipalities` endpoint
- `Wetax-app-server-main/src/server.ts` - Call `loadMunicipalityTaxRates()` at startup
- `Wetax-app-server-main/src/constants.ts` - Add default `gemeindeBfsNumber: undefined` to `DEFAULT_TAX_RETURN_DATA`

### Frontend Files

**Modified Files:**
- `Wetax-master/src/view/authenticated/taxReturn/screens.ts` - Add municipality field to `personalienScreen`
- `Wetax-master/src/openapi/` - Regenerated after backend changes (run `npm run openapi`)

**No New Frontend Files Required** - Uses existing components and patterns

---

## Open Questions for Team

### 1. CSV File Location ✅ RESOLVED
**Decision:** `src/data/` (backend-only, not served to clients)
- J has already created `Wetax-app-server-main/src/data/` directory
- CSV file: `Gemeindesteuerfuesse_2026.csv` (note: double 's', not 'ß' - Swiss convention)

### 2. Default Municipality Behavior
**Question:** If user doesn't select municipality, should we:
- A) Default to Zurich silently (current proposal)
- B) Require municipality selection (make field required)
- C) Show warning but allow calculation
**Recommendation:** Option A (silent default to Zurich)
**Decision Needed:** Confirm UX preference

### 3. Error Message Language ✅ RESOLVED
**Decision:** German only (matches existing codebase)

### 4. CSV Update Frequency
**Question:** How often will CSV be updated?
- Annually (new tax year)
- Quarterly (if rates change)
- Ad-hoc (as municipalities finalize rates)
**Impact:** Determines if we need versioning system
**Decision Needed:** Understand update cadence

### 5. Missing Data Handling ✅ RESOLVED
**Decision:** Show ALL municipalities with warning icon (⚠) for missing data
- Dropdown shows all 162 municipalities
- Visual indicator for `hasCompleteData === false`
- Backend uses Zürich fallback silently (no errors thrown)
- Info message shown to user when fallback is used

### 6. Testing Strategy
**Question:** Should we test with full 162-municipality CSV or subset?
**Recommendation:** Use full CSV in tests (realistic, not too large)
**Decision Needed:** Confirm test data approach

### 7. Performance Considerations ✅ RESOLVED
**Decision:** In-memory cache is perfect for this use case
- 162 municipalities = ~50KB of data
- Server restart is fine for updates
- No Redis/database needed

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review and approve this proposal
- [ ] Resolve open questions
- [ ] Obtain CSV file (`Gemeindesteuerfuesse_2026.csv`)
- [ ] Validate CSV format matches expected structure

### Backend Implementation
- [ ] Create `src/data/` directory
- [ ] Add CSV file
- [ ] Implement `municipalityTaxRates.ts` module
- [ ] Add types to `types.ts`
- [ ] Implement `calculateMunicipalTax()` function
- [ ] Modify `computeTaxReturn()` to use municipality rates
- [ ] Add `GET /api/v1/municipalities` endpoint
- [ ] Update `server.ts` to load cache at startup
- [ ] Write unit tests
- [ ] Test with sample tax returns

### Frontend Implementation
- [ ] Regenerate OpenAPI client (`npm run openapi`)
- [ ] Add municipality field to `personalienScreen`
- [ ] Implement React Query hook for municipalities list
- [ ] Update form validation
- [ ] Test form submission
- [ ] Test error handling

### Testing & Deployment
- [ ] Run all existing tests (ensure no regressions)
- [ ] Test with Zürich (known values)
- [ ] Test with Winterthur (known values)
- [ ] Test with missing municipality (Adliswil)
- [ ] Test default behavior (no municipality selected)
- [ ] Test all religion combinations
- [ ] Deploy Phase 1 (backend infrastructure)
- [ ] Deploy Phase 2 (backend calculation)
- [ ] Deploy Phase 3 (frontend UI)
- [ ] Monitor for errors
- [ ] Verify tax calculations match expected values

---

## Success Criteria

✅ **Feature Complete When:**
1. User can select municipality from dropdown (162 options)
2. User can select religion (existing field, no changes)
3. Tax calculation applies correct Steuerfuss multiplier
4. Missing data shows explicit error message
5. Default to Zurich works when no municipality selected
6. CSV can be replaced without code changes
7. All existing tests pass
8. New tests cover edge cases

✅ **Quality Metrics:**
- Zero regressions in existing tax calculations
- Error messages are explicit and helpful
- Performance: Tax calculation < 100ms (unchanged)
- Code follows existing patterns (lens, types, validation)

---

**End of Proposal**

