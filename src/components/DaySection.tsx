import type { WeekDay, Hour, SlotKey, TimeFormat, Locale } from '../types'
import { HOURS, makeSlotKey } from '../types'
import { useLocale } from '../hooks/useLocale'
import { useTouchDragSelect } from '../hooks/useTouchDragSelect'
import { SlotButton } from './SlotButton'

type Props = {
  weekday: WeekDay
  date?: Date
  selectedSlots: Set<SlotKey>
  onToggle: (key: SlotKey) => void
  onSelect: (keys: SlotKey[]) => void
  isToday?: boolean
  timeFormat: TimeFormat
  locale: Locale
}

export function DaySection({ weekday, date, selectedSlots, onToggle, onSelect, isToday, timeFormat, locale }: Props) {
  const { formatWeekday, formatDate, formatHour } = useLocale(timeFormat, locale)
  const isWeekend = weekday === 'saturday' || weekday === 'sunday'

  const {
    draggedItems,
    registerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTouchDragSelect({
    items: HOURS,
    onToggle: (hour) => onToggle(makeSlotKey(weekday, hour)),
    onSelect: (hours) => onSelect(hours.map((h) => makeSlotKey(weekday, h))),
  })

  const label = date
    ? `${formatWeekday(weekday)} (${formatDate(date)})`
    : formatWeekday(weekday)

  const bgClass = isToday
    ? 'bg-blue-50 dark:bg-blue-900/30'
    : isWeekend
      ? 'bg-gray-50 dark:bg-gray-800/50'
      : ''

  return (
    <div className={`space-y-2 p-3 -mx-3 rounded-lg ${bgClass}`}>
      <h3 className="font-medium text-gray-900 dark:text-gray-100">{label}</h3>
      <div
        className="flex flex-wrap gap-2 select-none touch-none"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {HOURS.map((hour: Hour) => {
          const key = makeSlotKey(weekday, hour)
          return (
            <SlotButton
              key={key}
              ref={(el) => registerRef(hour, el)}
              hourLabel={formatHour(hour)}
              selected={selectedSlots.has(key)}
              isDragging={draggedItems.has(hour)}
              onTouchStart={() => handleTouchStart(hour)}
              onToggle={() => onToggle(key)}
            />
          )
        })}
      </div>
    </div>
  )
}
