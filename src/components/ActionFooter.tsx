import { useState } from 'react'
import type { SlotKey, Mode, TimeFormat } from '../types'
import { useLocale } from '../hooks/useLocale'
import { formatOutput } from '../utils/formatOutput'
import { getWeekDates } from '../utils/dateUtils'

type Props = {
  mode: Mode
  weekStart: Date
  selectedSlots: Set<SlotKey>
  onClear: () => void
  timeFormat: TimeFormat
  localTimezone: string
  targetTimezone: string
}

export function ActionFooter({ mode, weekStart, selectedSlots, onClear, timeFormat, localTimezone, targetTimezone }: Props) {
  const { t, formatWeekday, formatHour, formatDate } = useLocale(timeFormat)
  const [copied, setCopied] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const count = selectedSlots.size

  const handleCopy = async () => {
    const weekDates = mode === 'week' ? getWeekDates(weekStart) : undefined
    const text = formatOutput(selectedSlots, {
      formatWeekday,
      formatHour,
      formatDate: mode === 'week' ? formatDate : undefined,
      weekDates,
      prefix: t('output.prefix'),
      localTimezone,
      targetTimezone,
    })

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    if (count >= 10 && !confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    onClear()
    setConfirmClear(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 pt-4 safe-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {count} slot{count !== 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={count === 0}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            {confirmClear ? t('action.clearConfirm', { count }) : t('action.clear')}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={count === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {copied ? t('copied') : t('action.copy')}
          </button>
        </div>
      </div>
    </div>
  )
}
