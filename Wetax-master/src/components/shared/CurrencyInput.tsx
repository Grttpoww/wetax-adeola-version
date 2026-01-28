import { useState } from 'react'
import { View } from 'react-native'
import _CurrencyInput from 'react-native-currency-input'
import { useTheme } from 'styled-components'
import { Props as InputProps } from './Input'
import { InputWrapper } from './InputWrapper'

export type Props = Omit<InputProps, 'value' | 'onChange'> & {
  value: number | null | undefined
  onChange: (val: number) => void
}

export const CurrencyInput = (props: Props) => {
  const { colors } = useTheme()

  const [value, setValue] = useState<null | number>(props.value || 0)

  return (
    <InputWrapper {...props}>
      <View
        style={{
          backgroundColor: colors.ITEM_CONTAINER,
          height: 56,
          borderWidth: 1,
          borderColor: colors.BORDER_GRAY,
          borderRadius: 10,
          width: '100%',
        }}
      >
        <_CurrencyInput
          value={value}
          onChangeValue={(v) => {
            setValue(v)
            props.onChange(v || 0)
          }}
          onFocus={() => {
            if (value === 0) {
              setValue(null)
            }
          }}
          prefix="CHF "
          delimiter="'"
          separator=","
          precision={0}
          minValue={0}
          style={{
            height: 56,
            width: '100%',
            paddingLeft: 16,
            fontFamily: 'Poppins500',
            fontSize: 18,
            fontWeight: '600',
            color: value === 0 ? '#8a8a8a' : colors.TEXT,
          }}
          onChangeText={(formattedValue) => {}}
        />
      </View>
    </InputWrapper>
  )
}
