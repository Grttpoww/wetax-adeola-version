import { FormField, FormFieldGroup, SectionFields, SingleFormField } from './Form'
import { FormFieldType } from './form.types'

type Fn<T> = (i: SingleFormField<T>) => boolean

const processFormFieldRow = <T, E>(a: Array<SingleFormField<T>>, fn: Fn<T>): boolean =>
  a.some((j) => fn(j))

const processFormFieldGroup = <T>(g: FormFieldGroup<T>, fn: Fn<T>): boolean =>
  g.fields.some((f) => {
    if (Array.isArray(f)) {
      return processFormFieldRow(f, fn)
    } else {
      return fn(f)
    }
  })

const processFormSectionFields = <T>(fields: SectionFields<T>, fn: Fn<T>): boolean =>
  fields.some((f) => {
    if (Array.isArray(f)) {
      return processFormFieldRow(f, fn)
    } else if (f.type === FormFieldType.FormFieldGroup) {
      return processFormFieldGroup(f, fn)
    } else {
      return fn(f)
    }
  })

export const someFormFields = <T>(formFields: Array<FormField<T>>, fn: Fn<T>): boolean =>
  formFields.some((f: FormField<T>) => {
    if (Array.isArray(f)) {
      return processFormFieldRow(f, fn)
    } else if (f.type === FormFieldType.FormFieldGroup) {
      return processFormFieldGroup(f, fn)
    } else if (f.type === FormFieldType.FormSection) {
      return processFormSectionFields(f.fields, fn)
    } else {
      return fn(f)
    }
  })
