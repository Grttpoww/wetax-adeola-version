import * as React from 'react'
import styled from 'styled-components'
import { Entypo } from '@expo/vector-icons'
import { View, TouchableOpacity } from 'react-native'
import { getThemeContext, Theme } from '../theme/theme'
import { createGetStyle } from './helpers'

const AddButton = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  bottom: 20px;
  right: 12px;
  z-index: 100;
`

const AddButtonInner = styled(View)`
  align-items: center;
  justify-content: center;
`

type Props = {
  onPress: () => void
  color: string
  iconColor: string
  size: number
  style?: Partial<Theme['floatingButton']>
}

export const FloatingButton = (props: Props) => {
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'floatingButton')(props.style)
  return (
    <AddButton
      style={[
        {
          shadowOffset: { width: 2, height: 2 },
          shadowColor: 'black',
          shadowOpacity: 0.3,
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
        },
        getStyle('outerWrapper'),
      ]}
      onPress={props.onPress}
    >
      <AddButtonInner
        style={[
          {
            backgroundColor: props.color,
            width: props.size - 16,
            height: props.size - 16,
            borderRadius: (props.size - 16) / 2,
          },
          getStyle('innerWrapper'),
        ]}
      >
        <Entypo
          name="plus"
          size={24}
          color={props.iconColor}
          style={getStyle('icon')}
        />
      </AddButtonInner>
    </AddButton>
  )
}
