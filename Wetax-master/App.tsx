import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import * as Updates from 'expo-updates'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { ThemeProvider, useTheme } from 'styled-components'
import { getTheme } from './src/components/theme'
import { TaxReturnProvider } from './src/context/TaxReturn.context'
import { UserProvider, useOptionalUser } from './src/context/User.context'
import { ColorSchemes } from './src/shared/colors'
import { Navigator } from './src/shared/constants'
import { AuthenticatedNavigator } from './src/view/authenticated/Authenticated.navigator'
import { configureAppThemeContext } from './src/view/theme'
import { UnauthenticatedNavigator } from './src/view/unauthenticated/Unauthenticated.navigator'
import React from 'react'
import { initializeApp } from '@react-native-firebase/app'
// needs OPENAPI configuration
import './src/openapi'
import { SafeLoading } from './src/components/configured/SafeLoading'
import { toastConfig } from './src/components/CustomToast'

// Simple ErrorBoundary class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; FallbackComponent: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; FallbackComponent: React.ComponentType<any> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <this.props.FallbackComponent />
    }

    return this.props.children
  }
}

// Replace the below config with your actual Firebase config

SplashScreen.preventAutoHideAsync()

const AppStack = createNativeStackNavigator()

const queryClient = new QueryClient()

const NavigationDelegator = () => {
  const { user } = useOptionalUser()
  const theme = useTheme()
  const [initialRoute, setInitialRoute] = useState<Navigator | undefined>(undefined)

  useEffect(() => {
    if (user) {
      setInitialRoute(Navigator.Authenticated)
    } else {
      setInitialRoute(Navigator.Unauthenticated)
    }
  }, [])

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: true,
      colors: {
        ...DefaultTheme.colors,
        background: theme.colors.BACKGROUND,
        primary: 'white',
      },
    }),
    [theme],
  )

  return (
    <NavigationContainer fallback={<View />} theme={navigationTheme}>
      <AppStack.Navigator initialRouteName={initialRoute}>
        <AppStack.Screen
          name={Navigator.Authenticated}
          component={AuthenticatedNavigator}
          options={{
            headerShown: false,
          }}
        />
        {!user && (
          <AppStack.Screen
            name={Navigator.Unauthenticated}
            component={UnauthenticatedNavigator}
            options={{
              headerShown: false,
            }}
          />
        )}
      </AppStack.Navigator>
    </NavigationContainer>
  )
}

const NavigatorProvider = () => {
  const [updatesChecked, setUpdatesChecked] = useState(true)

  const colorScheme = 'light'
  const ThemeContext = configureAppThemeContext(ColorSchemes[colorScheme])

  // async function onFetchUpdateAsync() {
  //   try {
  //     if (Updates.isEnabled) {
  //       const update = await Updates.checkForUpdateAsync()

  //       if (update.isAvailable) {
  //         await Updates.fetchUpdateAsync()
  //         await Updates.reloadAsync()
  //       } else {
  //         setUpdatesChecked(true)
  //       }
  //     }
  //   } catch (error) {
  //     setUpdatesChecked(true)
  //     // You can also add an alert() to see the error message in case of an error when fetching updates.
  //     alert(`Error fetching latest Expo update: ${error}`)
  //   }
  // }

  // useEffect(() => {
  //   onFetchUpdateAsync().then((v) => {})
  // }, [])

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync()
  }, [])

  if (!updatesChecked) {
    return <SafeLoading />
  }

  return (
    <>
      <View
        onLayout={onLayoutRootView}
        style={{
          width: '100%',
          flex: 1,
        }}
      >
        <ThemeProvider
          theme={{
            colors: ColorSchemes[colorScheme],
          }}
        >
          <ThemeContext.Provider value={getTheme()}>
            <UserProvider>
              <TaxReturnProvider>
                <NavigationDelegator />
              </TaxReturnProvider>
            </UserProvider>
          </ThemeContext.Provider>
        </ThemeProvider>
      </View>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={() => <SafeLoading showError />}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigatorProvider />
          <Toast config={toastConfig} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
