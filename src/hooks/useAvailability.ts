import { useState, useCallback, useEffect } from 'react'
import type { Mode, SlotKey, TimeFormat } from '../types'
import { getMonday, addDays } from '../utils/dateUtils'
import { getUserTimezone, getUserTimeFormat } from '../utils/timezoneUtils'

const STORAGE_KEY = 'wtt-state'

type PersistedState = {
  mode: Mode
  timeFormat: TimeFormat
  targetTimezone: string
  selectedSlots: SlotKey[]
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

  useEffect(() => {
    saveState({
      mode,
      timeFormat,
      targetTimezone,
      selectedSlots: Array.from(selectedSlots),
    })
  }, [mode, timeFormat, targetTimezone, selectedSlots])

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
