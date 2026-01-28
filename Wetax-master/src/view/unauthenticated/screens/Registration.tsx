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
import { testEmail, testPhoneNumber, formatPhoneNumberForBackend } from '../../../shared/util'
import { CountryCodePicker } from '../../../components/CountryCodePicker'
import { CountryData, DEFAULT_COUNTRY } from '../../../shared/countryData'
import { ApiService } from '../../../openapi'
import { useMutation } from '@tanstack/react-query'
import { UnauthenticatedScreenEnum } from '../enums'
import { Logo } from '../../../svgs/Logo'
import { showToast } from '../../../components/CustomToast'
import Checkbox from 'expo-checkbox'
import { Feather, Fontisto } from '@expo/vector-icons'

export const Registration = ({ navigation, route }: any) => {
  const initialEmail = route?.params?.email || ''
  const [ahvNumber, setAhvNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | undefined>()
  const [agreed, setAgreed] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(DEFAULT_COUNTRY)

  const register = useMutation({
    mutationFn: ApiService.register,
    onSuccess: (v) => {
      console.log('RESPONSE::', v)

      if ('success' in v) {
        navigation.navigate(UnauthenticatedScreenEnum.SubmitCode, {
          ahvNumber,
          phoneNumber: v.phoneNumber,
        })
        showToast('success', 'Registrierung erfolgreich')
      } else if (v.error) {
        setError(v.error)
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte erneut versuchen.')
        showToast('error', 'Error', 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.')
      }
    },
  })

  const handleRegister = () => {
    if (!AHV_REGEX.test(ahvNumber)) {
      setError('Bitte geben Sie eine gültige AHV-Nummer ein.')
      return
    }
    if (!testPhoneNumber(phoneNumber)) {
      setError('Bitte geben Sie eine gültige Telefonnummer ein.')
      return
    }
    if (!testEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return
    }
    setError(undefined)

    // Format phone number with country code for backend
    const formattedPhoneNumber = formatPhoneNumberForBackend(phoneNumber, selectedCountry.phoneCode)

    register.mutate({ ahvNumber, phoneNumber: formattedPhoneNumber, email })
  }

  return (
    <UnauthenticatedBackground>
      <Logo />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Registrierung</Text>
        <Text style={styles.subtitle}>Geben Sie Ihre AHV-Nummer und Telefonnummer ein</Text>

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

        <View style={styles.phoneInputContainer}>
          <CountryCodePicker
            selectedCountry={selectedCountry}
            onCountrySelect={setSelectedCountry}
            style={[styles.countryPicker, error && styles.inputError]}
          />
          <TextInput
            style={[styles.phoneInput, error && styles.inputError]}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text)
              setError(undefined)
            }}
            placeholder="79 123 4567"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <TextInput
          style={[styles.input, error && styles.inputError, { marginTop: 16 }]}
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            setError(undefined)
          }}
          placeholder="max.mustermann@gmail.com"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <View style={styles.checkboxContainer}>
          {/* <Checkbox value={agreed} onValueChange={setAgreed} color={agreed ? '#fff' : undefined} /> */}
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
            style={{
              borderWidth: 0,
              width: 30,
              height: 30,
              borderColor: '#fff',
              borderRadius: 0,
              alignItems: 'center',
              justifyCenter: 'center',
            }}
          >
            {agreed ? (
              <Feather name="check-square" size={24} color="#fff" />
            ) : (
              <Fontisto name="checkbox-passive" size={22} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            Durch das Aktivieren stimmen Sie unseren{' '}
            <Text
              style={styles.linkInline}
              onPress={() => navigation.navigate(UnauthenticatedScreenEnum.PrivacyPolicy)}
            >
              Datenschutzbestimmungen
            </Text>{' '}
            und{' '}
            <Text
              style={styles.linkInline}
              onPress={() => navigation.navigate(UnauthenticatedScreenEnum.TermsOfService)}
            >
              Nutzungsbedingungen
            </Text>{' '}
            zu.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.button,
            (!AHV_REGEX.test(ahvNumber) ||
              !testPhoneNumber(phoneNumber) ||
              !testEmail(email) ||
              !agreed) &&
              styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={
            !AHV_REGEX.test(ahvNumber) ||
            !testPhoneNumber(phoneNumber) ||
            !testEmail(email) ||
            !agreed ||
            register.isPending
          }
        >
          {register.isPending ? (
            <ActivityIndicator color="#1d2dba" />
          ) : (
            <Text style={styles.buttonText}>Weiter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate(UnauthenticatedScreenEnum.LogIn)}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Bereits registriert? <Text style={styles.linkBold}>Einloggen</Text>
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
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
  },
  linkBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingRight: 10,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
  },
  linkInline: {
    textDecorationLine: 'underline',
    color: '#fff',
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  countryPicker: {
    flex: 0,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111',
  },
})
