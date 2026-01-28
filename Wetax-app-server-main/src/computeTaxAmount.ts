import { TaxReturnData } from './types'

const incomeKeys: (keyof TaxReturnData)[] = ['geldVerdient']

type IncomeReturnType = Partial<Record<(typeof incomeKeys)[number], number>>

export const computeTaxAmount = (taxReturn: TaxReturnData): IncomeReturnType => {
  const income = {} as IncomeReturnType

  Object.entries(taxReturn).map(([key, value]) => {
    switch (key) {
      case 'geldVerdient': {
        income['geldVerdient'] = (value.data as TaxReturnData['geldVerdient']['data']).reduce(
          (acc, curr) => acc + (curr.nettolohn ?? 0),
          0,
        )
        return
      }
    }
  })

  return income
}
