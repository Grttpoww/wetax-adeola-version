import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import styled from 'styled-components'
import { Theme, getThemeContext } from '../theme/theme'
import { createGetStyle } from './helpers'

const Container = styled(View)`
  flex-direction: column;
  width: 100%;
`

const Label = styled(Text)``

const Description = styled(Text)`
  width: 100%;
`

const Wrapper = styled(View)`
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
`

export const InputWrapper = (props: {
  label?: string
  description?: string
  style?: Partial<Theme['input']>
  children: ReactNode
}) => {
  const { label, description, style } = props

  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'input')(props.style)

  return (
    <Container style={getStyle('wrapper')}>
      {label ? <Label style={getStyle('label')}>{label}</Label> : null}
      {description ? <Description style={getStyle('description')}>{description}</Description> : null}
      <Wrapper style={getStyle('inputWrapper')}>{props.children}</Wrapper>
    </Container>
  )
}
