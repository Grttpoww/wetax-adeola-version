import { AntDesign } from '@expo/vector-icons'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { StatusBar, TouchableOpacity } from 'react-native'
import { useTheme } from 'styled-components'
import { useOptionalUser } from '../../context/User.context'
import { Navigator } from '../../shared/constants'
import { UnauthenticatedScreenEnum } from './enums'
import { Landing } from './screens/Landing'
import { LogIn } from './screens/LogIn'
import { Registration } from './screens/Registration'
import { SubmitCode } from './screens/SubmitCode'
import { Configuration } from './screens/Configuration'
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen'
import TermsOfServiceScreen from './screens/TermsOfServiceScreen'

const UnauthStack = createNativeStackNavigator()

export const UnauthenticatedNavigator = ({ navigation }: any) => {
  const { user } = useOptionalUser()
  const theme = useTheme()

  useEffect(() => {
    if (user) {
      navigation.navigate(Navigator.Authenticated)
    }
  }, [user])

  return (
    <>
      <UnauthStack.Navigator initialRouteName={UnauthenticatedScreenEnum.Landing}>
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.Landing}
          options={({ navigation }) => ({
            headerShown: false,
          })}
          component={Landing}
        />
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.Registration}
          options={{
            title: '',
            headerStyle: {
              backgroundColor: theme.colors.PRIMARY,
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Navigator.Unauthenticated, {
                    screen: UnauthenticatedScreenEnum.Landing,
                  })
                }}
              >
                <AntDesign name="left" size={24} color={'#fff'} />
              </TouchableOpacity>
            ),
          }}
          component={Registration}
        />
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.LogIn}
          options={{
            title: '',
            headerStyle: {
              backgroundColor: theme.colors.PRIMARY,
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Navigator.Unauthenticated, {
                    screen: UnauthenticatedScreenEnum.Landing,
                  })
                }}
              >
                <AntDesign name="left" size={24} color={'#fff'} />
              </TouchableOpacity>
            ),
          }}
          component={LogIn}
        />
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.Configuration}
          options={{
            title: '',
            headerStyle: {
              // backgroundColor: theme.colors.BACKGROUND,
              backgroundColor: theme.colors.PRIMARY,
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(UnauthenticatedScreenEnum.Landing)
                }}
              >
                <AntDesign name="left" size={24} color={'#fff'} />
              </TouchableOpacity>
            ),
          }}
          component={Configuration}
        />
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.SubmitCode}
          options={{
            title: '',
            headerStyle: {
              backgroundColor: theme.colors.PRIMARY,
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Navigator.Unauthenticated, {
                    screen: UnauthenticatedScreenEnum.Landing,
                  })
                }}
              >
                <AntDesign name="close" size={24} color={'#fff'} />
              </TouchableOpacity>
            ),
          }}
          component={SubmitCode}
        />
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.PrivacyPolicy}
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
        <UnauthStack.Screen
          name={UnauthenticatedScreenEnum.TermsOfService}
          component={TermsOfServiceScreen}
          options={{ headerShown: false }}
        />
      </UnauthStack.Navigator>
    </>
  )
}
