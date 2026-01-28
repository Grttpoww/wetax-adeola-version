declare module 'react-native-phone-input' {
  import React from 'react'
  import PhoneNumberInput from 'react-native-phone-input'

  export const PhoneInput: React.FC<{
    onChangePhoneNumber: (string) => any
    ref: React.ReactNode
  }> & {
    getCountryCode: () => string
  } = PhoneNumberInput
}
