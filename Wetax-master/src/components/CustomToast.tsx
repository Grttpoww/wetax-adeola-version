import React from 'react'
import { Text, View } from 'react-native'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message'

export const showToast = (type: 'success' | 'error' | 'warning', text1: string, text2?: string) => {
  Toast.show({
    type,
    text1,
    text2,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 60,
  })
}

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4BB543', borderLeftWidth: 5 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: 'black',
      }}
      text2Style={{
        fontSize: 13,
        color: 'gray',
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF3B30', borderLeftWidth: 5 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: 'black',
      }}
      text2Style={{
        fontSize: 13,
        color: 'gray',
      }}
    />
  ),

  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FFA500', borderLeftWidth: 5, backgroundColor: '#FFF8E1' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#8A6D3B',
      }}
      text2Style={{
        fontSize: 13,
        color: '#8A6D3B',
      }}
    />
  ),
}

// // Show success toast
// showToast('success', 'Data saved successfully')

// // Show error toast
// showToast('error', 'Failed to save data', 'Check your connection')

// // Show warning toast
// showToast('warning', 'Incomplete form', 'Please fill all required fields')
