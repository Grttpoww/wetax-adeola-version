import {
  FormField,
  FormFieldGroup,
  FormSection,
  SectionField,
  SectionFields,
  SingleFieldOrRow,
  SingleFormField,
} from './Form'
import { FormFieldType } from './form.types'

const processFormFieldRow = <T>(
  a: Array<SingleFormField<T>>,
  fn: (i: SingleFormField<T>) => boolean,
): Array<SingleFormField<T>> =>
  a.reduce((acc: Array<SingleFormField<T>>, j: SingleFormField<T>) => (fn(j) ? [...acc, j] : acc), [])

const processFormFieldGroup = <T>(
  g: FormFieldGroup<T>,
  fn: (i: SingleFormField<T>) => boolean,
): FormFieldGroup<T> => ({
  ...g,
  fields: g.fields.reduce((filteredFields: Array<SingleFieldOrRow<T>>, e: SingleFieldOrRow<T>) => {
    if (Array.isArray(e)) {
      return [...filteredFields, processFormFieldRow(e, fn)]
    } else {
      return [...filteredFields, ...(fn(e) ? [e] : [])]
    }
  }, []),
})

const processFormSectionFields = <T>(
  fields: SectionFields<T>,
  fn: (i: SingleFormField<T>) => boolean,
): SectionFields<T> =>
  fields.reduce((acc: Array<SectionField<T>>, f: SectionField<T>) => {
    if (Array.isArray(f)) {
      return [...acc, processFormFieldRow(f, fn)]
    } else if (f.type === FormFieldType.FormFieldGroup) {
      return [...acc, processFormFieldGroup(f, fn)]
    } else {
      return [...acc, ...(fn(f) ? [f] : [])]
    }
  }, [])

const processFormSection = <T>(
  s: FormSection<T>,
  fn: (i: SingleFormField<T>) => boolean,
): FormSection<T> => ({
  ...s,
  fields: processFormSectionFields(s.fields, fn),
})

export const filterFormFields = <T>(
  formFields: Array<FormField<T>>,
  fn: (i: SingleFormField<T>) => boolean,
): Array<FormField<T>> =>
  formFields.reduce((groups: Array<FormField<T>>, f: FormField<T>) => {
    if (Array.isArray(f)) {
      return [...groups, processFormFieldRow(f, fn)]
    } else if (f.type === FormFieldType.FormFieldGroup) {
      return [...groups, processFormFieldGroup(f, fn)]
    } else if (f.type === FormFieldType.FormSection) {
      return [...groups, processFormSection(f, fn)]
    } else {
      return [...groups, ...(fn(f) ? [f] : [])]
    }
  }, [])
