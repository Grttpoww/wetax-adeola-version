import * as React from 'react'
import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components'
import { TouchableOpacity } from 'react-native'
import { getThemeContext, Theme } from '../theme/theme'
import { createGetStyle } from './helpers'

const IconButtonWrapper = styled(TouchableOpacity)<{ disabled?: boolean }>`
  padding: 0 16px;
  opacity: ${(props) => (props.disabled ? 0.3 : 1)};
  align-items: center;
  justify-content: center;
`

type Props = {
  onPress: () => void
  name: string
  disabled?: boolean
  size?: number
  color?: string
  style?: Partial<Theme['iconButton']>
}

export const IconButton: React.FC<Props> = (props: Props) => {
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'iconButton')(props.style)
  return (
    <IconButtonWrapper
      onPress={!props.disabled ? props.onPress : undefined}
      style={getStyle('wrapper')}
    >
      <Ionicons
        name={props.name as any}
        style={getStyle('icon')}
        size={props.size || 32}
        color={props.color || 'white'}
      />
    </IconButtonWrapper>
  )
}
