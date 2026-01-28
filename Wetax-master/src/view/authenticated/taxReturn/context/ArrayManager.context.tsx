import { Lens } from 'monocle-ts'
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { TaxReturnData } from '../../../../openapi'
import { DATA_DEFAULTS } from '../constants'
import { ScreenTypeEnum } from '../enums'
import { SCREENS } from '../screens'
import {
  ScreenArrayForm,
  ScreenArrayOverview,
  ScreenScanOrUploadArray,
  ScreenScanOrUploadArrayBankkonto,
  TaxReturnDataKey,
} from '../types'
import { useScreenManager } from './ScreenManager.context'

type ArrayManagerContextT<T extends {}> = {
  required: boolean
  configured: boolean
  data: Array<T> | null
  item: T | null
  updateItem: (v: T, u?: TaxReturnData) => void
  removeItem: (index?: number) => void
  addItem: () => void
  index: number
  setIndex: (v: number) => void
}

export const useArrayManager = <T extends {}>(): ArrayManagerContextT<T> => {
  const val = useContext(ArrayManagerContext)

  if (!val) {
    throw new Error('Array manager context not found')
  }

  return val as unknown as ArrayManagerContextT<T>
}

const ArrayManagerContext = createContext<ArrayManagerContextT<{}> | undefined>(undefined)

ArrayManagerContext.displayName = 'ArrayManagerContext'

export const ArrayManager = <T extends {}>(props: { children: ReactNode }) => {
  const { taxReturn, update } = useTaxReturn()
  const { screen } = useScreenManager()

  const [index, _setIndex] = useState(0)
  const [item, setItem] = useState<T | null>(null)
  const [ready] = useState(false)

  const setIndex = useCallback(
    (newIndex: number) => {
      console.log('=== ArrayManager.setIndex Called ===')
      console.log('Current index:', index)
      console.log('New index:', newIndex)
      console.log('Screen:', screen.name)
      _setIndex(newIndex)
    },
    [index, screen.name],
  )

  const screenData = useMemo(() => {
    const d = SCREENS.find((s) => s.name === screen.name)
    return d
  }, [screen])

  const required = useMemo(() => screenData?.type === ScreenTypeEnum.ArrayForm, [screenData])

  const arrayScreenConfig:
    | ScreenArrayForm<TaxReturnDataKey, {}>
    | ScreenArrayOverview<TaxReturnDataKey, {}>
    | ScreenScanOrUploadArray<TaxReturnDataKey, {}>
    | ScreenScanOrUploadArrayBankkonto<TaxReturnDataKey, {}>
    | null = useMemo(() => {
    if (screenData) {
      if (
        screenData.type === ScreenTypeEnum.ScanOrUploadArray ||
        screenData.type === ScreenTypeEnum.ScanOrUploadArrayBankkonto ||
        screenData.type === ScreenTypeEnum.ArrayForm ||
        screenData.type === ScreenTypeEnum.ArrayOverview
      ) {
        return screenData
      }
    }

    return null
  }, [taxReturn.data, screenData])

  const data = useMemo(() => {
    if (arrayScreenConfig) {
      const lens = Lens.fromPath<TaxReturnData>()([arrayScreenConfig.dataKey, 'data'])

      const v = lens.get(taxReturn.data)

      if (v === null || v === undefined) {
        return null
      }

      if (!Array.isArray(v)) {
        throw new Error('Array expected')
      }

      return v as unknown as Array<T>
    }

    return null
  }, [taxReturn.data, index, arrayScreenConfig])

  useEffect(() => {
    if (data) {
      setItem(data[index] || null)
    }
  }, [data, index, taxReturn.data])

  const updateData = useCallback(
    (v: Array<T>, newTaxReturnData: TaxReturnData = taxReturn.data) => {
      if (!arrayScreenConfig) {
        throw new Error('Array form config or data not found')
      }

      const lens = Lens.fromPath<TaxReturnData>()([arrayScreenConfig.dataKey, 'data'])

      update(lens.set(v)(newTaxReturnData))
    },
    [arrayScreenConfig, taxReturn.data],
  )

  const addItem = useCallback(() => {
    if (!arrayScreenConfig) {
      throw new Error('Array form config or data not found')
    }

    const newData: T = DATA_DEFAULTS[arrayScreenConfig.dataKey]

    updateData([...(data || []), newData])
    setItem(newData)
  }, [arrayScreenConfig, data, updateData])

  useEffect(() => {
    const dataNeedsToBeInitialized = data === null || data.length === 0

    if (arrayScreenConfig?.type === ScreenTypeEnum.ArrayForm) {
      if (arrayScreenConfig && !dataNeedsToBeInitialized && item === null) {
        // console.log('adding 1...')
        addItem()
      }

      if (arrayScreenConfig && dataNeedsToBeInitialized) {
        // console.log('adding 2...')
        addItem()
      }
    }
  }, [arrayScreenConfig, data, item, ready])

  const configured = useMemo(() => data !== null && item !== null, [data, item])

  const updateItem = useCallback(
    (v: T, newTaxReturnData?: TaxReturnData) => {
      console.log('=== ArrayManager.updateItem Called ===')
      console.log('Index:', index)
      console.log('Current data array:', JSON.stringify(data, null, 2))
      console.log('New item to update:', JSON.stringify(v, null, 2))
      console.log('New tax return data:', JSON.stringify(newTaxReturnData, null, 2))

      // If data is empty or index doesn't exist, add the item instead of updating
      if (!data || data.length === 0 || index >= data.length) {
        console.log('Array is empty or index out of bounds, adding item instead')
        const updatedArray = [...(data || []), v]
        console.log('Updated array after adding:', JSON.stringify(updatedArray, null, 2))
        updateData(updatedArray, newTaxReturnData)

        // Reset index to the position of the newly added item
        const newIndex = updatedArray.length - 1
        console.log('Resetting index to:', newIndex)
        _setIndex(newIndex)
      } else {
        const updatedArray = data.map((d, i) => (i === index ? v : d))
        console.log('Updated array after map:', JSON.stringify(updatedArray, null, 2))
        updateData(updatedArray, newTaxReturnData)
      }

      console.log('=== End ArrayManager.updateItem ===')
    },
    [index, data, updateData],
  )

  const removeItem = useCallback(
    (_index: number = index) => {
      // console.log('removing 1...')
      updateData(data?.filter((_, i) => i !== _index) || [])
    },
    [index, data, updateData],
  )

  // console.log({ data, item, arrayScreenConfig })

  return (
    <ArrayManagerContext.Provider
      value={{
        index,
        setIndex,
        data,
        item,
        removeItem,
        updateItem: updateItem as any,
        configured,
        required,
        addItem,
      }}
    >
      <>{props.children}</>
    </ArrayManagerContext.Provider>
  )
}
