import { TIMEZONES } from '../types'
import { getTimezoneAbbr } from '../utils/timezoneUtils'

type Props = {
  localTimezone: string
  targetTimezone: string
  onChange: (tz: string) => void
}

export function TimezoneSelect({ localTimezone, targetTimezone, onChange }: Props) {
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
          {tz === localTimezone ? ' (You)' : ''}
        </option>
      ))}
    </select>
  )
}
