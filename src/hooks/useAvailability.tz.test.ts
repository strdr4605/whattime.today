import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAvailability } from './useAvailability'
import { makeSlotKey } from '../types'
import { addDays, getMonday } from '../utils/dateUtils'

// West-of-UTC timezones shift `new Date('YYYY-MM-DD')` (parsed as UTC) to the
// previous day. These tests run in New York to keep that arithmetic honest.
const ORIGINAL_TZ = process.env.TZ
process.env.TZ = 'America/New_York'

afterAll(() => {
  process.env.TZ = ORIGINAL_TZ
})

beforeEach(() => {
  localStorage.clear()
})

const localDate = (key: string) => new Date(`${key}T00:00:00`)

describe('useAvailability — west-of-UTC timezones', () => {
  it('addWeek visits the Monday of the next week', () => {
    const { result } = renderHook(() => useAvailability())
    const first = result.current.currentWeekStart
    act(() => result.current.addWeek())

    const monday = getMonday(result.current.currentWeekStart)
    expect(monday.getDay()).toBe(1)
    expect(result.current.currentWeekStart.getTime()).toBe(addDays(first, 7).getTime())
  })

  it('keeps the current week on a local Monday', () => {
    const { result } = renderHook(() => useAvailability())
    const monday = result.current.currentWeekStart
    expect(monday.getDay()).toBe(1)
    expect(monday.getHours()).toBe(0)
    expect(monday.getDate()).toBe(getMonday(new Date()).getDate())
  })

  it('goToPrev returns from an added week to the first week', () => {
    const { result } = renderHook(() => useAvailability())
    const first = result.current.currentWeekStart
    act(() => result.current.addWeek())
    act(() => result.current.goToPrev())

    expect(result.current.currentWeekStart.getTime()).toBe(first.getTime())
    expect(result.current.weekSelections).toHaveLength(0)
  })

  it('goToPrev stops on the current week', () => {
    const { result } = renderHook(() => useAvailability())
    const first = result.current.currentWeekStart
    act(() => result.current.goToPrev())

    expect(result.current.currentWeekStart.getTime()).toBe(first.getTime())
  })

  it('stores a picked slot under the Monday of the visited week', () => {
    const { result } = renderHook(() => useAvailability())
    act(() => result.current.addWeek())
    act(() => result.current.toggleSlot(makeSlotKey('monday', 10, 0)))

    expect(result.current.weekSelections).toHaveLength(1)
    expect(localDate(result.current.weekSelections[0].weekStart).getDay()).toBe(1)
  })
})
