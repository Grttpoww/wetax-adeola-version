import * as React from 'react'
// import { getThemeContext } from './theme'
// import { createStackNavigator } from '@react-navigation/stack'

import { getThemeContext } from './theme'

export type CreateNavigatorProps = {
  initialRoute: string
  routes: Array<{
    comp: React.ComponentType<any>
    name: string
    title?: string
    headerStyle?: (params: { navigation: any }) => any
  }>
}

export const createNavigator =
  (props: CreateNavigatorProps, createStackNavigator: any, navigatorProps?: any) => () => {
    const theme = React.useContext(getThemeContext())
    const headerStyle = theme.headerStyle
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={props.initialRoute} {...(navigatorProps || {})}>
        {props.routes.map((r, i) => {
          return (
            <Stack.Screen
              key={i}
              name={r.name as string}
              component={r.comp}
              options={({ navigation }: any) => {
                return {
                  title: r.title || '',
                  ...headerStyle,
                  ...(r.headerStyle ? r.headerStyle({ navigation }) : {}),
                }
              }}
            />
          )
        })}
      </Stack.Navigator>
    )
  }
