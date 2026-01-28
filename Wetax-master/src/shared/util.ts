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

// More flexible phone validation that handles various international formats
const internationalPhoneRegex = /^\+?[1-9]\d{1,14}$/
const formattedPhoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/

export const testPhoneNumber = (str: string) => {
  // Remove all non-digit characters except +
  const cleanPhone = str.replace(/[^\d+]/g, '')

  // Check legacy formats first for backward compatibility
  if (phoneRegex.test(str) || phoneRegex2.test(str)) {
    return true
  }

  // Check international format
  if (internationalPhoneRegex.test(cleanPhone)) {
    return true
  }

  // Check formatted international format
  if (formattedPhoneRegex.test(str) && cleanPhone.length >= 7 && cleanPhone.length <= 15) {
    return true
  }

  return false
}

export const formatPhoneNumberForBackend = (phoneNumber: string, countryCode: string) => {
  // Remove all formatting except digits
  const digitsOnly = phoneNumber.replace(/\D/g, '')

  // If it already includes country code, return as is with +
  if (phoneNumber.startsWith('+')) {
    return phoneNumber.replace(/[^\d+]/g, '').replace(/(\+)(\d)/, '+$2')
  }

  // Add country code if not present
  return `${countryCode}${digitsOnly}`
}

export const AHV_REGEX = /^756\.\d{4}\.\d{4}\.\d{2}$/

export const testAHVNumber = (str: string) => {
  return AHV_REGEX.test(str)
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const testEmail = (str: string) => {
  return emailRegex.test(str)
}
