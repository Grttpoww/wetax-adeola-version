import * as React from 'react'
import { Lens } from 'monocle-ts'
import {
  View,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
  KeyboardAvoidingView,
  Keyboard,
  KeyboardAvoidingViewProps,
} from 'react-native'
import styled, { useTheme } from 'styled-components'
import { Input, Props as InputProps } from '../shared/Input'
import { Theme, getThemeContext } from '../theme/theme'
import { createGetStyle, squashStyles } from '../shared/helpers'
import { FormFieldType } from './form.types'
import { someFormFields } from './some.form'

// Inputs
import { Props as NumberInputProps, NumberInput } from '../shared/NumberInput'
import { Props as ButtonProps, Button } from '../shared/Button'
import { Props as SelectProps, Select } from '../shared/Select'
import { Props as DatePickerProps, DatePicker } from '../shared/DatePicker'
import { Props as LinkSwitchInputProps, LinkSwitchInput } from '../shared/LinkSwitchInput'
import { Checkbox, Props as CheckboxProps } from '../shared/Checkbox'
import { CurrencyInput } from '../shared/CurrencyInput'
import { NumberSelect, Props as NumberSelectProps } from '../shared/NumberSelect'

type FormInput<P extends {}, L, T> = Omit<P, 'onChange' | 'value' | 'error'> & {
  lens: L
  type: T
}

export type DatePickerField<FormData> = FormInput<
  DatePickerProps,
  Lens<FormData, string | null> | Lens<FormData, string | undefined> | Lens<FormData, string>,
  FormFieldType.DatePicker
>

export type CurrencyInputField<FormData> = FormInput<
  NumberInputProps,
  Lens<FormData, number | null> | Lens<FormData, number | undefined> | Lens<FormData, number>,
  FormFieldType.CurrencyInput
>

export type NumberInputField<FormData> = FormInput<
  NumberInputProps,
  Lens<FormData, number | null> | Lens<FormData, number | undefined> | Lens<FormData, number>,
  FormFieldType.NumberInput
>

export type CheckboxField<FormData> = FormInput<
  CheckboxProps,
  Lens<FormData, boolean | undefined> | Lens<FormData, boolean>,
  FormFieldType.Checkbox
>

export type TextInputField<FormData> = FormInput<
  InputProps,
  Lens<FormData, string | null> | Lens<FormData, string | undefined> | Lens<FormData, string>,
  FormFieldType.TextInput
>

export type SelectInputField<FormData> = FormInput<
  SelectProps,
  Lens<FormData, string> | Lens<FormData, undefined | string>,
  FormFieldType.SelectInput
>

export type NumberSelectInputField<FormData> = FormInput<
  NumberSelectProps,
  Lens<FormData, number> | Lens<FormData, undefined | number>,
  FormFieldType.NumberSelectInput
>

export type LinkSwitchInputField<FormData> = FormInput<
  LinkSwitchInputProps,
  Lens<FormData, boolean>,
  FormFieldType.LinkSwitchInput
>

type CommonFieldProps<FormData> = {
  isVisible?: (formData: FormData) => boolean
  hide?: boolean
  isDisabled?: boolean
  validate?: (formData: FormData) => boolean
  maxwidth?: number
  required?: boolean
  style?: StyleProp<ViewStyle>
}

export type SingleFormField<FormData> = (
  | DatePickerField<FormData>
  | TextInputField<FormData>
  | CurrencyInputField<FormData>
  | SelectInputField<FormData>
  | LinkSwitchInputField<FormData>
  | NumberInputField<FormData>
  | CheckboxField<FormData>
  | NumberSelectInputField<FormData>
) &
  CommonFieldProps<FormData>

export type FormFieldRow<FormData> = Array<SingleFormField<FormData>>

export type Fields<FormData> = Array<SingleFormField<FormData> | FormFieldRow<FormData>>

export type SingleFieldOrRow<FormData> = SingleFormField<FormData> | FormFieldRow<FormData>

export type GroupFields<FormData> = Array<SingleFieldOrRow<FormData>>

export type FormFieldGroup<FormData> = {
  title: string
  style?: {
    title: StyleProp<TextStyle>
    wrapper: StyleProp<ViewStyle>
  }
  type: FormFieldType.FormFieldGroup
  fields: GroupFields<FormData>
}

export type FormFields<T> = Array<FormField<T>>

export type FormField<FormData> =
  | SingleFormField<FormData>
  | FormFieldRow<FormData>
  | FormFieldGroup<FormData>
  | FormSection<FormData>

export type SectionField<FormData> =
  | SingleFormField<FormData>
  | FormFieldRow<FormData>
  | FormFieldGroup<FormData>

export type SectionFields<FormData> = Array<SectionField<FormData>>

export type FormSection<FormData> = {
  title?: string
  description?: string
  style?: {
    title: StyleProp<TextStyle>
    wrapper: StyleProp<ViewStyle>
  }
  type: FormFieldType.FormSection
  fields: SectionFields<FormData>
}

const ButtonContainer = styled(View)``

const FormWrapper = styled(View)``

export const FormContent = styled(View)``

export const FormFieldRowWrapper = styled(View)``

export const FormFieldWrapper = styled(View)``

export const FormFieldGroupWrapper = styled(View)``

export const FormFieldGroupTitle = styled(Text)``

export const FormSectionWrapper = styled(View)``

export const FormSectionTitle = styled(Text)``

type Props<FormData> = {
  formFields: FormFields<FormData>
  children?: React.ReactNode
  style?: Partial<Theme['form']>
  data: FormData
  setError: (v: string) => void
  onSubmit?: () => void
  onInvalidSubmit?: () => void
  extraBottomHeight?: number
  onChange: (formState: FormData) => void
  buttonProps?: Omit<ButtonProps, 'onPress'>
  keyboardAvoidingView?: Partial<KeyboardAvoidingViewProps>
  disableKeyboardAvoidingView?: boolean
  errorString?: string
}

export const Form = <FormData,>(props: Props<FormData>) => {
  const styledTheme = useTheme()
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'form')(props.style)

  const [showValidation, setShowValidation] = React.useState(false)

  React.useEffect(() => {
    setShowValidation(false)
  }, [props.formFields])

  const submit = () => {
    let invalidString = ''

    const isFieldInvalid = (f: SingleFormField<FormData>): boolean => {
      if ('validate' in f && f.validate !== undefined) {
        const res = f.validate(props.data)
        invalidString = `Invalid value for: ${'label' in f ? f.label : ''}`
        return res
      }
      if ('required' in f && f.required) {
        let val = f.lens.get(props.data)
        val = typeof val === 'string' ? val.trim() : val
        let isInvalid = val === '' || val === null || val === undefined

        // if (
        //   f.type === FormFieldType.NumberInput &&
        //   'min' in f &&
        //   f.min !== undefined &&
        //   f.min > 0
        // ) {
        //   isInvalid = val < f.min
        // }

        invalidString = `Missing value for: ${'label' in f ? f.label : ''}`
        return isInvalid
      }
      return false
    }

    const isNotValid = someFormFields<any>(props.formFields, isFieldInvalid)

    if (isNotValid) {
      props.setError(invalidString || 'An error has occurred.')
      setShowValidation(true)
      if (props.onInvalidSubmit) {
        props.onInvalidSubmit()
      }
    } else if (typeof props.onSubmit === 'function') {
      props.onSubmit()
    }
  }

  const renderFormFieldInput = (field: SingleFormField<FormData>): React.ReactNode => {
    const { data, onChange } = props

    if (field.type === FormFieldType.TextInput) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <Input
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.SelectInput) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <Select
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.NumberInput) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <NumberInput
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.NumberSelectInput) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <NumberSelect
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.CurrencyInput) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <CurrencyInput
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.Checkbox) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <Checkbox
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.DatePicker) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <DatePicker
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    if (field.type === FormFieldType.LinkSwitchInput) {
      const { type, lens, validate, ...fieldProps } = field
      return (
        <LinkSwitchInput
          {...fieldProps}
          value={lens.get(data)}
          onChange={(value) => onChange(lens.set(value)(data))}
        />
      )
    }

    return <View />
  }

  const renderFormFieldItem = (field: SingleFormField<FormData>, key: number) =>
    field.hide ? undefined : (
      <FormFieldWrapper key={key} style={squashStyles([...getStyle('inputWrapper'), field.style || {}])}>
        {renderFormFieldInput(field)}
      </FormFieldWrapper>
    )

  const renderFormFieldRow = (formFieldRow: FormFieldRow<FormData>, key: number) => (
    <FormFieldRowWrapper key={key} style={getStyle('rowWrapper')}>
      {formFieldRow.map(renderFormFieldItem)}
    </FormFieldRowWrapper>
  )

  const renderFormField = (
    formField: FormFieldRow<FormData> | SingleFormField<FormData>,
    key: number,
  ) => {
    if (Array.isArray(formField)) {
      return renderFormFieldRow(formField, key)
    } else {
      return formField.hide ? undefined : (
        <FormFieldRowWrapper style={getStyle('rowWrapper')} key={key}>
          {renderFormFieldItem(formField, key)}
        </FormFieldRowWrapper>
      )
    }
  }

  const renderFormSectionItem = (formField: SectionField<FormData>, key: number) => {
    if (!Array.isArray(formField) && formField.type === FormFieldType.FormFieldGroup) {
      return renderFormGroup(formField, key)
    } else {
      return renderFormField(formField, key)
    }
  }

  const renderFormGroup = (formGroup: FormFieldGroup<FormData>, key: number) => (
    <FormFieldGroupWrapper key={key} style={getStyle('groupWrapper')}>
      <FormFieldGroupTitle style={getStyle('groupTitle')}>{formGroup.title}</FormFieldGroupTitle>
      {formGroup.fields.map(renderFormField)}
    </FormFieldGroupWrapper>
  )

  const renderFormSection = (formSection: FormSection<FormData>, key: number) => (
    <FormSectionWrapper key={key} style={getStyle('sectionWrapper')}>
      <FormSectionTitle style={getStyle('sectionTitle')}>{formSection.title}</FormSectionTitle>
      <Text
        style={{
          fontSize: 14,
          opacity: 0.7,
          marginBottom: 24,
        }}
      >
        {formSection.description}
      </Text>
      {formSection.fields.map(renderFormSectionItem)}
    </FormSectionWrapper>
  )

  const { formFields } = props

  const renderContent = () => {
    return (
      <>
        <FormWrapper style={getStyle('wrapper')}>
          {formFields.map((f: any, key: any) => {
            if (Array.isArray(f)) {
              return renderFormFieldRow(f, key)
            } else if (f.type === FormFieldType.FormFieldGroup) {
              return renderFormGroup(f, key)
            } else if (f.type === FormFieldType.FormSection) {
              return renderFormSection(f, key)
            } else {
              return renderFormField(f, key)
            }
          })}
        </FormWrapper>
        {props.errorString && (
          <View style={{ padding: 16, borderRadius: 2, backgroundColor: '#fccac2' }}>
            <Text style={{ fontSize: 14, color: '#ad1700' }}>{props.errorString}</Text>
          </View>
        )}
        {props.buttonProps && (
          <ButtonContainer style={getStyle('buttonContainer')}>
            <Button
              {...props.buttonProps}
              style={squashStyles(getStyle('submitButton'))}
              onPress={() => {
                Keyboard.dismiss()
                submit()
              }}
            />
          </ButtonContainer>
        )}
        <View style={{ height: props.extraBottomHeight || 0 }} />
      </>
    )
  }

  return renderContent()

  // return props.disableKeyboardAvoidingView ? (
  //   renderContent()
  // ) : (
  //   <KeyboardAvoidingView
  //     behavior="padding"
  //     style={{ flex: 1, width: '100%' }}
  //     {...(props.keyboardAvoidingView || {})}
  //   >
  //     {renderContent()}
  //   </KeyboardAvoidingView>
  // )
}
