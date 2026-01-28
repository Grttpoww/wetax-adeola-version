import { useState, useMemo, useEffect } from 'react'
import { View } from 'react-native'
import { Button, ButtonType, Form } from '../../../../components/shared'
import { useArrayManager } from '../context/ArrayManager.context'
import { useScreenManager } from '../context/ScreenManager.context'
import { ContentScrollView } from '../scaffold/ContentScrollView'
import { ScreenArrayForm, TaxReturnDataKey } from '../types'
import { ScreenEnum } from '../enums'
import { useTaxReturn } from '../../../../context/TaxReturn.context'

const _FormArrayTemplate = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenArrayForm<T, U>
  item: U
}) => {
  const { setScreen } = useScreenManager()
  const { updateItem, removeItem } = useArrayManager<U>()
  const { taxReturn } = useTaxReturn()

  // Helper function to calculate work days from date range - MUST be defined before useMemo
  const calculateArbeitstage = (von?: string, bis?: string, urlaubstage?: number) => {
    if (!von || !bis) return undefined

    try {
      // Parse dates in format YYYY.MM.DD
      const [vonYear, vonMonth, vonDay] = von.split('.').map(Number)
      const [bisYear, bisMonth, bisDay] = bis.split('.').map(Number)

      const startDate = new Date(vonYear, vonMonth - 1, vonDay)
      const endDate = new Date(bisYear, bisMonth - 1, bisDay)

      // Calculate actual working days (Monday to Friday only)
      let workingDays = 0
      const current = new Date(startDate)

      while (current <= endDate) {
        const dayOfWeek = current.getDay()
        // 0 = Sunday, 6 = Saturday - exclude weekends
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++
        }
        current.setDate(current.getDate() + 1)
      }

      // Subtract vacation days
      const arbeitstage = workingDays - (urlaubstage || 0)

      return arbeitstage > 0 ? arbeitstage : 0
    } catch (e) {
      console.error('Error calculating arbeitstage:', e)
      return undefined
    }
  }

  // Initialize formState with auto-calculated values for AutoMotorradArbeitWegeDetail
  const initialFormState = useMemo(() => {
    if (
      props.screen.name === ScreenEnum.AutoMotorradArbeitWegeDetail &&
      taxReturn.data.geldVerdient.data.length > 0
    ) {
      const itemData = props.item as any
      const firstJob = taxReturn.data.geldVerdient.data[0]

      const updates: any = {}

      // Auto-populate anzahlArbeitstage if not already set
      if (!itemData.anzahlArbeitstage) {
        const calculatedArbeitstage =
          firstJob.anzahlArbeitstage ??
          calculateArbeitstage(firstJob.von, firstJob.bis, firstJob.urlaubstage)
        updates.anzahlArbeitstage = calculatedArbeitstage
      }

      // Auto-populate arbeitsort if not already set
      if (!itemData.arbeitsort && firstJob.arbeitsort) {
        updates.arbeitsort = firstJob.arbeitsort
      }

      if (Object.keys(updates).length > 0) {
        return {
          ...props.item,
          ...updates,
        } as U
      }
    }
    return props.item
  }, [JSON.stringify(props.item), props.screen.name, taxReturn.data.geldVerdient.data])

  const [formState, setFormState] = useState<U>(initialFormState)

  const { screen } = props

  // Reset formState when item changes or dataKey changes (e.g., opening a different item or switching between data types like bankkonto to aktien)
  useEffect(() => {
    console.log('=== FormArray: Item changed, updating formState ===')
    console.log('New item:', JSON.stringify(props.item, null, 2))
    setFormState(initialFormState)
  }, [initialFormState])

  // Dynamically inject placeholders from geldVerdient[0] for InAusbildungDetail
  const formFieldsWithDynamicPlaceholders = useMemo(() => {
    if (
      screen.name === ScreenEnum.AutoMotorradArbeitWegeDetail &&
      taxReturn.data.geldVerdient.data.length > 0
    ) {
      const firstJob = taxReturn.data.geldVerdient.data[0]

      // Calculate anzahlArbeitstage if not already set
      const calculatedArbeitstage =
        firstJob.anzahlArbeitstage ??
        calculateArbeitstage(firstJob.von, firstJob.bis, firstJob.urlaubstage)

      console.log('firstJob', { ...firstJob, calculatedArbeitstage })

      return screen.form.fields.map((field: any) => {
        // Inject calculated arbeitstage as placeholder
        if (field.label === 'anzahl Arbeitstage' && field.type === 'NumberInput' && field.inputProps) {
          return {
            ...field,
            inputProps: {
              ...field.inputProps,
              value: calculatedArbeitstage?.toString() || '0',
              placeholder: calculatedArbeitstage?.toString() || '0',
            },
          }
        }
        return field
      })
    }
    return screen.form.fields
  }, [screen, taxReturn.data.geldVerdient.data])

  return (
    <ContentScrollView>
      <Form<U>
        formFields={formFieldsWithDynamicPlaceholders}
        data={formState}
        onChange={setFormState}
        setError={() => { }}
      />
      <View style={{ marginTop: 'auto', gap: 16 }}>
        <Button
          label={'Weiter'}
          type={ButtonType.Dark}
          onPress={() => {
            // For GeldVerdientDetail, calculate anzahlArbeitstage before saving
            if (screen.name === ScreenEnum.GeldVerdientDetail) {
              const jobData = formState as any

              // Calculate anzahlArbeitstage if not manually set
              if (!jobData.anzahlArbeitstage && jobData.von && jobData.bis) {
                const calculated = calculateArbeitstage(jobData.von, jobData.bis, jobData.urlaubstage)
                updateItem({ ...formState, anzahlArbeitstage: calculated } as U)
              } else {
                updateItem(formState)
              }
            } else {
              updateItem(formState)
            }

            setScreen(screen.overviewScreen)
          }}
          style={{
            background: {
              borderRadius: 30,
              height: 55,
            },
          }}
        />
        <Button
          label={'Cancel'}
          type={ButtonType.ChromelessDark}
          onPress={() => {
            setScreen(screen.overviewScreen)
            removeItem()
          }}
          style={{
            background: {
              borderRadius: 30,
              backgroundColor: '#fff',
              height: 55,
            },
          }}
        />
      </View>
    </ContentScrollView>
  )
}

export const FormArrayTemplate = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenArrayForm<T, U>
}) => {
  const { item } = useArrayManager<U>()

  const { screen } = props

  if (!item) {
    return <></>
  }

  return <_FormArrayTemplate screen={screen} item={item} />
}
