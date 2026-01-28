import { Select, Props as SelectProps } from './Select'

export type Props = {
  onChange: (v: number) => void
  value: number | null | undefined
  items: Array<{ label: string; value: number }>
} & Omit<SelectProps, 'value' | 'onChange' | 'items'>

export const NumberSelect = (props: Props) => {
  const { value, onChange, items, ...rest } = props

  return (
    <Select
      onChange={(v) => props.onChange(Number(v))}
      value={`${props.value || 0}`}
      items={items.map((t) => ({
        label: t.label,
        value: `${t.value}`,
      }))}
      {...rest}
    />
  )
}
