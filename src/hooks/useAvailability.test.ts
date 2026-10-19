import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAvailability } from './useAvailability'
import { makeSlotKey, weekSelectionKey } from '../types'
import { addDays, getMonday, parseLocalDate } from '../utils/dateUtils'

const STORAGE_KEY = 'wtt-state'

const localDate = (key: string) => new Date(`${key}T00:00:00`)

beforeEach(() => {
  localStorage.clear()
})

describe('useAvailability — multi-week', () => {
  it('starts without stored weeks', () => {
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections).toHaveLength(0)
    expect(result.current.currentWeekSlots.size).toBe(0)
    expect(result.current.totalSelectedCount).toBe(0)
  })

  it('toggleSlot stores the current week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    expect(result.current.currentWeekSlots.size).toBe(1)
    expect(result.current.totalSelectedCount).toBe(1)
    expect(result.current.weekSelections[0].slots).toEqual(['monday-10-0'])
  })

  it('addWeek moves to the next Monday without storing an empty week', () => {
    const { result } = renderHook(() => useAvailability())
    const start = result.current.currentWeekStart
    act(() => result.current.addWeek())
    expect(result.current.weekSelections).toHaveLength(0)
    expect(result.current.currentWeekStart.getTime()).toBe(addDays(start, 7).getTime())
    expect(result.current.currentWeekSlots.size).toBe(0)
  })

  it('addWeek visits a Monday key', () => {
    const { result } = renderHook(() => useAvailability())
    const start = result.current.currentWeekStart
    act(() => result.current.addWeek())
    expect(localDate(weekSelectionKey(getMonday(result.current.currentWeekStart))).getDay()).toBe(1)
    expect(result.current.currentWeekStart.getTime()).toBe(addDays(start, 7).getTime())
  })

  it('addWeek twice visits two Mondays', () => {
    const { result } = renderHook(() => useAvailability())
    const start = result.current.currentWeekStart
    act(() => result.current.addWeek())
    act(() => result.current.addWeek())
    expect(result.current.currentWeekStart.getTime()).toBe(addDays(start, 14).getTime())
  })

  it('setCurrentWeek switches back to a previously visited week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    const firstKey = result.current.weekSelections[0].weekStart
    act(() => result.current.addWeek())
    act(() => result.current.setCurrentWeek(firstKey))
    expect(result.current.currentWeekSlots.has(makeSlotKey('monday', 10, 0))).toBe(true)
    expect(result.current.totalSelectedCount).toBe(1)
  })

  it('does not duplicate a stored week when revisiting', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    act(() => result.current.addWeek())
    act(() => result.current.toggleSlot(makeSlotKey('tuesday', 14, 0)))
    expect(result.current.weekSelections).toHaveLength(2)

    act(() => result.current.goToNext())
    expect(result.current.weekSelections).toHaveLength(2)
    act(() => result.current.goToPrev())
    expect(result.current.weekSelections).toHaveLength(2)
    act(() => result.current.goToNext())
    expect(result.current.weekSelections).toHaveLength(2)
  })

  it('goToPrev moves back without losing the stored week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    const firstKey = result.current.weekSelections[0].weekStart
    act(() => result.current.addWeek())
    act(() => result.current.toggleSlot(makeSlotKey('tuesday', 14, 0)))
    act(() => result.current.goToPrev())

    expect(result.current.weekSelections).toHaveLength(2)
    expect(result.current.currentWeekStart.getTime()).toBe(parseLocalDate(firstKey).getTime())
  })

  it('goToPrev moves to the previous Monday', () => {
    const { result } = renderHook(() => useAvailability())
    const start = result.current.currentWeekStart
    act(() => result.current.addWeek())
    act(() => result.current.goToPrev())
    expect(result.current.currentWeekStart.getTime()).toBe(start.getTime())
    expect(localDate(weekSelectionKey(getMonday(result.current.currentWeekStart))).getDay()).toBe(1)
  })

  it('goToPrev stops on the current week', () => {
    const { result } = renderHook(() => useAvailability())
    const start = result.current.currentWeekStart
    act(() => result.current.goToPrev())
    expect(result.current.currentWeekStart.getTime()).toBe(start.getTime())
    expect(result.current.weekSelections).toHaveLength(0)
  })

  it('clearSlots removes every week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    act(() => result.current.addWeek())
    act(() => result.current.toggleSlot(makeSlotKey('tuesday', 14, 0)))
    expect(result.current.totalSelectedCount).toBe(2)
    act(() => result.current.clearSlots())
    expect(result.current.totalSelectedCount).toBe(0)
    expect(result.current.weekSelections).toHaveLength(0)
  })

  it('drops a week when its last slot is removed', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    expect(result.current.weekSelections).toHaveLength(1)
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    expect(result.current.weekSelections).toHaveLength(0)
    expect(result.current.totalSelectedCount).toBe(0)
  })

  it('removes only the empty week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    act(() => result.current.addWeek())
    act(() => result.current.toggleSlot(makeSlotKey('tuesday', 14, 0)))
    expect(result.current.weekSelections).toHaveLength(2)

    act(() => result.current.goToPrev())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    expect(result.current.weekSelections).toHaveLength(1)
    expect(result.current.weekSelections[0].slots).toEqual(['tuesday-14-0'])
  })

  it('persists weekSelections to localStorage', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(Array.isArray(stored.weekSelections)).toBe(true)
    expect(stored.weekSelections[0].slots).toEqual(['monday-10-0'])
  })

  it('persists the visited week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.addWeek())
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.currentWeekStart).toBe(weekSelectionKey(getMonday(result.current.currentWeekStart)))
  })

  it('keeps the week list in chronological order', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.addWeek())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    act(() => result.current.goToPrev())
    act(() => result.current.toggleSlot(makeSlotKey('tuesday', 14, 0)))
    const keys = result.current.weekSelections.map((w) => w.weekStart)
    expect(keys).toHaveLength(2)
    expect([...keys].sort()).toEqual(keys)
  })

  it('stores a week when a slot is toggled', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode: 'week', weekSelections: [{ weekStart: '2025-01-06', slots: [] }] })
    )
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))
    expect(result.current.weekSelections).toHaveLength(1)
    expect(result.current.totalSelectedCount).toBe(1)
  })

  it('migrates legacy selectedSlots (flat array) into weekSelections on load', () => {
    const legacy = {
      mode: 'week',
      timeFormat: '12h',
      targetTimezone: 'UTC',
      selectedSlots: ['monday-10-0', 'tuesday-14-0'],
      locale: 'en',
      interval: '1h',
      appendLink: false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections).toHaveLength(1)
    expect(result.current.weekSelections[0].slots.sort()).toEqual(['monday-10-0', 'tuesday-14-0'].sort())
  })

  it('falls back to empty state if storage is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections).toHaveLength(0)
    expect(result.current.totalSelectedCount).toBe(0)
  })

  it('falls back to empty state if storage holds a null payload', () => {
    localStorage.setItem(STORAGE_KEY, 'null')
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections).toHaveLength(0)
    expect(result.current.totalSelectedCount).toBe(0)
  })

  it('ignores a malformed weekSelections value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: 'week', weekSelections: 'not-an-array' }))
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections).toHaveLength(0)
    expect(result.current.totalSelectedCount).toBe(0)
  })

  it('drops malformed week entries', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: 'week',
        weekSelections: [
          { weekStart: 'not-a-date', slots: ['monday-10-0'] },
          { weekStart: '2025-01-06', slots: 'bogus' },
          { weekStart: '2025-01-13', slots: ['monday-10-0', 'monday-10-0', 'nonsense'] },
        ],
      })
    )
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections.map((w) => w.weekStart)).toEqual(['2025-01-13'])
    expect(result.current.weekSelections[0].slots).toEqual(['monday-10-0'])
  })

  it('restores the persisted weeks and the visited week on reload', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: 'week',
        weekSelections: [
          { weekStart: '2025-01-06', slots: ['monday-10-0'] },
          { weekStart: '2025-01-13', slots: ['tuesday-14-0'] },
        ],
        currentWeekStart: '2025-01-13',
      })
    )
    const { result } = renderHook(() => useAvailability())
    expect(result.current.weekSelections).toHaveLength(2)
    expect(result.current.currentWeekStart.getTime()).toBe(parseLocalDate('2025-01-13').getTime())
    expect(result.current.currentWeekSlots.has('tuesday-14-0')).toBe(true)
  })

  it('restores the visited week even when it has no slots', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: 'week',
        weekSelections: [{ weekStart: '2025-01-06', slots: ['monday-10-0'] }],
        currentWeekStart: '2025-01-13',
      })
    )
    const { result } = renderHook(() => useAvailability())
    expect(result.current.currentWeekStart.getTime()).toBe(parseLocalDate('2025-01-13').getTime())
    expect(result.current.currentWeekSlots.size).toBe(0)
  })

  it('falls back to the current week when the persisted visited week is broken', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: 'week',
        weekSelections: [{ weekStart: '2025-01-06', slots: [] }],
        currentWeekStart: 'not-a-date',
      })
    )
    const { result } = renderHook(() => useAvailability())
    expect(result.current.currentWeekStart.getTime()).toBe(getMonday(new Date()).getTime())
    expect(result.current.weekSelections).toHaveLength(0)
  })
})
