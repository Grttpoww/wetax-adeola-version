import { Text } from 'react-native'
import 'react-native-gesture-handler'
import * as Updates from 'expo-updates'
import { View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button } from '../components/shared'

export const CustomErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingLeft: 32,
        paddingRight: 32,
        gap: 8,
      }}
    >
      <>
        <Text style={{ color: 'white', fontSize: 24 }}> An error has occurred!</Text>
        <Text style={{ color: 'white', fontSize: 16 }}>{error.toString()}</Text>
        <Button
          label="Reload app"
          style={{
            background: {
              width: '100%',
              marginTop: 32,
            },
          }}
          onPress={() => {
            Updates.reloadAsync()
          }}
        />
        <Button
          label="Clear data & reload"
          style={{
            background: {
              width: '100%',
            },
          }}
          onPress={() => {
            AsyncStorage.clear()
            Updates.reloadAsync()
          }}
        />
      </>
    </View>
  )
}
