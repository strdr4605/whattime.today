import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Mode, SlotKey, TimeFormat, Locale, Interval, WeekSelection } from '../types'
import { weekSelectionKey, isValidSlotKey } from '../types'
import { getMonday, addDays, parseLocalDate, isValidDateKey } from '../utils/dateUtils'
import { getUserTimezone, getUserTimeFormat } from '../utils/timezoneUtils'
import { getUserLocale } from './useLocale'

const STORAGE_KEY = 'wtt-state'

type PersistedState = {
  mode: Mode
  timeFormat: TimeFormat
  targetTimezone: string
  locale: Locale
  interval: Interval
  appendLink: boolean
  weekSelections: WeekSelection[]
  currentWeekStart: string
  // Legacy field (read-only on load):
  selectedSlots?: SlotKey[]
}

function loadState(): Partial<PersistedState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Partial<PersistedState>
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

// Keeps only usable weeks that still hold slots and normalizes every key to its Monday.
function sanitizeWeekSelections(raw: unknown): WeekSelection[] {
  if (!Array.isArray(raw)) return []

  const byKey = new Map<string, WeekSelection>()

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { weekStart, slots } = item as { weekStart?: unknown; slots?: unknown }
    if (typeof weekStart !== 'string' || !isValidDateKey(weekStart)) continue

    const key = weekSelectionKey(getMonday(parseLocalDate(weekStart)))
    const validSlots = Array.isArray(slots)
      ? Array.from(new Set(slots.filter((slot): slot is SlotKey => isValidSlotKey(slot))))
      : []

    const existing = byKey.get(key)
    if (existing) {
      existing.slots = Array.from(new Set([...existing.slots, ...validSlots]))
    } else {
      byKey.set(key, { weekStart: key, slots: validSlots })
    }
  }

  return [...byKey.values()]
    .filter((week) => week.slots.length > 0)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

function currentMondayKey(): string {
  return weekSelectionKey(getMonday(new Date()))
}

function initialWeekSelections(persisted: Partial<PersistedState>): WeekSelection[] {
  const weeks = sanitizeWeekSelections(persisted.weekSelections)
  if (weeks.length > 0) return weeks

  // Migrate legacy shape
  const legacy = persisted.selectedSlots
  if (Array.isArray(legacy) && legacy.length > 0) {
    const slots = Array.from(new Set(legacy.filter((slot): slot is SlotKey => isValidSlotKey(slot))))
    if (slots.length > 0) return [{ weekStart: currentMondayKey(), slots }]
  }

  return []
}

function initialCurrentWeek(persisted: Partial<PersistedState>): string {
  const saved = persisted.currentWeekStart
  if (typeof saved === 'string' && isValidDateKey(saved)) {
    return weekSelectionKey(getMonday(parseLocalDate(saved)))
  }

  // Fall back to this week so a reload always opens on the current week.
  return currentMondayKey()
}

export function useAvailability() {
  const [persisted] = useState(loadState)
  const [mode, setMode] = useState<Mode>(() => persisted.mode ?? 'week')
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => persisted.timeFormat ?? getUserTimeFormat())
  const [weekSelections, setWeekSelections] = useState<WeekSelection[]>(() => initialWeekSelections(persisted))
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => initialCurrentWeek(persisted))
  const [localTimezone] = useState(() => getUserTimezone())
  const [targetTimezone, setTargetTimezone] = useState(() => persisted.targetTimezone ?? getUserTimezone())
  const [locale, setLocale] = useState<Locale>(() => persisted.locale ?? getUserLocale())
  const [interval, setInterval] = useState<Interval>(() => persisted.interval ?? '1h')
  const [appendLink, setAppendLink] = useState<boolean>(() => persisted.appendLink ?? false)

  // Derived current-week slots for the picker
  const currentWeekSlots = useMemo(() => {
    const found = weekSelections.find((w) => w.weekStart === currentWeekStart)
    return new Set(found?.slots ?? [])
  }, [weekSelections, currentWeekStart])

  const totalSelectedCount = useMemo(
    () => weekSelections.reduce((sum, w) => sum + w.slots.length, 0),
    [weekSelections]
  )

  const ensureWeek = useCallback((selections: WeekSelection[], weekStart: string): WeekSelection[] => {
    if (selections.some((w) => w.weekStart === weekStart)) return selections
    const next = [...selections, { weekStart, slots: [] }]
    next.sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    return next
  }, [])

  const updateCurrentWeekSlots = useCallback(
    (mutator: (prev: Set<SlotKey>) => Set<SlotKey>) => {
      setWeekSelections((prev) => {
        const withWeek = ensureWeek(prev, currentWeekStart)
        const idx = withWeek.findIndex((w) => w.weekStart === currentWeekStart)
        const current = withWeek[idx]
        const nextSet = mutator(new Set(current.slots))
        const updated = { weekStart: current.weekStart, slots: Array.from(nextSet) }
        const out = withWeek.slice()
        out[idx] = updated
        // A week without slots is not kept.
        return out.filter((week) => week.slots.length > 0)
      })
    },
    [currentWeekStart, ensureWeek]
  )

  useEffect(() => {
    saveState({
      mode,
      timeFormat,
      targetTimezone,
      locale,
      interval,
      appendLink,
      weekSelections,
      currentWeekStart,
    })
  }, [mode, timeFormat, targetTimezone, locale, interval, appendLink, weekSelections, currentWeekStart])

  const toggleSlot = useCallback(
    (key: SlotKey) => {
      updateCurrentWeekSlots((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    },
    [updateCurrentWeekSlots]
  )

  const selectSlots = useCallback(
    (keys: SlotKey[]) => {
      updateCurrentWeekSlots((prev) => {
        const next = new Set(prev)
        keys.forEach((k) => next.add(k))
        return next
      })
    },
    [updateCurrentWeekSlots]
  )

  const clearSlots = useCallback(() => {
    // Clearing leaves no slots, so no week is kept.
    setWeekSelections([])
  }, [])

  const goToToday = useCallback(() => {
    setCurrentWeekStart(currentMondayKey())
  }, [])

  const canGoPrev = parseLocalDate(currentWeekStart).getTime() > getMonday(new Date()).getTime()

  const goToPrev = useCallback(() => {
    const currentMonday = getMonday(new Date())
    const previous = addDays(parseLocalDate(currentWeekStart), -7)
    if (previous.getTime() < currentMonday.getTime()) return
    setCurrentWeekStart(weekSelectionKey(previous))
  }, [currentWeekStart])

  const addWeek = useCallback(() => {
    setCurrentWeekStart(weekSelectionKey(addDays(parseLocalDate(currentWeekStart), 7)))
  }, [currentWeekStart])

  const setCurrentWeek = useCallback((weekStart: string) => {
    setCurrentWeekStart(weekStart)
  }, [])

  return {
    mode,
    setMode,
    timeFormat,
    setTimeFormat,
    currentWeekStart: parseLocalDate(currentWeekStart),
    currentWeekSlots,
    weekSelections,
    totalSelectedCount,
    toggleSlot,
    selectSlots,
    clearSlots,
    goToToday,
    goToPrev,
    goToNext: addWeek,
    addWeek,
    setCurrentWeek,
    canGoPrev,
    localTimezone,
    targetTimezone,
    setTargetTimezone,
    locale,
    setLocale,
    interval,
    setInterval,
    appendLink,
    setAppendLink,
  }
}
