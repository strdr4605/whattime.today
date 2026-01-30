import type { Mode, SlotKey, TimeFormat, Locale } from '../types'
import { WEEKDAYS } from '../types'
import { getWeekDates } from '../utils/dateUtils'
import { DaySection } from './DaySection'

type Props = {
  mode: Mode
  weekStart: Date
  selectedSlots: Set<SlotKey>
  onToggle: (key: SlotKey) => void
  onSelect: (keys: SlotKey[]) => void
  timeFormat: TimeFormat
  locale: Locale
}

export function TimeList({ mode, weekStart, selectedSlots, onToggle, onSelect, timeFormat, locale }: Props) {
  const weekDates = mode === 'week' ? getWeekDates(weekStart) : undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = (date?: Date) => {
    if (!date) return false
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }

  return (
    <div className="space-y-6">
      {WEEKDAYS.map((weekday, idx) => (
        <DaySection
          key={weekday}
          weekday={weekday}
          date={weekDates?.[idx]}
          selectedSlots={selectedSlots}
          onToggle={onToggle}
          onSelect={onSelect}
          isToday={mode === 'week' && isToday(weekDates?.[idx])}
          timeFormat={timeFormat}
          locale={locale}
        />
      ))}
    </div>
  )
}
