import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthenticatedNavigatorEnum } from './enums'
import { TaxReturnNavigator } from './taxReturn/scaffold/TaxReturnNavigator'
import { UserNavigator } from './user/User.navigator'
import { useEffect, useState } from 'react'
import { useOptionalTaxReturn } from '../../context/TaxReturn.context'
import { useOptionalUser } from '../../context/User.context'
import { Navigator } from '../../shared/constants'

const AuthStack = createNativeStackNavigator()

export const AuthenticatedNavigator = ({ navigation }: any) => {
  const { user } = useOptionalUser()
  const { taxReturn } = useOptionalTaxReturn()

  const [initialRoute, setInitialRoute] = useState<AuthenticatedNavigatorEnum>()

  useEffect(() => {
    if (taxReturn) {
      setInitialRoute(AuthenticatedNavigatorEnum.TaxReturn)
    } else {
      setInitialRoute(AuthenticatedNavigatorEnum.User)
    }
  }, [taxReturn])

  useEffect(() => {
    if (!user) {
      navigation.navigate(Navigator.Unauthenticated)
    }
  }, [user])

  // Don’t render navigator until we know the initial route + user is available
  if (!initialRoute || !user) {
    return <></>
  }

  return (
    <AuthStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        gestureEnabled: true,
      }}
    >
      <AuthStack.Screen
        key={AuthenticatedNavigatorEnum.User}
        name={AuthenticatedNavigatorEnum.User}
        options={{ headerShown: false }}
        component={UserNavigator}
      />
      <AuthStack.Screen
        key={AuthenticatedNavigatorEnum.TaxReturn}
        name={AuthenticatedNavigatorEnum.TaxReturn}
        options={{ headerShown: false }}
        component={TaxReturnNavigator}
      />
    </AuthStack.Navigator>
  )
}
