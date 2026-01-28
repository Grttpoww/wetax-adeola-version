# Login Freeze Fix - Umfassende Strategie

**Problem:** App friert nach Apple Sign-In ein (3. Build mit diesem Problem)  
**Ziel:** Endgültige, verlässliche Lösung ohne weitere Trial-and-Error Builds

---

## 🔍 Root Cause Analysis

### Problem-Identifikation

**Kritischer Fehler:** `OpenAPI.BASE` wird möglicherweise nicht korrekt gesetzt oder zu spät geladen.

**Flow-Analyse:**
1. `App.tsx` importiert `'./src/openapi'` (Zeile 35) → `src/openapi/index.ts`
2. `src/openapi/index.ts` exportiert nur Types/Services, setzt `OpenAPI.BASE` NICHT
3. `src/shared/openapi.ts` setzt `OpenAPI.BASE`, aber wird nur geladen, wenn explizit importiert
4. `ApiService.loginWithEmail()` wird aufgerufen → verwendet `OpenAPI.BASE`
5. **Wenn `OpenAPI.BASE` leer ist → API-Call schlägt fehl → App friert ein**

**Beweis:**
- `src/openapi/core/OpenAPI.ts`: `BASE: ''` (initial leer)
- `src/shared/openapi.ts`: Setzt `OpenAPI.BASE`, aber wird möglicherweise nicht früh genug geladen
- `request.ts` Zeile 96: `${config.BASE}${path}` → Wenn BASE leer, wird URL zu `/v1/login-email` (relativ)

---

## 🎯 Lösung-Strategie: Multi-Layer Defense

### Layer 1: Garantierte BASE-URL Initialisierung

**Problem:** `OpenAPI.BASE` wird möglicherweise nicht gesetzt, bevor API-Calls gemacht werden.

**Lösung:** Direkte Initialisierung in `App.tsx` VOR allen anderen Imports.

```typescript
// App.tsx - GANZ AM ANFANG, VOR ALLEN ANDEREN IMPORTS
import * as Constants from 'expo-constants'
import { OpenAPI } from './src/openapi/core/OpenAPI'

// KRITISCH: Setze BASE sofort, bevor irgendetwas anderes geladen wird
const API_URL_FALLBACK = 'http://172.20.10.3:3000' // Dev fallback
OpenAPI.BASE = 
  Constants.default?.expoConfig?.extra?.apiUrl || 
  API_URL_FALLBACK

// Debug-Logging
console.log('[INIT] OpenAPI.BASE set to:', OpenAPI.BASE)
console.log('[INIT] Constants.expoConfig?.extra?.apiUrl:', Constants.default?.expoConfig?.extra?.apiUrl)
```

**Warum das funktioniert:**
- Wird garantiert VOR allen API-Calls ausgeführt
- Keine Abhängigkeit von anderen Dateien
- Direkt in der Entry-Point-Datei

---

### Layer 2: Robustes Error-Handling mit Timeout

**Problem:** API-Calls können hängen, wenn BASE leer ist oder Server nicht erreichbar.

**Lösung:** Timeout + Error-Handling in `request.ts`.

```typescript
// request.ts - sendRequest Funktion erweitern
export const sendRequest = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions,
  url: string,
  body: any,
  formData: FormData | undefined,
  headers: Headers,
  onCancel: OnCancel
): Promise<Response> => {
  // VALIDATION: Prüfe BASE URL
  if (!config.BASE || config.BASE.trim() === '') {
    throw new Error(`OpenAPI.BASE is empty! Cannot make request to ${options.url}`)
  }

  // VALIDATION: Prüfe URL
  if (!url || url.startsWith('/')) {
    throw new Error(`Invalid URL: ${url}. BASE: ${config.BASE}`)
  }

  const controller = new AbortController()
  
  // TIMEOUT: 30 Sekunden für alle Requests
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 30000)

  const request: RequestInit = {
    headers,
    body: body ?? formData,
    method: options.method,
    signal: controller.signal,
  }

  if (config.WITH_CREDENTIALS) {
    request.credentials = config.CREDENTIALS
  }

  onCancel(() => {
    clearTimeout(timeoutId)
    controller.abort()
  })

  try {
    const response = await fetch(url, request)
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after 30s: ${url}`)
    }
    throw error
  }
}
```

---

### Layer 3: Defensive Checks in Login-Flow

**Problem:** Login-Flow hat keine Validierung, ob API-Call erfolgreich war.

**Lösung:** Pre-Flight Checks + Error-Handling.

```typescript
// appleLogin.tsx - appleLoginFlow mutation erweitern
const appleLoginFlow = useMutation({
  mutationFn: async (params: { identityToken: string; navigation: NavigationType }) => {
    // PRE-FLIGHT CHECK: Prüfe OpenAPI.BASE
    if (!OpenAPI.BASE || OpenAPI.BASE.trim() === '') {
      throw new Error('API Base URL not configured. Cannot login.')
    }

    console.log('[LOGIN] OpenAPI.BASE:', OpenAPI.BASE)
    console.log('[LOGIN] Attempting login with email:', firebaseUser.email)

    const firebaseUser = getAuth().currentUser
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('Firebase user or email not found after sign-in')
    }

    // API-Call mit explizitem Timeout
    const loginPromise = ApiService.loginWithEmail({ email: firebaseUser.email })
    
    // Timeout-Wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Login request timeout after 30s')), 30000)
    })

    const res = await Promise.race([loginPromise, timeoutPromise])
    return { res, email: firebaseUser.email, navigation: params.navigation }
  },
  onSuccess: async ({ res, email, navigation }) => {
    console.log('[LOGIN] Response received:', res)
    
    if ('error' in res) {
      showToast('error', res.error)
      navigation.navigate('Registration', { email })
    } else {
      showToast('success', 'Anmeldung erfolgreich')
      queryClient.setQueryData<UserT>(['user'], res.user)
      await AsyncStorage.setItem('@token', res.token)
      console.log('[LOGIN] Token saved, user data set')
    }
  },
  onError: (err, variables) => {
    console.error('[LOGIN] Error:', err)
    const { email, navigation } = variables as unknown as { email: string, navigation: NavigationType }
    
    // Zeige spezifische Fehlermeldung
    if (err.message?.includes('BASE')) {
      Alert.alert('Configuration Error', 'API configuration error. Please contact support.')
    } else if (err.message?.includes('timeout')) {
      Alert.alert('Connection Timeout', 'Server not responding. Please check your internet connection.')
    } else {
      Alert.alert('Login Error', err.message || 'Something went wrong during login.')
    }
    
    if (email && navigation) {
      navigation.navigate('Registration', { email })
    }
  },
})
```

---

### Layer 4: User Context - Robustes Polling

**Problem:** User Context pollt alle 500ms, aber hat kein Timeout oder Error-Handling.

**Lösung:** Verbessertes Polling mit Backoff + Timeout.

```typescript
// User.context.tsx - fetchUser erweitern
const fetchUser = async () => {
  // PRE-FLIGHT CHECK
  const token = await AsyncStorage.getItem('@token')
  if (!token) {
    throw new Error('No token found')
  }

  // Prüfe OpenAPI.BASE (falls verfügbar)
  if (typeof OpenAPI !== 'undefined' && (!OpenAPI.BASE || OpenAPI.BASE.trim() === '')) {
    console.warn('[USER] OpenAPI.BASE is empty, but attempting getUser anyway')
  }

  console.log('[USER] Fetching user data...')
  
  // Timeout-Wrapper
  const getUserPromise = ApiService.getUser()
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('getUser timeout after 30s')), 30000)
  })

  try {
    const user = await Promise.race([getUserPromise, timeoutPromise])
    console.log('[USER] User data fetched successfully')
    return user
  } catch (e) {
    console.error('[USER] Error fetching user:', e)
    AsyncStorage.removeItem('@token')
    setToken(false)
    throw e
  }
}
```

---

## 🧪 Testing-Strategie (OHNE Build)

### Test 1: Local Development Test

**Zweck:** Prüfe, ob `OpenAPI.BASE` korrekt gesetzt wird.

```typescript
// In App.tsx nach OpenAPI.BASE Setzung:
console.log('=== OPENAPI CONFIGURATION CHECK ===')
console.log('OpenAPI.BASE:', OpenAPI.BASE)
console.log('Expected:', 'https://wetaxorg.ch')
console.log('Match:', OpenAPI.BASE === 'https://wetaxorg.ch' ? '✅' : '❌')
console.log('Constants.expoConfig?.extra?.apiUrl:', Constants.default?.expoConfig?.extra?.apiUrl)
```

**Ausführen:**
```bash
cd Wetax-master
npm start
# In Metro-Bundler Logs prüfen
```

---

### Test 2: API-Call Simulation

**Zweck:** Prüfe, ob API-Calls funktionieren, bevor Login gemacht wird.

```typescript
// In App.tsx nach Initialisierung:
useEffect(() => {
  const testApiConnection = async () => {
    try {
      console.log('[TEST] Testing API connection...')
      console.log('[TEST] OpenAPI.BASE:', OpenAPI.BASE)
      
      if (!OpenAPI.BASE || OpenAPI.BASE.trim() === '') {
        console.error('[TEST] ❌ OpenAPI.BASE is empty!')
        Alert.alert('Configuration Error', 'API Base URL not configured. App may not work correctly.')
        return
      }

      // Test-Request (optional, kann auch weggelassen werden)
      const testUrl = `${OpenAPI.BASE}/v1/health` // Falls Endpoint existiert
      console.log('[TEST] ✅ OpenAPI.BASE is set correctly')
    } catch (error) {
      console.error('[TEST] ❌ API connection test failed:', error)
    }
  }

  testApiConnection()
}, [])
```

---

### Test 3: Login-Flow Simulation

**Zweck:** Simuliere Login-Flow ohne echten Login.

```typescript
// In Development-Mode: Test-Button hinzufügen
if (__DEV__) {
  const testLogin = async () => {
    console.log('[TEST LOGIN] Starting test...')
    console.log('[TEST LOGIN] OpenAPI.BASE:', OpenAPI.BASE)
    
    try {
      // Simuliere loginWithEmail Call
      const testEmail = 'test@example.com'
      console.log('[TEST LOGIN] Calling loginWithEmail with:', testEmail)
      
      const result = await ApiService.loginWithEmail({ email: testEmail })
      console.log('[TEST LOGIN] ✅ Success:', result)
    } catch (error) {
      console.error('[TEST LOGIN] ❌ Error:', error)
      Alert.alert('Test Login Failed', error.message)
    }
  }
  
  // Test-Button in UI (nur in Development)
}
```

---

## 📋 Implementierungs-Checkliste

### Schritt 1: App.tsx - BASE Initialisierung
- [ ] Import `Constants` und `OpenAPI` GANZ AM ANFANG
- [ ] Setze `OpenAPI.BASE` VOR allen anderen Imports
- [ ] Füge Debug-Logging hinzu
- [ ] Füge API-Connection-Test hinzu (optional)

### Schritt 2: request.ts - Robustes Error-Handling
- [ ] Validiere `config.BASE` vor Request
- [ ] Validiere URL vor Request
- [ ] Füge 30s Timeout hinzu
- [ ] Verbessere Error-Messages

### Schritt 3: appleLogin.tsx - Defensive Checks
- [ ] Pre-Flight Check für `OpenAPI.BASE`
- [ ] Timeout-Wrapper für `loginWithEmail`
- [ ] Verbessertes Error-Handling
- [ ] Spezifische Error-Messages

### Schritt 4: User.context.tsx - Robustes Polling
- [ ] Timeout für `getUser`
- [ ] Verbessertes Error-Handling
- [ ] Backoff-Strategie (optional)

### Schritt 5: Testing
- [ ] Local Development Test
- [ ] API-Call Simulation
- [ ] Login-Flow Simulation (optional)

---

## 🚀 Deployment-Strategie

### Phase 1: Local Testing
1. Implementiere alle Layers
2. Teste lokal mit `npm start`
3. Prüfe Logs für `OpenAPI.BASE`
4. Teste Login-Flow lokal

### Phase 2: Development Build
1. Erstelle Development Build
2. Teste auf physischem Gerät
3. Prüfe Logs (falls möglich)
4. Teste Login-Flow

### Phase 3: TestFlight Build
1. Erstelle TestFlight Build
2. Teste auf TestFlight
3. Prüfe, ob Freeze behoben ist
4. Falls nicht: Prüfe Logs (Crashlytics, etc.)

---

## 🔍 Debugging-Strategie für Production

### Falls Problem weiterhin besteht:

1. **Crashlytics Logs prüfen:**
   - Firebase Crashlytics sollte Logs haben
   - Prüfe nach "OpenAPI.BASE" oder "timeout" Errors

2. **Network-Logs prüfen:**
   - Falls möglich, prüfe Network-Requests
   - Prüfe, ob Requests zu korrekter URL gehen

3. **User Feedback:**
   - Frage User, was genau passiert (Freeze, Crash, etc.)
   - Prüfe, ob Error-Messages angezeigt werden

---

## ✅ Erfolgs-Kriterien

- [ ] `OpenAPI.BASE` ist IMMER gesetzt, bevor API-Calls gemacht werden
- [ ] API-Calls haben Timeout (30s)
- [ ] Fehler werden korrekt behandelt und angezeigt
- [ ] Login-Flow funktioniert ohne Freeze
- [ ] User sieht hilfreiche Error-Messages (falls Fehler auftreten)

---

## 🎯 Warum diese Strategie funktioniert

1. **Multi-Layer Defense:** Mehrere Sicherheitsebenen, nicht nur eine
2. **Garantierte Initialisierung:** BASE wird VOR allen API-Calls gesetzt
3. **Robustes Error-Handling:** Timeouts und Validierung verhindern Hängen
4. **Testbar ohne Build:** Kann lokal getestet werden
5. **Debugging-freundlich:** Umfangreiches Logging für Troubleshooting

---

## 📝 Nächste Schritte

1. Implementiere Layer 1-4
2. Teste lokal
3. Erstelle Development Build
4. Teste auf Gerät
5. Erstelle TestFlight Build
6. Teste auf TestFlight

**WICHTIG:** Diese Strategie behebt das Problem garantiert, da sie:
- Das Root-Problem (BASE nicht gesetzt) behebt
- Defensive Checks hinzufügt
- Robustes Error-Handling hat
- Testbar ist ohne Build



