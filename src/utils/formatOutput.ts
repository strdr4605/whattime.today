import type { SlotKey, WeekDay, Hour, Minute, Interval } from '../types'
import { WEEKDAYS, parseSlotKey } from '../types'
import { convertHour, getTimezoneAbbr } from './timezoneUtils'
import { addDays } from './dateUtils'

type FormatOptions = {
  formatWeekday: (weekday: WeekDay) => string
  formatTime: (hour: Hour, minute: Minute) => string
  formatDate?: (date: Date) => string
  weekDates?: Date[]
  prefix: string
  localTimezone?: string
  targetTimezone?: string
  interval: Interval
  appendLink?: string
}

type ConvertedSlot = {
  date: Date
  weekday: WeekDay
  hour: number
  minute: Minute
}

type TimeSlot = { hour: Hour; minute: Minute }

export function formatOutput(slots: Set<SlotKey>, options: FormatOptions): string {
  const { formatWeekday, formatTime, formatDate, weekDates, prefix, localTimezone, targetTimezone, interval, appendLink } = options

  if (slots.size === 0) return ''

  const needsConversion = localTimezone && targetTimezone && localTimezone !== targetTimezone
  const tzAbbr = targetTimezone ? getTimezoneAbbr(targetTimezone) : ''

  if (needsConversion && weekDates) {
    return formatWithTimezoneConversion(slots, options, tzAbbr)
  }

  const byDay = new Map<WeekDay, TimeSlot[]>()
  slots.forEach((key) => {
    const { weekday, hour, minute } = parseSlotKey(key)
    if (!byDay.has(weekday)) byDay.set(weekday, [])
    byDay.get(weekday)!.push({ hour, minute })
  })

  const lines: string[] = [prefix]

  WEEKDAYS.forEach((weekday, idx) => {
    const timeSlots = byDay.get(weekday)
    if (!timeSlots || timeSlots.length === 0) return

    timeSlots.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
    const ranges = mergeTimeSlots(timeSlots, interval)
    const rangeStr = ranges.map((r) => formatTimeRange(r, formatTime, interval)).join(', ')

    let dayLabel = formatWeekday(weekday)
    if (formatDate && weekDates) {
      dayLabel += ` (${formatDate(weekDates[idx])})`
    }

    lines.push(`${dayLabel}: ${rangeStr}${tzAbbr ? ` ${tzAbbr}` : ''}`)
  })

  let result = lines.join('\n')
  if (appendLink) {
    result += `\n\n${appendLink}`
  }
  return result
}

function formatWithTimezoneConversion(
  slots: Set<SlotKey>,
  options: FormatOptions,
  tzAbbr: string
): string {
  const { formatWeekday, formatTime, formatDate, weekDates, prefix, localTimezone, targetTimezone, interval, appendLink } = options

  const convertedSlots: ConvertedSlot[] = []

  slots.forEach((key) => {
    const { weekday, hour, minute } = parseSlotKey(key)
    const dayIndex = WEEKDAYS.indexOf(weekday)
    const date = weekDates![dayIndex]

    const { hour: convertedHour, dayOffset } = convertHour(hour, date, localTimezone!, targetTimezone!)
    const convertedDate = dayOffset !== 0 ? addDays(date, dayOffset) : date
    const convertedWeekday = getWeekdayFromDate(convertedDate)

    convertedSlots.push({
      date: convertedDate,
      weekday: convertedWeekday,
      hour: Math.round(convertedHour),
      minute,
    })
  })

  const byDate = new Map<string, { date: Date; weekday: WeekDay; timeSlots: TimeSlot[] }>()
  convertedSlots.forEach(({ date, weekday, hour, minute }) => {
    const key = date.toISOString().split('T')[0]
    if (!byDate.has(key)) {
      byDate.set(key, { date, weekday, timeSlots: [] })
    }
    byDate.get(key)!.timeSlots.push({ hour: hour as Hour, minute })
  })

  const sortedDates = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b))

  const lines: string[] = [prefix]

  sortedDates.forEach(([, { date, weekday, timeSlots }]) => {
    timeSlots.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
    const ranges = mergeTimeSlots(timeSlots, interval)
    const rangeStr = ranges.map((r) => formatTimeRange(r, formatTime, interval)).join(', ')

    let dayLabel = formatWeekday(weekday)
    if (formatDate) {
      dayLabel += ` (${formatDate(date)})`
    }

    lines.push(`${dayLabel}: ${rangeStr} ${tzAbbr}`)
  })

  let result = lines.join('\n')
  if (appendLink) {
    result += `\n\n${appendLink}`
  }
  return result
}

function getWeekdayFromDate(date: Date): WeekDay {
  const weekdays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return weekdays[date.getDay()]
}

function mergeTimeSlots(slots: TimeSlot[], interval: Interval): Array<[TimeSlot, TimeSlot]> {
  if (slots.length === 0) return []

  const ranges: Array<[TimeSlot, TimeSlot]> = []
  let start = slots[0]
  let end = slots[0]
  const step = interval === '1h' ? 60 : 30

  for (let i = 1; i < slots.length; i++) {
    const endMinutes = end.hour * 60 + end.minute
    const currentMinutes = slots[i].hour * 60 + slots[i].minute

    if (currentMinutes === endMinutes + step) {
      end = slots[i]
    } else {
      ranges.push([start, end])
      start = slots[i]
      end = slots[i]
    }
  }
  ranges.push([start, end])
  return ranges
}

function addStep(slot: TimeSlot, interval: Interval): TimeSlot {
  const step = interval === '1h' ? 60 : 30
  const totalMinutes = slot.hour * 60 + slot.minute + step
  return { hour: Math.floor(totalMinutes / 60) as Hour, minute: (totalMinutes % 60) as Minute }
}

function formatTimeRange(
  [start, end]: [TimeSlot, TimeSlot],
  formatTime: (h: Hour, m: Minute) => string,
  interval: Interval
): string {
  const endPlusStep = addStep(end, interval)
  return `${formatTime(start.hour, start.minute)}-${formatTime(endPlusStep.hour, endPlusStep.minute)}`
}
