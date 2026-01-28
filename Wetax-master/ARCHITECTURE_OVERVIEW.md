# Wetax Mobile Tax Application - Architectural Overview

**Generated:** Based on codebase analysis  
**Status:** ⚠️ **INCOMPLETE CODEBASE** - Critical files missing (see below)

---

## 1. HIGH-LEVEL ARCHITECTURE

### Tech Stack

**Frontend Framework:**
- **React Native** (v0.81.1) with **Expo** (v54.0.1)
- **TypeScript** (v5.9.2) for type safety
- **React** (v19.1.0)

**State Management:**
- **@tanstack/react-query** (v5.87.4) - Server state management, caching, and API synchronization
- **React Context API** - Client-side state (TaxReturnProvider, UserProvider)
- **AsyncStorage** - Local persistence for tokens and tax return IDs

**Navigation:**
- **@react-navigation/native** (v7.1.17) with **native-stack** navigator
- Two main navigation trees: Authenticated and Unauthenticated

**Styling:**
- **styled-components** (v6.1.19) - CSS-in-JS styling
- **react-native-paper** (v5.14.5) - Material Design components
- Custom theme system with color schemes

**Backend Integration:**
- **OpenAPI/TypeScript Codegen** - Auto-generated API client from backend Swagger spec
- API Base URL: `https://wetaxorg.ch/api`
- Authentication via `x-access-token` header
- API client generated from: `http://localhost:3000/swagger.json` (development)

**Functional Programming:**
- **fp-ts** (v2.16.11) - Functional programming utilities
- **monocle-ts** (v2.3.13) - Immutable data manipulation (used in forms with Lens pattern)

**Key Third-Party Dependencies:**
- **Firebase** - Authentication, Crashlytics
- **expo-camera** - Document scanning
- **pdf-lib** - PDF generation
- **react-native-iap** - In-app purchases/subscriptions
- **date-fns** - Date manipulation
- **socket.io-client** - Real-time features (if any)

### Architecture Pattern

**Pattern:** **Component-Based Architecture with Context + React Query**

The app follows a **hybrid pattern**:
- **Presentation Layer:** React Native components organized by feature/view
- **State Layer:** React Context for global app state + React Query for server state
- **Data Layer:** OpenAPI-generated client for backend communication
- **Form Layer:** Functional lens-based form system (monocle-ts)

**Not a strict MVC/MVVM**, but closer to:
- **Container/Presenter pattern** (components are presentational, context/query hooks are containers)
- **Repository pattern** (API service abstracts backend)

### Tax Calculation Architecture

**⚠️ CRITICAL FINDING:** **Tax calculations appear to be handled entirely on the backend.**

**Evidence:**
1. No tax calculation logic found in the frontend codebase
2. References to `taxAmount` and `taxReturn` queries suggest backend API endpoints
3. Frontend appears to be a **data collection and display layer** only
4. Query keys like `['taxReturn']` and `['taxAmount']` indicate server-side calculations

**Implication:** To add real estate tax logic, you'll likely need to:
- **Modify the backend API** (not this codebase)
- **OR** add frontend calculation logic if the architecture allows it

---

## 2. CODEBASE STRUCTURE

### Directory Organization

```
Wetax-master/
├── android/                    # Android native configuration
├── assets/                     # Images, icons, splash screens
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── configured/         # Pre-configured components (SafeLoading, etc.)
│   │   ├── form/             # Form system (Form.tsx, form.types.ts)
│   │   ├── icons/            # Custom icon components
│   │   ├── theme/            # Theme configuration
│   │   └── types/            # TypeScript type definitions
│   ├── shared/                # Shared utilities and constants
│   │   ├── openapi.ts        # OpenAPI client configuration
│   │   ├── util.ts           # Utility functions (formatting, validation)
│   │   ├── constants.ts      # App-wide constants
│   │   └── colors.ts         # Color scheme definitions
│   ├── svgs/                  # SVG components
│   └── view/                  # Screen components (by feature)
│       ├── unauthenticated/  # Login, registration, landing screens
│       └── authenticated/     # ⚠️ MISSING - Main app screens
│   ├── context/               # ⚠️ MISSING - React Context providers
│   └── openapi/               # ⚠️ MISSING - Generated API client
├── App.tsx                     # Root component, navigation setup
├── package.json
└── app.json                    # Expo configuration
```

### Separation of Concerns

**✅ Well-Separated:**

1. **UI Layer** (`src/components/`, `src/view/`)
   - Presentational components
   - Form components
   - Screen components

2. **Business Logic Layer** (`src/shared/util.ts`, form validation)
   - Utility functions
   - Validation logic (AHV numbers, phone, email)
   - Date formatting
   - Number formatting

3. **Data Layer** (`src/shared/openapi.ts`, `src/openapi/` - missing)
   - API client configuration
   - Generated API service (should be in `src/openapi/`)

4. **State Management** (`src/context/` - missing, React Query in components)
   - Global state via Context
   - Server state via React Query

**⚠️ Missing Critical Layers:**
- `src/context/` - TaxReturnProvider, UserProvider (referenced but not found)
- `src/view/authenticated/` - Main tax form screens
- `src/openapi/` - Generated API client code

### Data Flow

**Current Flow (from what exists):**

1. **Authentication Flow:**
   ```
   User Input → LogIn/Registration Screen
   → ApiService.login/register
   → Backend API
   → Token stored in AsyncStorage
   → User context updated
   → Navigate to Authenticated screens
   ```

2. **Tax Data Flow (inferred):**
   ```
   User fills forms → Form component (lens-based)
   → Local state updates
   → Submit → ApiService mutation
   → Backend calculates tax
   → React Query caches response
   → UI displays tax amount
   ```

3. **Form System:**
   - Uses **Lens pattern** (monocle-ts) for immutable updates
   - Form fields defined with lenses pointing to data structure
   - Validation happens on submit
   - Supports: TextInput, NumberInput, CurrencyInput, DatePicker, Select, Checkbox

---

## 3. TAX LOGIC IMPLEMENTATION

### Current Tax Scenarios

**⚠️ CANNOT DETERMINE** - The authenticated views and API client are missing.

**What we know:**
- Query keys suggest: `taxReturn`, `taxAmount`
- Backend API handles calculations (no frontend tax logic found)
- Forms use currency inputs, suggesting financial data collection

**What we can infer:**
- The app collects tax-related data via forms
- Backend performs calculations
- Frontend displays results

### Tax Rules Definition

**Location:** **Backend API** (not in this codebase)

**Evidence:**
- No tax rate files, no calculation functions, no rule definitions in frontend
- All tax logic appears server-side
- Frontend is a thin client

### Where to Add New Tax Scenarios

**For Real Estate Tax Logic:**

**Option 1: Backend Extension (Recommended)**
- Add real estate fields to API schema
- Backend calculates real estate tax
- Frontend displays new fields and results

**Option 2: Frontend Extension (If Allowed)**
- Add real estate form fields in authenticated screens
- Create new API endpoints/mutations for real estate data
- Backend handles calculation

**⚠️ You cannot add tax calculation logic in the frontend alone** - the architecture doesn't support it.

### Swiss-Specific Tax Rules

**No Swiss-specific logic found in frontend.**

**Swiss Tax Context (from app context):**
- AHV number validation (Swiss social security number format: `756.XXXX.XXXX.XX`)
- German language UI (suggests Swiss German market)
- Backend likely handles:
  - Federal vs. cantonal tax differences
  - 26 cantons with different rates
  - Municipal tax variations

**To add real estate tax:**
- Must account for cantonal differences (each canton has different real estate tax rules)
- May need location/canton selection in forms
- Backend must handle cantonal calculations

---

## 4. CRITICAL FILES & ENTRY POINTS

### ✅ Existing Critical Files

**Entry Points:**
- `App.tsx` - Root component, sets up providers and navigation
- `src/view/unauthenticated/Unauthenticated.navigator.tsx` - Unauthenticated flow

**Form System:**
- `src/components/form/Form.tsx` - Generic form component with lens-based updates
- `src/components/form/form.types.ts` - Form field type definitions
- `src/components/form/some.form.ts` - Form validation utilities

**API Configuration:**
- `src/shared/openapi.ts` - API base URL and auth header setup

**Utilities:**
- `src/shared/util.ts` - Formatting, validation (AHV, phone, email)
- `src/shared/constants.ts` - App constants (AHV regex, navigator enums)

**Components:**
- `src/components/configured/SafeLoading.tsx` - Loading states
- `src/components/CustomToast.tsx` - Toast notifications

### ⚠️ Missing Critical Files

**MUST BE GENERATED/CREATED:**

1. **`src/openapi/`** - Generated API client
   - Run: `npm run openapi` (generates from `http://localhost:3000/swagger.json`)
   - Contains: `ApiService`, type definitions (`UserT`, `TaxReturnT`, etc.)

2. **`src/context/TaxReturn.context.tsx`** - Tax return state management
   - Referenced in `App.tsx` but missing
   - Should manage current tax return, form data

3. **`src/context/User.context.tsx`** - User state management
   - Referenced in `App.tsx` but missing
   - Should manage authenticated user, user data

4. **`src/view/authenticated/Authenticated.navigator.tsx`** - Main app navigation
   - Referenced in `App.tsx` but missing
   - Should contain tax form screens, dashboard, etc.

5. **`src/view/authenticated/screens/`** - Tax form screens
   - Where users input tax data
   - Where you'd add real estate forms

### Test Files

**⚠️ NO TEST FILES FOUND** - No test directory, no `.test.ts` or `.spec.ts` files

**Testing Pattern:** Unknown - you'll need to establish one

---

## 5. EXTENSION SAFETY

### ✅ Safe to Modify

1. **Form Components** (`src/components/form/`)
   - Well-isolated, lens-based
   - Adding new field types is safe

2. **Utility Functions** (`src/shared/util.ts`)
   - Pure functions, easy to test
   - Adding new validators/formatters is safe

3. **New Screens** (`src/view/authenticated/screens/` - when created)
   - Isolated components
   - Adding new screens doesn't affect existing ones

4. **Styling/Theming** (`src/components/theme/`, `src/shared/colors.ts`)
   - Theme system is isolated
   - Safe to extend

### ⚠️ Modify with Caution

1. **Navigation Structure** (`App.tsx`, navigators)
   - Changes affect routing
   - Test navigation flows after changes

2. **API Client Configuration** (`src/shared/openapi.ts`)
   - Changes affect all API calls
   - Ensure backend compatibility

3. **Context Providers** (when created)
   - Global state changes affect entire app
   - Test state updates carefully

### ❌ DO NOT TOUCH (Unless Necessary)

1. **Expo Configuration** (`app.json`, `eas.json`)
   - Build configuration
   - Only modify if adding new native features

2. **Android/iOS Native Code** (`android/`, iOS configs)
   - Only modify for native feature additions
   - Requires native development knowledge

3. **Generated OpenAPI Client** (`src/openapi/` - when generated)
   - Auto-generated, will be overwritten
   - Don't manually edit - regenerate instead

### Adding Real Estate Tax Logic Safely

**Recommended Approach:**

1. **Backend First:**
   - Add real estate endpoints to backend API
   - Update Swagger/OpenAPI spec
   - Regenerate frontend client: `npm run openapi`

2. **Frontend Forms:**
   - Create new form screen: `src/view/authenticated/screens/RealEstateForm.tsx`
   - Use existing `Form` component with real estate fields
   - Add to authenticated navigator

3. **State Management:**
   - Extend TaxReturn context to include real estate data
   - Add React Query mutations for real estate API calls

4. **Validation:**
   - Add real estate-specific validators to `src/shared/util.ts`
   - Use form validation system

**Pattern to Follow:**
- Look at existing form screens (when they exist) as templates
- Use the lens-based form system for data binding
- Use React Query for API calls
- Follow the existing component structure

---

## 6. POTENTIAL PITFALLS

### 🚨 Critical Issues

1. **Incomplete Codebase**
   - Missing: OpenAPI client, Context providers, Authenticated views
   - **Action:** Generate/restore missing files before development
   - **Risk:** App won't run without these

2. **Backend Dependency**
   - Tax calculations are server-side
   - **Action:** Coordinate with backend team for real estate tax
   - **Risk:** Can't add tax logic without backend changes

3. **No Test Coverage**
   - No tests found
   - **Action:** Establish testing strategy before major changes
   - **Risk:** Breaking changes go undetected

### ⚠️ Architecture Concerns

1. **Tight Backend Coupling**
   - Frontend is thin client, heavily dependent on API
   - **Impact:** Limited offline capability, requires backend for all calculations
   - **Mitigation:** Consider caching strategies, offline data storage

2. **Missing Type Safety in API**
   - OpenAPI client missing, so API types unknown
   - **Impact:** Type errors when API client is generated
   - **Mitigation:** Generate API client first, then develop

3. **Context Providers Missing**
   - TaxReturnProvider and UserProvider referenced but not found
   - **Impact:** App won't compile/run
   - **Mitigation:** Create these providers or restore from version control

### 🔧 Extension Resistance

1. **Form System Complexity**
   - Lens-based forms are powerful but complex
   - **Impact:** Learning curve for new developers
   - **Mitigation:** Study existing form examples, use Form component as-is

2. **No Clear Tax Calculation Extension Point**
   - Calculations are backend-only
   - **Impact:** Can't add frontend tax logic easily
   - **Mitigation:** Work with backend team, or refactor to allow frontend calculations

3. **Swiss Tax Complexity**
   - 26 cantons = 26 different tax rule sets
   - **Impact:** Real estate tax logic must handle all cantons
   - **Mitigation:** Backend should handle canton-specific logic

### Dependencies Between Modules

**Critical Dependencies:**

```
App.tsx
  → Requires: TaxReturnProvider, UserProvider (MISSING)
  → Requires: AuthenticatedNavigator (MISSING)
  → Requires: OpenAPI client (MISSING)

Form Components
  → Depends on: Lens pattern (monocle-ts)
  → Depends on: Theme system
  → Independent: Safe to modify

API Calls
  → Depends on: OpenAPI client (MISSING)
  → Depends on: AsyncStorage for tokens
  → Independent: Once client exists, safe to extend
```

**Dependency Graph:**
- **High Risk:** App.tsx → Missing providers/navigators (blocks everything)
- **Medium Risk:** Forms → API client (blocks data submission)
- **Low Risk:** Utilities, components (isolated, safe)

---

## 7. RECOMMENDATIONS FOR EXTENDING

### Before You Start

1. **Restore Missing Files:**
   ```bash
   # Generate OpenAPI client
   npm run openapi
   
   # Restore context providers (check git history or recreate)
   # Restore authenticated views (check git history or recreate)
   ```

2. **Understand Backend API:**
   - Review Swagger spec: `http://localhost:3000/swagger.json`
   - Understand existing tax return endpoints
   - Plan real estate endpoint additions

3. **Set Up Testing:**
   - Add Jest/React Native Testing Library
   - Test form validation
   - Test API integration

### For Real Estate Tax Feature

**Step-by-Step:**

1. **Backend Coordination:**
   - Design real estate tax API endpoints
   - Update OpenAPI spec
   - Implement backend calculation logic (all 26 cantons)

2. **Frontend Implementation:**
   - Generate updated API client: `npm run openapi`
   - Create `RealEstateForm.tsx` screen
   - Add form fields (property value, location, canton, etc.)
   - Add to authenticated navigator
   - Add React Query mutation for submission

3. **State Management:**
   - Extend TaxReturn context to include real estate data
   - Update form data structure

4. **Testing:**
   - Test form validation
   - Test API integration
   - Test canton-specific scenarios

### Timeline Considerations

**⚠️ Realistic Timeline Assessment:**

- **If backend is ready:** 1-2 weeks (frontend only)
- **If backend needs work:** 3-6 weeks (coordination + implementation)
- **If missing files need recreation:** +1-2 weeks (reverse engineering)

**Factors:**
- Missing codebase files (high risk)
- Backend dependency (medium risk)
- Swiss tax complexity (26 cantons) (high complexity)
- No existing test coverage (medium risk)

---

## 8. SUMMARY

### Architecture Strengths

✅ **Well-structured component system**  
✅ **Type-safe with TypeScript**  
✅ **Modern React patterns (React Query, Context)**  
✅ **Functional form system (lens-based)**  
✅ **Clear separation of UI and utilities**

### Architecture Weaknesses

❌ **Incomplete codebase (missing critical files)**  
❌ **Heavy backend dependency (no frontend tax logic)**  
❌ **No test coverage**  
❌ **Missing documentation**

### Extension Feasibility

**For Real Estate Tax:**

- **Frontend Forms:** ✅ Feasible (use existing form system)
- **Tax Calculations:** ❌ Must be backend (architecture doesn't support frontend calc)
- **Canton Handling:** ⚠️ Complex (26 cantons, backend must handle)

### Final Verdict

**Can you extend this codebase?** 

**Yes, BUT:**
1. You must restore missing files first
2. You must coordinate with backend team
3. You must understand the form system (lens pattern)
4. Timeline should account for missing code and backend work

**Should you reconsider timeline/promises?**

**YES, if:**
- Missing files can't be restored quickly
- Backend team isn't available
- You need frontend-only tax calculations

**NO, if:**
- Missing files can be restored/generated
- Backend team is ready to add real estate endpoints
- You're comfortable with backend-dependent architecture

---

**Next Steps:**
1. Generate OpenAPI client: `npm run openapi`
2. Locate/restore context providers and authenticated views
3. Review backend API for tax return structure
4. Plan real estate tax feature with backend team
5. Establish testing strategy

