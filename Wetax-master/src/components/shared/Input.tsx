import React, { useMemo } from 'react'
import { TextInput, TextInputProps, View } from 'react-native'
import styled from 'styled-components'
import { Theme, getThemeContext } from '../theme/theme'
import { createGetStyle } from './helpers'
import { InputWrapper } from './InputWrapper'

const InputComponent = styled(TextInput)`
  font-family: System;
  text-align: left;
  height: 100%;
  flex: 1;
`

const Background = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

export type Props = {
  label?: string

  disabled?: boolean
  value: string | null | undefined
  onChange?: (val: string) => void
  onBlur?: (val: string) => void
  onFocusFormat?: (val: string) => string
  description?: string
  style?: Partial<Theme['input']>
  inputProps?: Partial<TextInputProps>
  children?: React.ReactNode
}

export const Input = (props: Props) => {
  const theme = React.useContext(getThemeContext())

  const [internalValue, setInternalValue] = React.useState(props.value || '')

  React.useEffect(() => {
    setInternalValue(props.value || '')
  }, [props.value])

  const styles = useMemo(() => {
    const getStyle = createGetStyle(theme, 'input')(props.style)

    return {
      background: getStyle('background'),
      input: getStyle('input'),
    }
  }, [theme, props.style])

  return (
    <InputWrapper {...props}>
      <TextInput
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          {
            fontFamily: 'System',
            textAlign: 'left',
            height: '100%',
            flex: 1,
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: '#adadad',
          },
        ]}
        onChangeText={(text) => {
          setInternalValue(text)

          if (props.onChange) {
            props.onChange(text)
          }
        }}
        onBlur={() => {
          if (props.onBlur) {
            props.onBlur(internalValue)
          }
        }}
        placeholderTextColor="#8a8a8a"
        onFocus={() => {
          if (props.onFocusFormat) {
            setInternalValue(props.onFocusFormat(internalValue))
          }
        }}
        editable={!props.disabled}
        value={internalValue}
        {...(props.inputProps || {})}
      />
    </InputWrapper>

    // <InputWrapper {...props}>
    //   <>
    //     <Background style={styles.background} />
    //     {props.children}
    //     <InputComponent
    //       autoCapitalize="none"
    //       underlineColorAndroid="transparent"
    //       style={[styles.input]}
    //       onChangeText={(text) => {
    //         setInternalValue(text)

    //         if (props.onChange) {
    //           props.onChange(text)
    //         }
    //       }}
    //       onBlur={() => {
    //         if (props.onBlur) {
    //           props.onBlur(internalValue)
    //         }
    //       }}
    //       placeholderTextColor="#8a8a8a"
    //       onFocus={() => {
    //         if (props.onFocusFormat) {
    //           setInternalValue(props.onFocusFormat(internalValue))
    //         }
    //       }}
    //       editable={!props.disabled}
    //       value={internalValue}
    //       {...(props.inputProps || {})}
    //     />
    //   </>
    // </InputWrapper>
  )
}
