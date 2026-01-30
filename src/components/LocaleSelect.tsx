import type { Locale } from '../types'
import { LOCALES } from '../types'

type Props = {
  locale: Locale
  onChange: (locale: Locale) => void
}

export function LocaleSelect({ locale, onChange }: Props) {
  return (
    <select
      value={locale}
      onChange={(e) => onChange(e.target.value as Locale)}
      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 border-none cursor-pointer"
    >
      {LOCALES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  )
}
