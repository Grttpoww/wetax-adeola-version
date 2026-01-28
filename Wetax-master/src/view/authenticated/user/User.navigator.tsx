import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { UserScreenEnum } from './enums'
import { UserOverview } from './screens/UserOverview.screen'
import { UserProfile } from './screens/UserProfile.screen'
import { useTheme } from 'styled-components'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { StatusBar, TouchableOpacity } from 'react-native'
import SubscriptionScreen from './screens/SubscriptionScreen'

const UserStack = createNativeStackNavigator()

export const UserNavigator = ({ navigation }: any) => {
  const theme = useTheme()

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <UserStack.Navigator
        initialRouteName={UserScreenEnum.UserOverview}
        screenOptions={{
          gestureEnabled: true,
        }}
      >
        <UserStack.Screen
          key={UserScreenEnum.UserOverview}
          name={UserScreenEnum.UserOverview}
          options={{
            title: 'Übersicht',
            headerRight: () => (
              <TouchableOpacity
                style={{
                  marginRight: 8,
                }}
                onPress={() => {
                  navigation.navigate('User', { screen: UserScreenEnum.UserProfile })
                }}
              >
                <Ionicons name="person" size={20} color={'black'} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: theme.colors.BACKGROUND,
            },
          }}
          component={UserOverview}
        />

        <UserStack.Screen
          key={UserScreenEnum.UserProfile}
          name={UserScreenEnum.UserProfile}
          options={{
            title: 'Profil',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('User', {screen: UserScreenEnum.UserOverview})
                }}
              >
                <AntDesign name="left" size={24} color={'black'} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: theme.colors.BACKGROUND,
            },
          }}
          component={UserProfile}
        />
        <UserStack.Screen
          key={'SubscriptionScreen'}
          name={'SubscriptionScreen'}
          options={{
            title: 'Subscription',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack()
                }}
              >
                <AntDesign name="left" size={22} color={'black'} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: '#fff',
            },
          }}
          component={SubscriptionScreen}
        />
      </UserStack.Navigator>
    </>
  )
}
