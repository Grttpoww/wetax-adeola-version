import * as React from 'react'
import styled, { useTheme } from 'styled-components'
import { Text, TouchableOpacity, View } from 'react-native'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { getThemeContext, Theme } from '../theme/theme'
import { createGetStyle } from './helpers'

export type Props = {
  label: string
  sublabel?: string
  value: boolean | null | undefined
  style?: Partial<Theme['checkbox']>
  onChange: (value: boolean) => void
}

export const Checkbox = (props: Props) => {
  const theme = useTheme()
  // const appTheme = React.useContext(getThemeContext())
  // const getStyle = createGetStyle(appTheme, 'checkbox')(props.style)

  // const dynamicStyle = createGetStyle(
  //   appTheme,
  //   props.value ? 'checkboxActive' : 'checkboxInactive',
  // )(props.style)

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
        alignItems: 'center',
      }}
      onPress={() => props.onChange(!props.value)}
    >
      <View
        style={{
          height: 25,
          width: 25,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.BORDER_GRAY,
          backgroundColor: theme.colors.BACKGROUND,
          borderRadius: 5,
        }}
      >
        {props.value ? <FontAwesome5 name="check" size={16} color={theme.colors.GREEN} /> : null}
      </View>
      <View style={{ flex: 1, gap: 8, paddingLeft: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            opacity: 0.6,
          }}
        >
          {props.label}
        </Text>
        {props.sublabel && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '400',
              opacity: 0.7,
            }}
          >
            {props.sublabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
