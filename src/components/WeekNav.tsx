import type { Locale } from '../types'
import { useLocale } from '../hooks/useLocale'
import { addDays } from '../utils/dateUtils'

type Props = {
  weekStart: Date
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  locale: Locale
}

export function WeekNav({ weekStart, onToday, onPrev, onNext, canGoPrev, locale }: Props) {
  const { t, formatDate } = useLocale('12h', locale)
  const weekEnd = addDays(weekStart, 6)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToday}
        className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {t('nav.today')}
      </button>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('nav.back')}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {t('nav.next')}
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatDate(weekStart)} - {formatDate(weekEnd)}
      </span>
    </div>
  )
}
