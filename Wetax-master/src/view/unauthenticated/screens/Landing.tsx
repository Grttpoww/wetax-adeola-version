import { StatusBar, Text, TouchableOpacity, View, Platform, StyleSheet } from 'react-native'
import { Logo } from '../../../svgs/Logo'
import * as Constants from 'expo-constants'
import { useTheme } from 'styled-components'
import { UnauthenticatedScreenEnum } from '../enums'
import { useState } from 'react'
import {
  AntDesign,
  Feather,
  Ionicons,
} from '@expo/vector-icons'
import { useGoogleLogin } from '../../../googleLogin'
import { useAppleLogin } from '../../../appleLogin'

export const Landing = ({ navigation }: any) => {
  const theme = useTheme()
  const [debug, setDebug] = useState(0)
  const { promptAsync } = useGoogleLogin()
  const { promptAsync: promptAppleAsync, loading: appleLoading } = useAppleLogin()

  const handleDebugPress = () => {
    setDebug((prev) => {
      if (prev > 7) {
        navigation.navigate(UnauthenticatedScreenEnum.Configuration)
      }
      return prev + 1
    })
  }

  const SocialButton = ({
    label,
    icon,
    onPress,
    backgroundColor,
    disabled,
  }: {
    label: string
    icon: React.ReactNode
    onPress: () => void
    backgroundColor?: string
    disabled?: any
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 30,
        backgroundColor: backgroundColor || 'white',
        justifyContent: 'space-between',
        gap: 12,
        height: 50,
      }}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {icon}
        <Text style={{ fontSize: 16, fontWeight: '500', color: 'black' }}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  )

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.PRIMARY,
          padding: 24,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleDebugPress}
          style={{ width: '100%', marginBottom: 32 }}
        >
          <Logo />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'left',
            width: '100%',
            marginBottom: 32,
          }}
        >
          Steuern einfach gemacht.
        </Text>

        <View style={{ height: 24 }} />

        {/* Social Login Buttons */}
        <View style={{ width: '100%', gap: 12 }}>
          <SocialButton
            label="Mit Google einloggen"
            icon={<AntDesign name="google" size={20} color="#DB4437" />}
            onPress={() => promptAsync(navigation)}
          />
          {Platform.OS === 'ios' && (
            <SocialButton
              label="Mit Apple einloggen"
              icon={<AntDesign name="apple" size={20} color="black" />}
              onPress={() => promptAppleAsync(navigation)}
            />
          )}
          <SocialButton
            label="Login via AHV"
            icon={<Feather name="lock" size={20} color="#333" />}
            onPress={() => navigation.navigate(UnauthenticatedScreenEnum.LogIn)}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(UnauthenticatedScreenEnum.Registration)}>
          <Text style={styles.registerText}>
            Noch kein Konto? <Text style={styles.registerLink}>Jetzt registrieren</Text>
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            marginTop: 32,
            fontSize: 12,
            color: 'white',
            opacity: 0.3,
            textAlign: 'center',
          }}
        >
          Version: {Constants.default?.expoConfig?.version || '0.0.0'}
        </Text>

        {/* Privacy Policy & Terms Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 24 }}>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={{ color: 'white', textDecorationLine: 'underline', fontSize: 13 }}>
              Datenschutzerklärung
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={{ color: 'white', textDecorationLine: 'underline', fontSize: 13 }}>
              Nutzungsbedingungen
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
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
