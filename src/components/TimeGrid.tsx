import { useState, useCallback } from 'react'
import type { Mode, SlotKey, WeekDay, Hour } from '../types'
import { WEEKDAYS, HOURS, makeSlotKey } from '../types'
import { getWeekDates } from '../utils/dateUtils'
import { useLocale } from '../hooks/useLocale'

type Props = {
  mode: Mode
  weekStart: Date
  selectedSlots: Set<SlotKey>
  onToggle: (key: SlotKey) => void
  onSelect: (keys: SlotKey[]) => void
}

export function TimeGrid({ mode, weekStart, selectedSlots, onToggle, onSelect }: Props) {
  const { formatWeekday, formatDate, formatHour } = useLocale()
  const weekDates = mode === 'week' ? getWeekDates(weekStart) : undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isTodayIdx = weekDates?.findIndex((d) => {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  }) ?? -1

  const [dragStart, setDragStart] = useState<{ weekday: WeekDay; hour: Hour } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ weekday: WeekDay; hour: Hour } | null>(null)

  const getDragSlots = useCallback((): SlotKey[] => {
    if (!dragStart || !dragEnd) return []
    const startDayIdx = WEEKDAYS.indexOf(dragStart.weekday)
    const endDayIdx = WEEKDAYS.indexOf(dragEnd.weekday)
    const startHourIdx = HOURS.indexOf(dragStart.hour)
    const endHourIdx = HOURS.indexOf(dragEnd.hour)

    const minDay = Math.min(startDayIdx, endDayIdx)
    const maxDay = Math.max(startDayIdx, endDayIdx)
    const minHour = Math.min(startHourIdx, endHourIdx)
    const maxHour = Math.max(startHourIdx, endHourIdx)

    const slots: SlotKey[] = []
    for (let d = minDay; d <= maxDay; d++) {
      for (let h = minHour; h <= maxHour; h++) {
        slots.push(makeSlotKey(WEEKDAYS[d], HOURS[h]))
      }
    }
    return slots
  }, [dragStart, dragEnd])

  const handleMouseDown = (weekday: WeekDay, hour: Hour) => {
    setDragStart({ weekday, hour })
    setDragEnd({ weekday, hour })
  }

  const handleMouseEnter = (weekday: WeekDay, hour: Hour) => {
    if (dragStart) {
      setDragEnd({ weekday, hour })
    }
  }

  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      const slots = getDragSlots()
      if (slots.length === 1) {
        onToggle(slots[0])
      } else {
        onSelect(slots)
      }
    }
    setDragStart(null)
    setDragEnd(null)
  }

  const dragSlots = new Set(getDragSlots())

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="grid grid-cols-8 gap-1">
        <div />
        {WEEKDAYS.map((weekday, idx) => {
          const isWeekend = weekday === 'saturday' || weekday === 'sunday'
          const isToday = mode === 'week' && idx === isTodayIdx
          const headerBg = isToday
            ? 'bg-blue-50 dark:bg-blue-900/30 rounded-t-lg'
            : isWeekend
              ? 'bg-gray-50 dark:bg-gray-800/50 rounded-t-lg'
              : ''
          return (
            <div key={weekday} className={`text-center text-sm font-medium py-2 ${headerBg}`}>
              <div>{formatWeekday(weekday)}</div>
              {weekDates && (
                <div className="text-xs text-gray-500">{formatDate(weekDates[idx])}</div>
              )}
            </div>
          )
        })}

        {HOURS.map((hour) => (
          <>
            <div key={`hour-${hour}`} className="text-right text-xs text-gray-500 pr-2 py-1">
              {formatHour(hour)}
            </div>
            {WEEKDAYS.map((weekday, dayIdx) => {
              const key = makeSlotKey(weekday, hour)
              const isSelected = selectedSlots.has(key)
              const isDragging = dragSlots.has(key)
              const isWeekend = weekday === 'saturday' || weekday === 'sunday'
              const isToday = mode === 'week' && dayIdx === isTodayIdx

              return (
                <button
                  key={key}
                  type="button"
                  onMouseDown={() => handleMouseDown(weekday, hour)}
                  onMouseEnter={() => handleMouseEnter(weekday, hour)}
                  className={`
                    h-8 rounded transition-colors
                    ${isSelected
                      ? 'bg-blue-600'
                      : isDragging
                        ? 'bg-blue-300 dark:bg-blue-700'
                        : isToday
                          ? 'bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                          : isWeekend
                            ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                />
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
