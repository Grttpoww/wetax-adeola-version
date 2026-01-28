import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from '@react-native-firebase/auth'
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService, UserT } from './openapi'
import { showToast } from './components/CustomToast'

console.log('Type of ApiService.loginWithEmail:', typeof ApiService.loginWithEmail)

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '1067572837854-d9a5j4ru7jpus511fi4ttjukb3l77ocp.apps.googleusercontent.com',
})

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | undefined>()

  type NavigationType = {
    navigate: (screen: string, params?: Record<string, any>) => void
  }

  const googleLoginFlow = useMutation({
    mutationFn: async (params: { idToken: string; navigation: NavigationType }) => {
      const firebaseUser = getAuth().currentUser
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Firebase user or email not found after sign-in')
      }
      
      const res = await ApiService.loginWithEmail({ email: firebaseUser.email })
      return { res, email: firebaseUser.email, navigation: params.navigation }
    },
    onSuccess: async ({ res, email, navigation }) => {
      console.log('RESPONSE::', res)
      if ('error' in res) {
        showToast('error', res.error)
        console.log('Navigating to Registration with email:', email)
        // **FIX:** Use the passed-in navigation object
        navigation.navigate('Registration', { email }) 
      } else {
        showToast('success', 'Anmeldung erfolgreich')
        queryClient.setQueryData<UserT>(['user'], res.user)
        await AsyncStorage.setItem('@token', res.token)
      }
    },
    onError: (err, variables) => {
      const { email, navigation } = variables as unknown as { email: string, navigation: NavigationType } // Cast variables to get navigation
      
      console.error('Login with email error:', err)
      // **FIX:** Use the passed-in navigation object
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

  // Trigger Google Sign-In
  const promptAsync = async (navigation: NavigationType) => {
    try {
      setLoading(true)

      console.log('Checking Google Play Services...')
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      })

      console.log('Signing in with Google...')
      const signInResult = await GoogleSignin.signIn()

      const idToken = signInResult.data?.idToken
      if (!idToken) {
        throw new Error('No ID token found in Google sign-in result')
      }

      const googleCredential = GoogleAuthProvider.credential(idToken)

      const result = await signInWithCredential(getAuth(), googleCredential)
      console.log('Firebase sign-in success:', result.user.email)

      if (result.user.email) {
         googleLoginFlow.mutate({ idToken, navigation })
      } else {
         throw new Error('User email is missing after Firebase sign-in')
      }
      
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Sign-In in progress')
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Play Services not available or outdated')
            break
          default:
            Alert.alert('Google Sign-In Error', error.code)
        }
      } else {
        Alert.alert('Sign-In Error', 'Something went wrong, please try again.')
      }
      setLoading(false)
    }
  }

  return { promptAsync, loading, user }
}
