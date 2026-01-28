import * as React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import styled from 'styled-components'
import { ButtonStyle, getThemeContext } from '../theme/theme'
import { createGetStyle } from './helpers'
import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'

const TouchableOpacityButton = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 8px;
`

const Label = styled(Text)``

export enum ButtonType {
  Dark = 'Dark',
  Light = 'Light',
  ChromelessDark = 'ChromelessDark',
  ChromelessLight = 'ChromelessLight',
}

const mapTypeToStyleKey: {
  [k in ButtonType]: 'darkButton' | 'lightButton' | 'darkChromelessButton' | 'lightChromelessButton'
} = {
  [ButtonType.Dark]: 'darkButton',
  [ButtonType.Light]: 'lightButton',
  [ButtonType.ChromelessDark]: 'darkChromelessButton',
  [ButtonType.ChromelessLight]: 'lightChromelessButton',
}

export type Props = {
  disabled?: boolean
  width?: number
  label?: string
  type?: ButtonType
  onPress: () => void
  isLoading?: boolean
  style?: Partial<ButtonStyle>
  otherProps?: Partial<TouchableOpacityProps>
  useGestureHandler?: boolean
  hasCheckmark?: boolean
}

export const Button = (props: Props) => {
  const theme = React.useContext(getThemeContext())
  const getCommonStyle = createGetStyle(theme, 'commonButton')({})
  const getStyle = createGetStyle(theme, mapTypeToStyleKey[props.type || ButtonType.Light])(props.style)

  let Element = TouchableOpacityButton

  return (
    <Element
      disabled={props.disabled}
      onPress={props.onPress}
      style={[
        ...getCommonStyle('background'),
        ...getStyle('background'),
        {
          opacity: props.disabled ? 0.7 : 1,
        },
      ]}
      {...(props.otherProps || {})}
    >
      {props.isLoading ? null : (
        <Label
          style={[
            ...getCommonStyle('label'),
            ...getStyle('label'),
            {
              opacity: props.disabled ? 0.7 : 1,
            },
          ]}
        >
          {props.label}
        </Label>
      )}
      {props.hasCheckmark && <Ionicons name="checkmark-circle" size={24} color="#06ba18" />}
      {props.isLoading ? (
        <ActivityIndicator
          size="small"
          color="white"
          style={[...getCommonStyle('loadingIcon'), ...getStyle('loadingIcon')]}
        />
      ) : null}
    </Element>
  )
}
