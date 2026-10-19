export type Mode = 'week' | 'generic'

export type TimeFormat = '12h' | '24h'

export type Interval = '1h' | '30min'

export type Locale = 'en' | 'es' | 'zh' | 'fr' | 'de' | 'pt' | 'ro' | 'ru'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'pt', label: 'PT' },
  { code: 'ro', label: 'RO' },
  { code: 'ru', label: 'RU' },
]

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type Hour = 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21

export type Minute = 0 | 30

export type SlotKey = `${WeekDay}-${Hour}-${Minute}`

export const MINUTES: Minute[] = [0, 30]

export type Slot = { hour: Hour; minute: Minute }

export type WeekSelection = {
  weekStart: string; // ISO date string (YYYY-MM-DD) of the Monday
  slots: SlotKey[]
}

export function weekSelectionKey(weekStart: Date): string {
  const y = weekStart.getFullYear()
  const m = String(weekStart.getMonth() + 1).padStart(2, '0')
  const d = String(weekStart.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const WEEKDAYS: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const HOURS: Hour[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

export function makeSlotKey(weekday: WeekDay, hour: Hour, minute: Minute = 0): SlotKey {
  return `${weekday}-${hour}-${minute}`
}

export function parseSlotKey(key: SlotKey): { weekday: WeekDay; hour: Hour; minute: Minute } {
  const parts = key.split('-')
  const weekday = parts[0] as WeekDay
  const hour = parseInt(parts[1], 10) as Hour
  const minute = parseInt(parts[2], 10) as Minute
  return { weekday, hour, minute }
}

export function isValidSlotKey(value: unknown): value is SlotKey {
  if (typeof value !== 'string') return false
  const parts = value.split('-')
  if (parts.length !== 3) return false
  return (
    WEEKDAYS.includes(parts[0] as WeekDay) &&
    HOURS.includes(Number(parts[1]) as Hour) &&
    MINUTES.includes(Number(parts[2]) as Minute)
  )
}

export function getSlots(interval: Interval): Slot[] {
  const slots: Slot[] = []
  for (const hour of HOURS) {
    if (interval === '1h') {
      slots.push({ hour, minute: 0 })
    } else {
      slots.push({ hour, minute: 0 })
      slots.push({ hour, minute: 30 })
    }
  }
  return slots
}

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Chisinau',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const

export type Timezone = (typeof TIMEZONES)[number] | string
