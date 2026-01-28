import { useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import {
  getAuth,
  AppleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from '@react-native-firebase/auth'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService, UserT } from './openapi'
import { showToast } from './components/CustomToast'

console.log('Type of ApiService.loginWithEmail:', typeof ApiService.loginWithEmail)

export function useAppleLogin() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | undefined>()

  type NavigationType = {
    navigate: (screen: string, params?: Record<string, any>) => void
  }

  const appleLoginFlow = useMutation({
    mutationFn: async (params: { identityToken: string; navigation: NavigationType }) => {
      // PRE-FLIGHT CHECK: Verify OpenAPI.BASE is set
      const { OpenAPI } = await import('./openapi/core/OpenAPI')
      if (!OpenAPI.BASE || OpenAPI.BASE.trim() === '') {
        const error = new Error('API Base URL not configured. Cannot login.')
        console.error('[LOGIN ERROR]', error.message)
        throw error
      }

      console.log('[LOGIN] OpenAPI.BASE:', OpenAPI.BASE)
      
      const firebaseUser = getAuth().currentUser
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Firebase user or email not found after sign-in')
      }

      console.log('[LOGIN] Attempting login with email:', firebaseUser.email)

      // API-Call with explicit timeout wrapper
      const loginPromise = ApiService.loginWithEmail({ email: firebaseUser.email })
      
      // Timeout wrapper: 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Login request timeout after 30s. Please check your internet connection.'))
        }, 30000)
      })

      const res = await Promise.race([loginPromise, timeoutPromise]) as any
      return { res, email: firebaseUser.email, navigation: params.navigation }
    },
    onSuccess: async ({ res, email, navigation }) => {
      console.log('[LOGIN] Response received:', res)
      if ('error' in res) {
        showToast('error', res.error)
        console.log('[LOGIN] Navigating to Registration with email:', email)
        navigation.navigate('Registration', { email })
      } else {
        showToast('success', 'Anmeldung erfolgreich')
        queryClient.setQueryData<UserT>(['user'], res.user)
        await AsyncStorage.setItem('@token', res.token)
        console.log('[LOGIN] Token saved, user data set')
      }
    },
    onError: (err: any, variables) => {
      const { email, navigation } = variables as unknown as { email: string, navigation: NavigationType }

      console.error('[LOGIN] Error:', err)
      
      // Show specific error message based on error type
      let errorMessage = 'Something went wrong during login.'
      if (err.message?.includes('BASE') || err.message?.includes('Base URL')) {
        errorMessage = 'API configuration error. Please contact support.'
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.'
      } else if (err.message) {
        errorMessage = err.message
      }

      Alert.alert('Login Error', errorMessage)
      
      if (email && navigation) {
        navigation.navigate('Registration', { email })
      }
    },
  })

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Trigger Apple Sign-In
  const promptAsync = async (navigation: NavigationType) => {
    try {
      setLoading(true)

      console.log('Starting Apple Sign-In...')

      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
        // See: https://github.com/invertase/react-native-apple-authentication#faqs
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      })

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned')
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse
      const appleCredential = AppleAuthProvider.credential(identityToken, nonce)

      const result = await signInWithCredential(getAuth(), appleCredential)
      console.log('Firebase sign-in success:', result.user.email)

      if (result.user.email) {
        appleLoginFlow.mutate({ identityToken, navigation })
      } else {
        throw new Error('User email is missing after Firebase sign-in')
      }

    } catch (error) {
      console.error('Apple Sign-In Error:', error)

      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code
        switch (errorCode) {
          case '1001': // User canceled
            // Don't show alert for user cancellation
            break
          case '1000': // Unknown error
            Alert.alert('Apple Sign-In Error', 'Unknown error occurred')
            break
          default:
            Alert.alert('Apple Sign-In Error', errorCode)
        }
      } else {
        Alert.alert('Sign-In Error', 'Something went wrong, please try again.')
      }
      setLoading(false)
    }
  }

  return { promptAsync, loading, user }
}

// Legacy function for backward compatibility
export async function onAppleButtonPress() {
  console.warn('onAppleButtonPress is deprecated. Use useAppleLogin hook instead.')

  try {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    })

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned')
    }

    // Create a Firebase credential from the response
    const { identityToken, nonce } = appleAuthRequestResponse
    const appleCredential = AppleAuthProvider.credential(identityToken, nonce)
    const result = await signInWithCredential(getAuth(), appleCredential)
    console.log('Firebase sign-in success:', result.user.email)

    // Sign the user in with the credential
    return signInWithCredential(getAuth(), appleCredential)
  } catch (error) {
    console.error('Apple Sign-In Error:', error)
    throw error
  }
}