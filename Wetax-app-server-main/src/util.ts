export function base64ToArrayBuffer(base64: string) {
  var binaryString = atob(base64)
  var bytes = new Uint8Array(binaryString.length)
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export const generateCode = (n: number) =>
  `${Math.floor(Math.pow(10, n - 1) + Math.random() * Math.pow(10, n - 1) * 9)}`

/**
 * Calculate working days between two dates (Monday to Friday only)
 * @param startDate - Start date in format 'YYYY.MM.DD'
 * @param endDate - End date in format ''YYYY.MM.DD'
 * @returns Number of working days
 */
export const calculateWorkingDays = (startDate: string, endDate: string): number => {
  try {
    // Parse dates from DD.MM.YYYY or YYYY.MM.DD format
    const parseDate = (dateStr: string): Date => {
      const parts = dateStr.split('.').map(Number)

      // Check if it's YYYY.MM.DD format (year is first and > 1000)
      if (parts[0] > 1000) {
        const [year, month, day] = parts
        return new Date(year, month - 1, day)
      } else {
        // DD.MM.YYYY format
        const [day, month, year] = parts
        return new Date(year, month - 1, day)
      }
    }

    const start = parseDate(startDate)
    const end = parseDate(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error(`Invalid dates: ${startDate}, ${endDate}`)
      return 0
    }

    let workingDays = 0
    const current = new Date(start)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++
      }
      current.setDate(current.getDate() + 1)
    }

    return workingDays
  } catch (error) {
    console.error('Error calculating working days:', error)
    return 0
  }
}

/**
 * Calculate anzahlArbeitstage based on von, bis, and urlaubstage
 * @param von - Start date in format 'DD.MM.YYYY' or 'YYYY.MM.DD'
 * @param bis - End date in format 'DD.MM.YYYY' or 'YYYY.MM.DD'
 * @param urlaubstage - Number of vacation days
 * @returns Number of working days minus vacation days
 */
export const calculateAnzahlArbeitstage = (
  von: string | undefined,
  bis: string | undefined,
  urlaubstage: number | undefined,
): number | undefined => {
  if (!von || !bis) {
    return undefined
  }

  const workingDays = calculateWorkingDays(von, bis)
  const vacation = urlaubstage ?? 0

  return Math.max(0, workingDays - vacation)
}
