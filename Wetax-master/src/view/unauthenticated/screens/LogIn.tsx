import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { UnauthenticatedBackground } from '../../../components/configured/UnauthenticatedBackground'
import { AHV_REGEX } from '../../../shared/constants'
import { ApiService } from '../../../openapi'
import { useMutation } from '@tanstack/react-query'
import { UnauthenticatedScreenEnum } from '../enums'
import { Logo } from '../../../svgs/Logo'
import { showToast } from '../../../components/CustomToast'

export const LogIn = ({ navigation }: any) => {
  const [ahvNumber, setAhvNumber] = useState('')
  const [error, setError] = useState<string | undefined>()

  const login = useMutation({
    mutationFn: ApiService.login,
    onSuccess: (v) => {
      if ('success' in v) {
        navigation.navigate(UnauthenticatedScreenEnum.SubmitCode, {
          ahvNumber,
          phoneNumber: v.phoneNumber,
        })
        showToast('success', 'Geben Sie OTP ein, um fortzufahren')
      } else if (v.error) {
        // setError(v.error)
        console.log(v.error)
        showToast('error', 'Error', v.error)
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte erneut versuchen.')
        showToast('error', 'Error', 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.')
      }
    },
  })

  const handleLogin = () => {
    if (!AHV_REGEX.test(ahvNumber)) {
      setError('Bitte geben Sie eine gültige AHV-Nummer ein.')
      return
    }
    setError(undefined)
    login.mutate({ ahvNumber })
  }

  return (
    <UnauthenticatedBackground>
      <Logo />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Willkommen zurück</Text>
        <Text style={styles.subtitle}>Geben Sie Ihre AHV-Nummer ein</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={ahvNumber}
          // onChangeText={(text) => {
          //   setAhvNumber(text)
          //   setError(undefined)
          // }}

          onChangeText={(text) => {
            const isDeleting = text.length < ahvNumber.length

            let digits = text.replace(/\D/g, '')
            const prevDigits = ahvNumber.replace(/\D/g, '')

            if (isDeleting) {
              if (ahvNumber.endsWith('.')) {
                digits = prevDigits.slice(0, -1)
              } else if (prevDigits.length > digits.length) {
                digits = prevDigits.slice(0, -1)
              }
            }

            let formatted = ''
            for (let i = 0; i < digits.length && i < 13; i++) {
              formatted += digits[i]
              if (i === 2 || i === 6 || i === 10) {
                formatted += '.'
              }
            }

            setAhvNumber(formatted)
            setError(undefined)
          }}
          placeholder="756.XXXX.XXXX.XX"
          placeholderTextColor="#999"
          maxLength={16}
          autoCapitalize="none"
          keyboardType="number-pad"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, !AHV_REGEX.test(ahvNumber) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!AHV_REGEX.test(ahvNumber) || login.isPending}
        >
          {login.isPending ? (
            <ActivityIndicator color="#1d2dba" />
          ) : (
            <Text style={styles.buttonText}>Weiter</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(UnauthenticatedScreenEnum.Registration)}>
          <Text style={styles.registerText}>
            Noch kein Konto? <Text style={styles.registerLink}>Jetzt registrieren</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </UnauthenticatedBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1D2DBA',
    // backgroundColor: '#f6f6f6',
    marginTop: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  error: {
    marginTop: 8,
    color: '#D32F2F',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#adadad',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    marginTop: 20,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  registerLink: {
    color: '#fff',
    fontWeight: '600',
  },
})
