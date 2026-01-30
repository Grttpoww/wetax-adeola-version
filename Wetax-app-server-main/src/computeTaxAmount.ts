import { TaxReturnData } from './types'

const incomeKeys: (keyof TaxReturnData)[] = ['geldVerdient']

type IncomeReturnType = Partial<Record<(typeof incomeKeys)[number], number>> & {
  person1Income?: number
  person2Income?: number
}

export const computeTaxAmount = (taxReturn: TaxReturnData): IncomeReturnType => {
  const income = {} as IncomeReturnType
  const zivilstand = taxReturn.personData?.data?.zivilstand

  Object.entries(taxReturn).map(([key, value]) => {
    switch (key) {
      case 'geldVerdient': {
        const geldVerdientData = value.data as TaxReturnData['geldVerdient']['data']
        
        if (zivilstand === 'verheiratet') {
          // Trenne Einkommen nach Person
          const person1Income = geldVerdientData
            .filter((item) => item.person === 1 || item.person === undefined)
            .reduce((acc, curr) => acc + (curr.nettolohn ?? 0), 0)
          
          const person2Income = geldVerdientData
            .filter((item) => item.person === 2)
            .reduce((acc, curr) => acc + (curr.nettolohn ?? 0), 0)
          
          income['geldVerdient'] = person1Income + person2Income
          income['person1Income'] = person1Income
          income['person2Income'] = person2Income
        } else {
          // Ledig: Wie bisher (alle summieren)
          income['geldVerdient'] = geldVerdientData.reduce(
            (acc, curr) => acc + (curr.nettolohn ?? 0),
            0,
          )
        }
        return
      }
    }
  })

  return income
}
