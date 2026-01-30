import { TaxReturnData } from './types'
import { computeTaxAmount } from './computeTaxAmount'

const rappenToChf = (rappen: number) => rappen / 100

const deductibleKeys: (keyof TaxReturnData)[] = [
  'autoMotorradArbeitWege',
  'oevArbeit',
  'veloArbeit',
  'verpflegungAufArbeit',
  'schichtarbeit',
  'wochenaufenthalt',
  'inAusbildung',
  'saeule3a',
  'versicherungspraemie',
  'privateUnfall',
  'spenden',
]

type DeductibleReturnType = Partial<Record<(typeof deductibleKeys)[number], number>>

export const computeDeductible = (taxReturn: TaxReturnData): DeductibleReturnType => {
  const deductibles: DeductibleReturnType = {}

  Object.entries(taxReturn).map(([key, value]) => {
    if (!deductibleKeys.includes(key as keyof TaxReturnData)) return

    switch (key) {
      case 'oevArbeit': {
        const data = value.data as TaxReturnData['oevArbeit']['data']

        deductibles['oevArbeit'] = data.kosten ?? 0
        break
      }

      case 'veloArbeit': {
        const fixedDeductibleAmount = 700

        // Veloarbeit is only a yes/no question and the deductible is fixed
        deductibles['veloArbeit'] = value.start ? fixedDeductibleAmount : 0
        break
      }

      case 'autoMotorradArbeitWege': {
        const data = value.data as TaxReturnData['autoMotorradArbeitWege']['data']

        deductibles['autoMotorradArbeitWege'] = data.reduce(
          (acc, { anzahlArbeitstage = 0, anzahlKm = 0, fahrtenProTag = 0, rappenProKm = 0 }) => {
            const betrag = anzahlArbeitstage * anzahlKm * fahrtenProTag * rappenToChf(rappenProKm)
            return acc + betrag
          },
          0,
        )
        break
      }

      case 'verpflegungAufArbeit': {
        const data = value.data as TaxReturnData['verpflegungAufArbeit']['data']

        // Maximum deductible amount is 3200 CHF
        // Maximum deductible amount per day is 15 CHF
        const maxDays = Math.floor(3200 / 15)

        // If the user has a verbilligung, the deductible amount per day is 7.5 CHF
        const deductibleWithVerbilligung = 7.5
        const deductibleWithoutVerbilligung = 15

        const verbilligung = !!taxReturn['essenVerbilligungenVomArbeitgeber'].start

        const deductibleDays = Math.min(data.anzahlTage ?? 0, maxDays)
        const deductiblePerDay = verbilligung
          ? deductibleWithVerbilligung
          : deductibleWithoutVerbilligung
        const deductibleAmount = deductibleDays * deductiblePerDay

        deductibles['verpflegungAufArbeit'] = deductibleAmount
        break
      }

      case 'schichtarbeit': {
        const data = value.data as TaxReturnData['schichtarbeit']['data']

        // Maximum deductible amount is 3200 CHF
        // Maximum deductible amount per day is 15 CHF
        const maxDays = Math.floor(3200 / 15)

        // Deductible per day
        const deductiblePerDay = 15

        const deductibleDays = Math.min(data.wieVieleTageImJahr ?? 0, maxDays)
        const deductibleAmount = deductibleDays * deductiblePerDay

        deductibles['schichtarbeit'] = deductibleAmount
        break
      }

      case 'wochenaufenthalt': {
        const data = value.data as TaxReturnData['wochenaufenthalt']['data']

        const deductibleAmount = data.reduce((acc, { betrag = 0 }) => {
          return acc + betrag
        }, 0)

        deductibles['wochenaufenthalt'] = deductibleAmount
        break
      }

      case 'inAusbildung': {
        const data = value.data as TaxReturnData['inAusbildung']['data']

        // Amount spent in Weiterbildung
        const totalAmount = data.reduce((acc, { betrag = 0 }) => {
          return acc + betrag
        }, 0)

        const paidByEmployer = taxReturn['beitragArbeitgeberAusbildung'].data.betragArbeitGeber ?? 0

        const deductibleAmount = totalAmount - paidByEmployer

        deductibles['inAusbildung'] = deductibleAmount

        break
      }

      case 'saeule3a': {
        const data = value.data as TaxReturnData['saeule3a']['data']

        // Updated limit: 7258 CHF (not 7056)
        const maxDeductibleAmount = 7258

        // For married couples: separate limits per person
        const zivilstand = taxReturn.personData?.data?.zivilstand
        if (zivilstand === 'verheiratet') {
          const person1Betrag = Math.min(data.betrag ?? 0, maxDeductibleAmount)
          const person2Betrag = Math.min(data.partner2Betrag ?? 0, maxDeductibleAmount)
          deductibles['saeule3a'] = person1Betrag + person2Betrag
        } else {
          const deductibleAmount = Math.min(data.betrag ?? 0, maxDeductibleAmount)
          deductibles['saeule3a'] = deductibleAmount
        }

        break
      }

      case 'versicherungspraemie': {
        const data = value.data as TaxReturnData['versicherungspraemie']['data']

        const deductibleAmount = data.betrag ?? 0

        deductibles['versicherungspraemie'] = deductibleAmount

        break
      }

      case 'privateUnfall': {
        const data = value.data as TaxReturnData['privateUnfall']['data']

        const deductibleAmount = data.betrag ?? 0

        deductibles['privateUnfall'] = deductibleAmount

        break
      }

      case 'spenden': {
        const data = value.data as TaxReturnData['spenden']['data']

        // The spende has to be a minimum of 100 CHF
        const minSingleAmount = 100
        // The spende has to be a maximum of 20% of the total income
        const incomeResult = computeTaxAmount(taxReturn)
        const totalIncome = Object.values(incomeResult).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0)
        const maxDeductibleAmount = totalIncome * 0.2

        deductibles['spenden'] = Math.min(
          data.reduce(
            (acc, { betrag = 0 }) => (betrag >= minSingleAmount ? acc + betrag : acc),
            0,
          ),
          maxDeductibleAmount
        )
      }
    }
  })

  return deductibles
}
