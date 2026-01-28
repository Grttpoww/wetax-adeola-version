import { Input, Props as InputProps } from './Input'

export type Props = Omit<InputProps, 'value' | 'onChange'> & {
  value: number | null | undefined
  onChange: (val: number) => void
  formatter?: (val: number | null | undefined) => string
}

export const NumberInput = (props: Props) => {
  return (
    <Input
      {...props}
      value={props.formatter ? props.formatter(props.value) : `${props.value || 0}`}
      onFocusFormat={(v) => (v === '0' ? '' : `${v || 0}`)}
      onChange={(v) => {
        const num = Number(v)

        if (isNaN(num)) {
          props.onChange(0)
        } else {
          props.onChange(num)
        }
      }}
    />
  )
}
