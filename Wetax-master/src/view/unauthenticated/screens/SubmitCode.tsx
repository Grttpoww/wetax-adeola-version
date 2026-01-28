import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { UnauthenticatedBackground } from '../../../components/configured/UnauthenticatedBackground'
import { ApiService, UserT } from '../../../openapi'
import { Logo } from '../../../svgs/Logo'
import { showToast } from '../../../components/CustomToast'

export const SubmitCode = ({ route, navigation }: { route: any; navigation: any }) => {
  const { ahvNumber, phoneNumber } = route.params
  const queryClient = useQueryClient()

  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''))
  const [error, setError] = useState<string | undefined>(undefined)
  const inputRefs = useRef<TextInput[]>([])

  const submitVerificationCode = useMutation({
    mutationFn: ApiService.submitVerificationCode,
    onSuccess: async (res) => {
      console.log('RESPONSE::', res)

      if ('error' in res) {
        setError(res.error)
      } else {
        showToast('success', 'Anmeldung erfolgreich')
        // Store token first
        await AsyncStorage.setItem('@token', res.token)
        // Clear any old tax return ID from previous session
        await AsyncStorage.removeItem('@taxReturnId')
        // Set user data and invalidate to trigger refetch
        queryClient.setQueryData<UserT>(['user'], res.user)
        // Clear all tax return queries to ensure fresh data
        queryClient.removeQueries({ queryKey: ['taxReturn'] })
        queryClient.removeQueries({ queryKey: ['taxAmount'] })
        // Invalidate user query to refetch with all returns
        await queryClient.invalidateQueries({ queryKey: ['user'] })
      }
    },
  })

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digitsOnly = value.replace(/\D/g, '')

    // If multiple digits pasted or typed
    if (digitsOnly.length > 1) {
      const digits = digitsOnly.slice(0, 6).split('')
      const newDigits = [...codeDigits]
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 6) {
          newDigits[index + i] = digits[i]
        }
      }
      setCodeDigits(newDigits)
      setError(undefined)
      // Blur all inputs
      inputRefs.current.forEach((ref) => ref?.blur())
      // Auto submit if all filled
      if (newDigits.every((d) => d)) {
        handleSubmit(newDigits.join(''))
      }
      return
    }

    // Single digit input
    if (digitsOnly.length === 1) {
      const newDigits = [...codeDigits]
      newDigits[index] = digitsOnly
      setCodeDigits(newDigits)
      setError(undefined)

      // Auto focus to next input if not last
      if (index < 5) {
        inputRefs.current[index + 1]?.focus()
      }

      // Auto submit when last digit is filled
      if (index === 5 && newDigits.every((d) => d)) {
        handleSubmit(newDigits.join(''))
      }
    } else if (digitsOnly.length === 0) {
      // Handle backspace or clearing
      const newDigits = [...codeDigits]
      newDigits[index] = ''
      setCodeDigits(newDigits)
    }
  }

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (fullCode?: string) => {
    const code = fullCode || codeDigits.join('')
    if (code.length !== 6) {
      // Alert.alert('Invalid Code', 'Please enter the 6-digit code.')
      showToast('warning', 'Invalid Code', 'Please enter the 6-digit code.')
      return
    }

    setError(undefined)
    submitVerificationCode.mutate({ code, ahvNumber })
  }

  return (
    <UnauthenticatedBackground>
      <Logo />
      <View style={{ flex: 1, marginTop: 80, gap: 32 }}>
        {/* Title */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>Verify phone number</Text>
          <Text style={{ fontSize: 13, color: '#fff' }}>
            Enter the 6-digit code sent to {phoneNumber}
          </Text>
        </View>

        {/* OTP Inputs */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {codeDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref
                }}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                style={{
                  width: 48,
                  height: 56,
                  borderWidth: 1,
                  borderColor: error ? 'red' : '#ccc',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 24,
                  backgroundColor: '#fff',
                }}
              />
            ))}
          </View>
          {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={() => handleSubmit()}
          disabled={submitVerificationCode.isPending}
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: submitVerificationCode.isPending ? 0.6 : 1,
          }}
        >
          {submitVerificationCode.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#333', fontSize: 16, fontWeight: '600' }}>Einreichen</Text>
          )}
        </TouchableOpacity>
      </View>
    </UnauthenticatedBackground>
  )
}
