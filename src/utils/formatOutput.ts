import type { SlotKey, WeekDay, Hour } from '../types'
import { WEEKDAYS, parseSlotKey } from '../types'
import { convertHour, getTimezoneAbbr } from './timezoneUtils'
import { addDays } from './dateUtils'

type FormatOptions = {
  formatWeekday: (weekday: WeekDay) => string
  formatHour: (hour: Hour) => string
  formatDate?: (date: Date) => string
  weekDates?: Date[]
  prefix: string
  localTimezone?: string
  targetTimezone?: string
}

type ConvertedSlot = {
  date: Date
  weekday: WeekDay
  hour: number
}

export function formatOutput(slots: Set<SlotKey>, options: FormatOptions): string {
  const { formatWeekday, formatHour, formatDate, weekDates, prefix, localTimezone, targetTimezone } = options

  if (slots.size === 0) return ''

  const needsConversion = localTimezone && targetTimezone && localTimezone !== targetTimezone
  const tzAbbr = targetTimezone ? getTimezoneAbbr(targetTimezone) : ''

  if (needsConversion && weekDates) {
    return formatWithTimezoneConversion(slots, options, tzAbbr)
  }

  const byDay = new Map<WeekDay, Hour[]>()
  slots.forEach((key) => {
    const { weekday, hour } = parseSlotKey(key)
    if (!byDay.has(weekday)) byDay.set(weekday, [])
    byDay.get(weekday)!.push(hour)
  })

  const lines: string[] = [prefix]

  WEEKDAYS.forEach((weekday, idx) => {
    const hours = byDay.get(weekday)
    if (!hours || hours.length === 0) return

    hours.sort((a, b) => a - b)
    const ranges = mergeHours(hours)
    const rangeStr = ranges.map((r) => formatRange(r, formatHour)).join(', ')

    let dayLabel = formatWeekday(weekday)
    if (formatDate && weekDates) {
      dayLabel += ` (${formatDate(weekDates[idx])})`
    }

    lines.push(`${dayLabel}: ${rangeStr}${tzAbbr ? ` ${tzAbbr}` : ''}`)
  })

  return lines.join('\n')
}

function formatWithTimezoneConversion(
  slots: Set<SlotKey>,
  options: FormatOptions,
  tzAbbr: string
): string {
  const { formatWeekday, formatHour, formatDate, weekDates, prefix, localTimezone, targetTimezone } = options

  const convertedSlots: ConvertedSlot[] = []

  slots.forEach((key) => {
    const { weekday, hour } = parseSlotKey(key)
    const dayIndex = WEEKDAYS.indexOf(weekday)
    const date = weekDates![dayIndex]

    const { hour: convertedHour, dayOffset } = convertHour(hour, date, localTimezone!, targetTimezone!)
    const convertedDate = dayOffset !== 0 ? addDays(date, dayOffset) : date
    const convertedWeekday = getWeekdayFromDate(convertedDate)

    convertedSlots.push({
      date: convertedDate,
      weekday: convertedWeekday,
      hour: Math.round(convertedHour),
    })
  })

  const byDate = new Map<string, { date: Date; weekday: WeekDay; hours: number[] }>()
  convertedSlots.forEach(({ date, weekday, hour }) => {
    const key = date.toISOString().split('T')[0]
    if (!byDate.has(key)) {
      byDate.set(key, { date, weekday, hours: [] })
    }
    byDate.get(key)!.hours.push(hour)
  })

  const sortedDates = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b))

  const lines: string[] = [prefix]

  sortedDates.forEach(([, { date, weekday, hours }]) => {
    hours.sort((a, b) => a - b)
    const ranges = mergeHours(hours as Hour[])
    const rangeStr = ranges.map((r) => formatRange(r, formatHour)).join(', ')

    let dayLabel = formatWeekday(weekday)
    if (formatDate) {
      dayLabel += ` (${formatDate(date)})`
    }

    lines.push(`${dayLabel}: ${rangeStr} ${tzAbbr}`)
  })

  return lines.join('\n')
}

function getWeekdayFromDate(date: Date): WeekDay {
  const weekdays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return weekdays[date.getDay()]
}

function mergeHours(hours: Hour[]): Array<[Hour, Hour]> {
  const ranges: Array<[Hour, Hour]> = []
  let start = hours[0]
  let end = hours[0]

  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === end + 1) {
      end = hours[i]
    } else {
      ranges.push([start, end])
      start = hours[i]
      end = hours[i]
    }
  }
  ranges.push([start, end])
  return ranges
}

function formatRange([start, end]: [Hour, Hour], formatHour: (h: Hour) => string): string {
  if (start === end) {
    return formatHour(start)
  }
  return `${formatHour(start)}-${formatHour((end + 1) as Hour)}`
}
