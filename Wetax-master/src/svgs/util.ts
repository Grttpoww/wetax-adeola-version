import { format, parse } from 'date-fns'

export const capitalize = (input: string) => {
  if (typeof input !== 'string' || input === '') {
    return ''
  }
  return input
    .trim()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
    .trim()
}

export const keys = <A extends Record<string, unknown>, K extends keyof A>(x: A): Array<K> =>
  Object.keys(x) as Array<K>

export const wait = (ms: number) => new Promise((resolve) => setTimeout(() => resolve('timed-out'), ms))

export const formatNumber = (n: number, abbreviate = false, currency: string = '') =>
  `${n >= 0 ? '+ ' : '- '}${currency ? `${currency} ` : ''}${Math.abs(
    Number(n.toFixed(abbreviate ? (Math.abs(n) > 99.99 ? 0 : 2) : 2)),
  ).toFixed(2)}`

export const convertDate = (date: string) => {
  const d = date.split('.')
  return `${d[2]}-${d[1]}-${d[0]}`
}

export const formatDate = (date: Date) => format(date, 'yyyy.MM.dd')

export const parseDate = (date: string) => parse(date, 'yyyy.MM.dd' as any, new Date())

export const omit = <T>(obj: { [k: string]: T }, key: string): { [k: string]: T } => {
  const { [key]: deletedKey, ...otherKeys } = obj
  return otherKeys
}

const phoneRegex = /^\d{3} \d{3} \d{4}$/
const phoneRegex2 = /^\d{10}$/

export const testPhoneNumber = (str: string) => {
  return phoneRegex.test(str) || phoneRegex2.test(str)
}
