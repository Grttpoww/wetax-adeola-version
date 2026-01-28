import * as React from 'react'
import { Switch, Text, View } from 'react-native'
import styled from 'styled-components'
import { Theme, getThemeContext } from '../theme/theme'
import { createGetStyle } from './helpers'

const SwitchItem = styled(View)`
  flex-direction: row;
  align-items: center;
`

const SwitchLabel = styled(Text)``

const SwitchLink = styled(Text)``

export type Props = {
  onChange: (v: boolean) => void
  value: boolean
  linkText: string
  labelText: string
  onLinkPress: () => void
  style?: Partial<Theme['linkSwitch']>
}

export const LinkSwitchInput = (props: Props) => {
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'linkSwitch')(props.style)

  return (
    <SwitchItem style={getStyle('wrapper')}>
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        style={getStyle('switch')}
      />
      <SwitchLabel style={getStyle('label')}>{props.labelText}</SwitchLabel>
      <SwitchLink
        style={getStyle('linkText')}
        onPress={() => {
          props.onLinkPress()
        }}
      >
        {props.linkText}
      </SwitchLink>
    </SwitchItem>
  )
}
