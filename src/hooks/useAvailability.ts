import { useState, useCallback, useEffect } from 'react'
import type { Mode, SlotKey, TimeFormat, Locale } from '../types'
import { getMonday, addDays } from '../utils/dateUtils'
import { getUserTimezone, getUserTimeFormat } from '../utils/timezoneUtils'
import { getUserLocale } from './useLocale'

const STORAGE_KEY = 'wtt-state'

type PersistedState = {
  mode: Mode
  timeFormat: TimeFormat
  targetTimezone: string
  selectedSlots: SlotKey[]
  locale: Locale
}

function loadState(): Partial<PersistedState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function useAvailability() {
  const [mode, setMode] = useState<Mode>(() => loadState().mode ?? 'week')
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => loadState().timeFormat ?? getUserTimeFormat())
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [selectedSlots, setSelectedSlots] = useState<Set<SlotKey>>(() => new Set(loadState().selectedSlots ?? []))
  const [localTimezone] = useState(() => getUserTimezone())
  const [targetTimezone, setTargetTimezone] = useState(() => loadState().targetTimezone ?? getUserTimezone())
  const [locale, setLocale] = useState<Locale>(() => loadState().locale ?? getUserLocale())

  useEffect(() => {
    saveState({
      mode,
      timeFormat,
      targetTimezone,
      selectedSlots: Array.from(selectedSlots),
      locale,
    })
  }, [mode, timeFormat, targetTimezone, selectedSlots, locale])

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

  const currentWeekStart = getMonday(new Date())

  const canGoPrev = weekStart.getTime() > currentWeekStart.getTime()

  const goToPrev = useCallback(() => {
    const current = getMonday(new Date())
    setWeekStart((prev) => {
      const newWeek = addDays(prev, -7)
      return newWeek.getTime() >= current.getTime() ? newWeek : prev
    })
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
    canGoPrev,
    localTimezone,
    targetTimezone,
    setTargetTimezone,
    locale,
    setLocale,
  }
}
