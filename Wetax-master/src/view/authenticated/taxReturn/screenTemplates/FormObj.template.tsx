import { Lens } from 'monocle-ts'
import { useState, useEffect, useMemo } from 'react'
import { Button, ButtonType, Form } from '../../../../components/shared'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { useOptionalUser } from '../../../../context/User.context'
import { TaxReturnData } from '../../../../openapi'
import { useScreenManager } from '../context/ScreenManager.context'
import { ContentScrollView } from '../scaffold/ContentScrollView'
import { ScreenObjForm, TaxReturnDataKey } from '../types'
import { useMunicipalities } from '../../../../hooks/useMunicipalities'
import { FormFieldType } from '../../../../components/form/form.types'

export const FormObjTemplate = <T extends TaxReturnDataKey>(props: { screen: ScreenObjForm<T> }) => {
  const { screen } = props
  const { taxReturn, update } = useTaxReturn()
  const { awaitNext } = useScreenManager()
  const { user } = useOptionalUser()

  const lens = Lens.fromPath<TaxReturnData>()([screen.dataKey, 'data'])
  const initialData = lens.get(taxReturn.data)

  // Load municipalities if this is the personData screen
  const { data: municipalitiesData } = useMunicipalities()

  // Initialize form state with user email if it's the personData screen and email is empty
  const [formState, setFormState] = useState<TaxReturnData[T]['data']>(() => {
    if (screen.dataKey === 'personData' && user?.user?.email) {
      const personData = initialData as TaxReturnData['personData']['data']
      if (!personData.email) {
        return {
          ...initialData,
          email: user.user.email
        } as TaxReturnData[T]['data']
      }
    }
    return initialData
  })

  // Enhance form fields with municipality data if this is personData screen
  const enhancedFields = useMemo(() => {
    if (screen.dataKey === 'personData' && municipalitiesData?.municipalities) {
      return screen.form.fields.map((field) => {
        // Find the Gemeinde field by label and populate its items
        if (field.type === FormFieldType.NumberSelectInput && field.label === 'Gemeinde') {
          // NumberSelect expects items with number values
          return {
            ...field,
            items: municipalitiesData.municipalities.map((m) => ({
              label: m.name,
              value: m.bfsNumber, // Number, not string
            })),
          }
        }
        return field
      })
    }
    return screen.form.fields
  }, [screen.form.fields, screen.dataKey, municipalitiesData])

  return (
    <ContentScrollView>
      <Form<TaxReturnData[T]['data']>
        formFields={enhancedFields}
        data={formState}
        rootData={taxReturn.data}
        onChange={setFormState}
        setError={() => { }}
      />
      <Button
        label={'Next'}
        type={ButtonType.ChromelessDark}
        onPress={() => {
          console.log('=== FormObjTemplate Submit Debug ===')
          console.log('Screen dataKey:', screen.dataKey)
          console.log('Form state being submitted:', formState)


          const updatedData = lens.set(formState)(taxReturn.data)
          console.log('Updated taxReturn data:', updatedData)
          console.log('=====================================')

          awaitNext()
          update(updatedData)
        }}
        style={{
          background: {
            borderRadius: 30,
            height: 50,
          },
        }}
      />
    </ContentScrollView>
  )
}
