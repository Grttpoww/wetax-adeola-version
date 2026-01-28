import { AntDesign } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components'
import { Button, ButtonType, Input } from '../../../../components/shared'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { ApiService, User } from '../../../../openapi'
import { TaxReturnScreen } from '../enums'
import { AuthenticatedNavigatorEnum } from '../../enums'

export const RejectionScreen = ({ navigation }: any) => {
  const theme = useTheme()

  const queryClient = useQueryClient()

  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState<string>('')

  const [success, setSuccess] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.PRIMARY,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="light" />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(AuthenticatedNavigatorEnum.TaxReturn, { screen: TaxReturnScreen.Overview })
        }}
        style={{
          position: 'absolute',
          top: insets.top + 12,
          right: 32,
        }}
      >
        <AntDesign name="close" size={28} color="black" />
      </TouchableOpacity>
      
      {/* Debug Panel - Shows current values */}
      <TouchableOpacity
        onPress={() => setShowDebug(!showDebug)}
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 32,
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: 8,
          borderRadius: 4,
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </Text>
      </TouchableOpacity>
      {success ? (
        <View
          style={{
            width: '100%',
            gap: 16,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 32,
              fontWeight: 'bold',
              width: '100%',
              textAlign: 'center',
            }}
          >
            Danke.
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: 'white',
              width: '100%',
              marginBottom: 16,
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            Wir werden uns hoffentlich bald wieder bei Ihnen melden!
          </Text>
        </View>
      ) : (
        <View
          style={{
            width: '100%',
            gap: 16,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 32,
              fontWeight: 'bold',
              width: '100%',
              textAlign: 'center',
            }}
          >
            Es tut uns leid.
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: 'white',
              width: '100%',
              marginBottom: 16,
              opacity: 0.7,
            }}
          >
            Leider können wir Ihre Steuersituation derzeit noch nicht bearbeiten. Bitte hinterlassen Sie
            unten Ihre E-Mail-Adresse, und wir werden uns bei Ihnen melden, wenn sich die Lage ändert.
          </Text>

          <Input
            value={email}
            onChange={setEmail}
            inputProps={{ placeholder: 'Email', keyboardType: 'email-address', style: { color: '#fff' } }}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={email.length === 0}
            onPress={() => {
              ApiService.updateUserData({ email }).then(() => {
                setSuccess(true)
                queryClient.setQueryData<User>(['user'], (u) => (u ? { ...u, email } : undefined))
              })
            }}
            style={{
              borderWidth: 1,
              borderColor: '#fff',
              height: 50,
              borderRadius: 30,
              backgroundColor: '#fff',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '600' }}>{'Einreichen'}</Text>
          </TouchableOpacity>
          {/* <Button
            label="Einreichen"
            disabled={email.length === 0}
            onPress={() => {
              ApiService.updateUserData({ email }).then(() => {
                setSuccess(true)
                queryClient.setQueryData<User>(['user'], (u) => (u ? { ...u, email } : undefined))
              })
            }}
            type={ButtonType.ChromelessLight}
            style={{
              background: {
                marginTop: -12,
              },
            }}
          /> */}
        </View>
      )}
    </View>
  )
}
