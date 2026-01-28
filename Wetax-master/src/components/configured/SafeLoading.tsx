import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { ColorSchemes } from '../../shared/colors'
import { Button } from '../shared'

export const SafeLoading = (props: { showError?: boolean }) => {
  const [showError, setShowError] = useState(!!props.showError)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowError(true)
    }, 5000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: ColorSchemes.light.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 32,
      }}
    >
      {!showError ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
            An error has occured. Please reload the app and try again.
          </Text>
          <Button
            label="Reload app"
            onPress={() => {
              AsyncStorage.clear()
              Updates.reloadAsync()

              setShowError(false)
            }}
          />
        </>
      )}
    </View>
  )
}
