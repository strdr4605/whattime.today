import { TIMEZONES, type Locale } from '../types'
import { getTimezoneAbbr } from '../utils/timezoneUtils'
import { useLocale } from '../hooks/useLocale'

type Props = {
  localTimezone: string
  targetTimezone: string
  onChange: (tz: string) => void
  locale: Locale
}

export function TimezoneSelect({ localTimezone, targetTimezone, onChange, locale }: Props) {
  const { t } = useLocale('12h', locale)
  const timezoneList = [
    localTimezone,
    ...TIMEZONES.filter((tz) => tz !== localTimezone),
  ]

  return (
    <select
      value={targetTimezone}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 border-none cursor-pointer"
    >
      {timezoneList.map((tz) => (
        <option key={tz} value={tz}>
          {getTimezoneAbbr(tz)} - {tz}
          {tz === localTimezone ? ` ${t('timezone.you')}` : ''}
        </option>
      ))}
    </select>
  )
}
