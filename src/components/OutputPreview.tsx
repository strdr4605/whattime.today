import type { SlotKey, Mode, TimeFormat, Locale, Interval } from '../types'
import { useLocale } from '../hooks/useLocale'
import { formatOutput } from '../utils/formatOutput'
import { getWeekDates } from '../utils/dateUtils'

type Props = {
  mode: Mode
  weekStart: Date
  selectedSlots: Set<SlotKey>
  timeFormat: TimeFormat
  locale: Locale
  localTimezone: string
  targetTimezone: string
  interval: Interval
  appendLink: boolean
}

export function OutputPreview({
  mode,
  weekStart,
  selectedSlots,
  timeFormat,
  locale,
  localTimezone,
  targetTimezone,
  interval,
  appendLink,
}: Props) {
  const { t, formatWeekday, formatTime, formatDate } = useLocale(timeFormat, locale)

  const weekDates = mode === 'week' ? getWeekDates(weekStart) : undefined
  const linkUrl = appendLink ? window.location.origin + window.location.pathname : undefined
  const text = formatOutput(selectedSlots, {
    formatWeekday,
    formatTime,
    formatDate: mode === 'week' ? formatDate : undefined,
    weekDates,
    prefix: t('output.prefix'),
    localTimezone,
    targetTimezone,
    interval,
    appendLink: linkUrl,
  })

  if (selectedSlots.size === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          {t('preview.empty')}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
        {text}
      </pre>
    </div>
  )
}
