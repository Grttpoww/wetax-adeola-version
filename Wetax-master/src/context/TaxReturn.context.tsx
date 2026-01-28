import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ApiService, TaxAmount, TaxReturn, TaxReturnData } from '../openapi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeLoading } from '../components/configured/SafeLoading'
// import { getUniqueId } from 'react-native-device-info'

type TaxReturnContextT = {
  taxReturn?: TaxReturn
  taxReturnId?: string
  setTaxReturnId: (id: string | undefined) => void
  update: (data: TaxReturn['data']) => Promise<void>
  isUpdating: boolean
  taxAmount?: TaxAmount
}

export const useTaxReturn = (): Required<TaxReturnContextT> => {
  const val = useContext(TaxReturnContext)
  if (!val?.taxReturn) {
    throw new Error('Tax return not found')
  }

  return {
    ...val,
    taxAmount: val.taxAmount ?? { taxableIncome: 0, deductableAmount: 0, grossIncome: 0, totalTaxes: 0 },
    taxReturn: val.taxReturn,
    taxReturnId: val.taxReturn._id,
  }
}

export const useOptionalTaxReturn = (): TaxReturnContextT => {
  const val = useContext(TaxReturnContext)

  if (!val) {
    throw new Error('Tax return context not found')
  }

  return val
}

const TaxReturnContext = createContext<TaxReturnContextT | undefined>(undefined)

TaxReturnContext.displayName = 'TaxReturnContext'

export const TaxReturnProvider = (props: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  // const [inc, setInc] = useState(0)
  const [taxReturnId, _setTaxReturnId] = useState<string | undefined>()

  const fetchTaxReturn = useCallback(async () => {
    if (!taxReturnId) {
      throw new Error('Tax return not found')
    }

    return ApiService.getTaxReturn(taxReturnId).catch((e) => {
      AsyncStorage.removeItem('@taxReturnId')
      _setTaxReturnId(undefined)
      throw e
    })
  }, [taxReturnId])

  const updateTaxReturn = useCallback(
    async (data: TaxReturnData) => {
      if (!taxReturnId) {
        throw new Error('Tax return not found')
      }

      return ApiService.updateTaxReturn(taxReturnId, { data })
    },
    [taxReturnId],
  )

  const { data: taxReturn } = useQuery({
    queryKey: ['taxReturn', taxReturnId],
    queryFn: fetchTaxReturn,
    enabled: !!taxReturnId,
  })

  const fetchTaxAmount = useCallback(async () => {
    if (!taxReturnId) {
      throw new Error('Tax return not found')
    }

    return ApiService.getTaxAmount(taxReturnId)
  }, [taxReturnId])

  const { data: taxAmount, refetch: refetchTaxAmount } = useQuery({
    queryKey: ['taxAmount', taxReturnId],
    queryFn: fetchTaxAmount,
    enabled: !!taxReturnId,
  })

  useEffect(() => {
    AsyncStorage.getItem('@taxReturnId').then((v) => {
      _setTaxReturnId(v ? v : undefined)
    })
  }, [])

  const update = useMutation({
    mutationFn: updateTaxReturn,
    onSuccess: (v, meta) => {
      // setInc((v) => v + 1)
      queryClient.setQueryData<TaxReturn | undefined>(['taxReturn', taxReturnId!], (u) => {
        return u ? { ...u, data: meta, inc: new Date().getTime() } : undefined
      })

      refetchTaxAmount()
    },
  })

  const setTaxReturnId = useCallback((id: string | undefined) => {
    if (id) {
      AsyncStorage.setItem('@taxReturnId', id)
    } else {
      AsyncStorage.removeItem('@taxReturnId')
    }
    _setTaxReturnId(id)
  }, [])

  if (!!taxReturnId && !taxReturn) {
    return <SafeLoading />
  }

  // return <SafeLoading />

  return (
    <TaxReturnContext.Provider
      value={{
        // inc,
        taxReturn,
        setTaxReturnId,
        taxReturnId,
        update: update.mutateAsync,
        isUpdating: update.isPending,
        taxAmount,
      }}
    >
      {props.children}
    </TaxReturnContext.Provider>
  )
}
