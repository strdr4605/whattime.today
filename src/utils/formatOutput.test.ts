import { describe, it, expect } from 'vitest'
import { formatOutput, formatOutputMultiWeek } from './formatOutput'
import type { SlotKey, WeekSelection } from '../types'
import { makeSlotKey } from '../types'

const NOOP_FORMAT_WEEKDAY = (w: string) => w
const NOOP_FORMAT_TIME = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`
const NOOP_FORMAT_DATE = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`

const baseOpts = {
  prefix: 'PFX',
  interval: '1h' as const,
}

describe('formatOutput', () => {
  it('returns empty string when no slots', () => {
    expect(
      formatOutput(new Set(), { ...baseOpts, formatWeekday: NOOP_FORMAT_WEEKDAY, formatTime: NOOP_FORMAT_TIME })
    ).toBe('')
  })

  it('groups by weekday in order', () => {
    const slots: Set<SlotKey> = new Set([
      makeSlotKey('wednesday', 10, 0),
      makeSlotKey('monday', 14, 0),
    ])
    const out = formatOutput(slots, { ...baseOpts, formatWeekday: NOOP_FORMAT_WEEKDAY, formatTime: NOOP_FORMAT_TIME })
    expect(out).toBe('PFX\nmonday: 14:00-15:00\nwednesday: 10:00-11:00')
  })
})

describe('formatOutputMultiWeek', () => {
  const ws1 = '2025-01-06' // Monday
  const ws2 = '2025-01-13' // next Monday

  it('returns empty string when total slots across all weeks is zero', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [] },
      { weekStart: ws2, slots: [] },
    ]
    expect(
      formatOutputMultiWeek(weeks, { ...baseOpts, formatWeekday: NOOP_FORMAT_WEEKDAY, formatTime: NOOP_FORMAT_TIME })
    ).toBe('')
  })

  it('separates week blocks by a blank line', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('tuesday', 14, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
    })
    expect(out).toBe('PFX\n\nmonday: 10:00-11:00\n\ntuesday: 14:00-15:00')
  })

  it('prints the prefix only once', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('tuesday', 14, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
    })
    expect(out.match(/PFX/g)).toHaveLength(1)
  })

  it('labels each week block with a human period', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('tuesday', 14, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
      weekLabel: (monday) => (monday.getTime() === new Date(2025, 0, 6).getTime() ? 'This week' : 'Next week'),
    })
    expect(out).toBe('PFX\n\nThis week:\nmonday: 10:00-11:00\n\nNext week:\ntuesday: 14:00-15:00')
  })

  it('appends the share link once at the end', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('tuesday', 14, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
      appendLink: 'https://example.com/app',
    })
    expect(out.endsWith('\n\nhttps://example.com/app')).toBe(true)
    expect(out.match(/https:\/\/example.com\/app/g)).toHaveLength(1)
  })

  it('emits a single block when only one week has slots', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [] },
      { weekStart: ws2, slots: [makeSlotKey('tuesday', 14, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
    })
    expect(out).toBe('PFX\ntuesday: 14:00-15:00')
  })

  it('does not put a trailing blank line after the last block', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('tuesday', 14, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
    })
    expect(out.endsWith('\n')).toBe(false)
    expect(out.endsWith('\n\n')).toBe(false)
  })

  it('preserves single-week output as a single block with prefix', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
    })
    expect(out).toBe('PFX\nmonday: 10:00-11:00')
  })

  it('labels every day with its date so weeks stay distinguishable', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
      formatDate: NOOP_FORMAT_DATE,
    })
    expect(out).toBe('PFX\nmonday (1/6): 10:00-11:00')
  })

  it('converts times to the target timezone for every week', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('monday', 10, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
      formatDate: NOOP_FORMAT_DATE,
      localTimezone: 'America/New_York',
      targetTimezone: 'Asia/Tokyo',
    })
    // Monday 10:00 in New York is Tuesday 00:00 in Tokyo
    expect(out).toContain('tuesday (1/7): 0:00-1:00 GMT+9')
    expect(out).toContain('tuesday (1/14): 0:00-1:00 GMT+9')
  })

  it('orders week blocks chronologically regardless of input order', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws2, slots: [makeSlotKey('monday', 14, 0)] },
      { weekStart: ws1, slots: [makeSlotKey('monday', 10, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
      formatDate: NOOP_FORMAT_DATE,
    })
    expect(out).toBe('PFX\n\nmonday (1/6): 10:00-11:00\n\nmonday (1/13): 14:00-15:00')
  })

  it('keeps a slot in its own week block when the conversion crosses midnight', () => {
    const weeks: WeekSelection[] = [
      { weekStart: ws1, slots: [makeSlotKey('monday', 7, 0)] },
      { weekStart: ws2, slots: [makeSlotKey('monday', 20, 0)] },
    ]
    const out = formatOutputMultiWeek(weeks, {
      ...baseOpts,
      formatWeekday: NOOP_FORMAT_WEEKDAY,
      formatTime: NOOP_FORMAT_TIME,
      formatDate: NOOP_FORMAT_DATE,
      localTimezone: 'Pacific/Auckland',
      targetTimezone: 'America/New_York',
    })
    const blocks = out.split('\n\n')
    // the prefix is the first section, one section per week follows
    expect(blocks).toHaveLength(3)
    expect(blocks[0]).toBe('PFX')
    expect(blocks[1]).toContain('sunday')
    expect(blocks[2]).toContain('monday')
  })
})