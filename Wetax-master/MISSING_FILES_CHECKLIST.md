# Missing Files Checklist

## Critical Missing Files (App Won't Run Without These)

### 1. OpenAPI Generated Client
**Location:** `src/openapi/`  
**How to Generate:**
```bash
npm run openapi
```
**What it contains:**
- `ApiService` - All API methods
- Type definitions (`UserT`, `TaxReturnT`, etc.)
- Request/response types

**Status:** ⚠️ Must be generated from backend Swagger spec

---

### 2. Context Providers

#### `src/context/TaxReturn.context.tsx`
**Referenced in:** `App.tsx:13`  
**Should contain:**
- `TaxReturnProvider` component
- `useTaxReturn()` hook
- Current tax return state management
- Tax return form data state

**Template structure:**
```typescript
import { createContext, useContext, useState, ReactNode } from 'react'

interface TaxReturnContextType {
  currentTaxReturn: TaxReturnT | null
  setCurrentTaxReturn: (return: TaxReturnT | null) => void
  // ... other tax return state
}

const TaxReturnContext = createContext<TaxReturnContextType | undefined>(undefined)

export const TaxReturnProvider = ({ children }: { children: ReactNode }) => {
  // Implementation
}

export const useTaxReturn = () => {
  const context = useContext(TaxReturnContext)
  if (!context) throw new Error('useTaxReturn must be used within TaxReturnProvider')
  return context
}
```

#### `src/context/User.context.tsx`
**Referenced in:** `App.tsx:14`  
**Should contain:**
- `UserProvider` component
- `useUser()` hook
- `useOptionalUser()` hook (already referenced)
- Authenticated user state

**Template structure:**
```typescript
import { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiService, UserT } from '../openapi'

interface UserContextType {
  user: UserT | null
  isLoading: boolean
  // ... other user state
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: ApiService.getCurrentUser, // Adjust based on actual API
  })
  
  // Implementation
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}

export const useOptionalUser = () => {
  const context = useContext(UserContext)
  return context
}
```

---

### 3. Authenticated Views

#### `src/view/authenticated/Authenticated.navigator.tsx`
**Referenced in:** `App.tsx:17`  
**Should contain:**
- Navigation stack for authenticated users
- Tax form screens
- Dashboard/home screen
- Settings/profile screens

**Template structure:**
```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthenticatedScreenEnum } from './enums'
// Import screens...

const AuthStack = createNativeStackNavigator()

export const AuthenticatedNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name={AuthenticatedScreenEnum.Dashboard}
        component={Dashboard}
      />
      {/* Add other screens */}
    </AuthStack.Navigator>
  )
}
```

#### `src/view/authenticated/enums.ts`
**Should contain:**
```typescript
export enum AuthenticatedScreenEnum {
  Dashboard = 'Dashboard',
  TaxForm = 'TaxForm',
  RealEstateForm = 'RealEstateForm', // For your new feature
  // ... other screens
}
```

#### `src/view/authenticated/screens/`
**Should contain:**
- `Dashboard.tsx` - Main screen after login
- `TaxForm.tsx` - Main tax form
- Other tax-related screens
- **Your new screen:** `RealEstateForm.tsx`

---

## How to Restore Missing Files

### Option 1: Check Git History
```bash
git log --all --full-history -- src/context/
git log --all --full-history -- src/view/authenticated/
git log --all --full-history -- src/openapi/
```

### Option 2: Generate OpenAPI Client
```bash
# Ensure backend is running
npm run openapi
```

### Option 3: Recreate from Scratch
- Use the templates above
- Reference similar patterns in unauthenticated views
- Check backend API documentation for types

---

## Verification Steps

After restoring files, verify:

1. **App compiles:**
   ```bash
   npm run start
   ```

2. **No import errors:**
   - Check all imports in `App.tsx` resolve
   - Check context hooks are used correctly

3. **Navigation works:**
   - Test login flow
   - Test authenticated navigation

4. **API integration:**
   - Test API calls work
   - Check React Query queries/mutations

---

## Priority Order

1. **First:** Generate OpenAPI client (needed for types)
2. **Second:** Create User context (needed for auth flow)
3. **Third:** Create TaxReturn context (needed for tax data)
4. **Fourth:** Create Authenticated navigator (needed for main app)
5. **Fifth:** Create authenticated screens (needed for functionality)

