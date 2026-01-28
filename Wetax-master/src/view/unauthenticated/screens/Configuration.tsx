import { Text, View } from 'react-native'
import { UnauthenticatedBackground } from '../../../components/configured/UnauthenticatedBackground'
import { API_URL } from '../../../shared/openapi'
import * as Constants from 'expo-constants'

export const Configuration = (props: { navigation: any }) => {
  const values = [
    {
      label: 'API URL',
      value: API_URL,
    },
    {
      label: 'Version',
      value: Constants.default?.expoConfig?.version || 'development',
    },
    {
      label: 'Environment',
      value: process.env.NODE_ENV || 'development',
    },
    {
      label: 'Runtime version',
      value: Constants.default?.expoRuntimeVersion || 'development',
    },
  ]

  return (
    <UnauthenticatedBackground>
      <View style={{ flex: 1, width: '100%', gap: 32 }}>
        {values.map((v, i) => (
          <View
            key={i}
            style={{
              gap: 8,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{v.label}:</Text>
            <Text>{v.value}</Text>
          </View>
        ))}
      </View>
    </UnauthenticatedBackground>
  )
}
