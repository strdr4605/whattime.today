import type { WeekDay } from '../types'

export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// Parses a YYYY-MM-DD key as a local date. `new Date(key)` parses as UTC and
// shifts the day for every timezone west of UTC.
export function parseLocalDate(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return new Date(NaN)
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function isValidDateKey(key: string): boolean {
  const date = parseLocalDate(key)
  if (Number.isNaN(date.getTime())) return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)!
  return (
    date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
  )
}

export function weekdayFromDate(date: Date): WeekDay {
  const weekdays: WeekDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return weekdays[date.getDay()]
}
