export type Mode = 'week' | 'generic'

export type TimeFormat = '12h' | '24h'

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type Hour = 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21

export type SlotKey = `${WeekDay}-${Hour}`

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

export function makeSlotKey(weekday: WeekDay, hour: Hour): SlotKey {
  return `${weekday}-${hour}`
}

export function parseSlotKey(key: SlotKey): { weekday: WeekDay; hour: Hour } {
  const [weekday, hourStr] = key.split('-') as [WeekDay, string]
  return { weekday, hour: parseInt(hourStr, 10) as Hour }
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
