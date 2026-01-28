import React, { ReactNode } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import styled from 'styled-components'
import { Theme, getThemeContext } from '../theme/theme'
import { createGetStyle } from './helpers'

const HeaderWrapper = styled(View)`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
`

const HeaderTitle = styled(Text)``

const LeftContainerStyle = styled(TouchableOpacity)``

const RightContainerStyle = styled(TouchableOpacity)``

type Props = {
  title: string
  style?: Partial<Theme['headerStyle']>
  left?: {
    onPress: () => void
    icon: ReactNode
  }
  right?: {
    onPress: () => void
    icon: ReactNode
  }
}

export const Header = (props: Props) => {
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'headerStyle')(props.style)

  return (
    <HeaderWrapper style={getStyle('headerStyle')}>
      {props.left && (
        <LeftContainerStyle style={getStyle('headerLeftContainerStyle')} onPress={props.left.onPress}>
          {props.left.icon}
        </LeftContainerStyle>
      )}
      <HeaderTitle style={getStyle('headerTitleStyle')}>{props.title}</HeaderTitle>
      {props.right && (
        <RightContainerStyle style={getStyle('headerRightContainerStyle')} onPress={props.right.onPress}>
          {props.right.icon}
        </RightContainerStyle>
      )}
    </HeaderWrapper>
  )
}
