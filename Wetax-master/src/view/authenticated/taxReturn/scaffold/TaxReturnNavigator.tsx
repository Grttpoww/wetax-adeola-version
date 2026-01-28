import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ReactNode, useEffect } from 'react'
import { useOptionalTaxReturn } from '../../../../context/TaxReturn.context'
import { UserScreenEnum } from '../../user/enums'
import { TaxReturnOverview } from '../TaxReturnOverview'
import { TaxReturnScreen } from '../enums'
import { ScreenTemplateDelegator } from './ScreenTemplateDelegator'
import { TouchableOpacity } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useTheme } from 'styled-components'

const TaxReturnStack = createNativeStackNavigator()

const _AuthenticatedNavigator = ({ navigation, taxReturn }: any) => {
  const theme = useTheme()

  return (
    <TaxReturnStack.Navigator initialRouteName={TaxReturnScreen.Overview}>
      <TaxReturnStack.Screen
        options={{
          title: taxReturn?.year?.toString() || '2024',

          headerStyle: {
            backgroundColor: theme.colors.BACKGROUND,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('User', { screen: UserScreenEnum.UserOverview })
              }}
            >
              <AntDesign name="left" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
        name={TaxReturnScreen.Overview}
        component={TaxReturnOverview}
      />
      <TaxReturnStack.Screen
        options={{
          headerShown: false,
        }}
        name={TaxReturnScreen.Flow}
        component={ScreenTemplateDelegator}
      />
    </TaxReturnStack.Navigator>
  )
}

export const TaxReturnNavigator = ({ navigation }: any): ReactNode => {
  const { taxReturn } = useOptionalTaxReturn()

  useEffect(() => {
    if (!taxReturn) {
      navigation.navigate('User', { screen: UserScreenEnum.UserOverview })
    }
  }, [taxReturn])

  if (!taxReturn) {
    return <></>
  }

  return <_AuthenticatedNavigator navigation={navigation} taxReturn={taxReturn} />
}
