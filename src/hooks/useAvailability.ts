import { useState, useCallback } from 'react'
import type { Mode, SlotKey, TimeFormat } from '../types'
import { getMonday, addDays } from '../utils/dateUtils'
import { getUserTimezone } from '../utils/timezoneUtils'

export function useAvailability() {
  const [mode, setMode] = useState<Mode>('week')
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [selectedSlots, setSelectedSlots] = useState<Set<SlotKey>>(new Set())
  const [localTimezone] = useState(() => getUserTimezone())
  const [targetTimezone, setTargetTimezone] = useState(() => getUserTimezone())

  const toggleSlot = useCallback((key: SlotKey) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const selectSlots = useCallback((keys: SlotKey[]) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => next.add(k))
      return next
    })
  }, [])

  const clearSlots = useCallback(() => {
    setSelectedSlots(new Set())
  }, [])

  const goToToday = useCallback(() => {
    setWeekStart(getMonday(new Date()))
  }, [])

  const goToPrev = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7))
  }, [])

  const goToNext = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7))
  }, [])

  return {
    mode,
    setMode,
    timeFormat,
    setTimeFormat,
    weekStart,
    selectedSlots,
    toggleSlot,
    selectSlots,
    clearSlots,
    goToToday,
    goToPrev,
    goToNext,
    localTimezone,
    targetTimezone,
    setTargetTimezone,
  }
}
