import type { Mode, TimeFormat, Locale, Interval, WeekSelection, SlotKey } from '../types'
import { useLocale } from '../hooks/useLocale'
import { formatOutput, formatOutputMultiWeek } from '../utils/formatOutput'

type Props = {
  mode: Mode
  weekSelections: WeekSelection[]
  currentWeekSlots: Set<SlotKey>
  timeFormat: TimeFormat
  locale: Locale
  localTimezone: string
  targetTimezone: string
  interval: Interval
  appendLink: boolean
}

export function OutputPreview({
  mode,
  weekSelections,
  currentWeekSlots,
  timeFormat,
  locale,
  localTimezone,
  targetTimezone,
  interval,
  appendLink,
}: Props) {
  const { t, formatWeekday, formatTime, formatDate, formatWeekLabel } = useLocale(timeFormat, locale)

  const linkUrl = appendLink ? window.location.origin + window.location.pathname : undefined
  const totalSlots = weekSelections.reduce((s, w) => s + w.slots.length, 0)
  const text = mode === 'week'
    ? formatOutputMultiWeek(weekSelections, {
        formatWeekday,
        formatTime,
        formatDate,
        weekLabel: formatWeekLabel,
        prefix: t('output.prefix'),
        localTimezone,
        targetTimezone,
        interval,
        appendLink: linkUrl,
      })
    : formatOutput(currentWeekSlots, {
        formatWeekday,
        formatTime,
        prefix: t('output.prefix'),
        localTimezone,
        targetTimezone,
        interval,
        appendLink: linkUrl,
      })

  if (totalSlots === 0) {
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
