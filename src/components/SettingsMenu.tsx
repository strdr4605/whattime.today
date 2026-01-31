import { useState, useRef, useEffect } from 'react'
import type { Mode, TimeFormat, Locale, Interval } from '../types'
import { useLocale } from '../hooks/useLocale'
import { TimezoneSelect } from './TimezoneSelect'
import { TimeFormatToggle } from './TimeFormatToggle'
import { ModeToggle } from './ModeToggle'
import { LocaleSelect } from './LocaleSelect'
import { IntervalToggle } from './IntervalToggle'
import { AboutModal } from './AboutModal'

type Props = {
  localTimezone: string
  targetTimezone: string
  onTimezoneChange: (tz: string) => void
  timeFormat: TimeFormat
  onTimeFormatChange: (format: TimeFormat) => void
  mode: Mode
  onModeChange: (mode: Mode) => void
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  interval: Interval
  onIntervalChange: (interval: Interval) => void
}

export function SettingsMenu({
  localTimezone,
  targetTimezone,
  onTimezoneChange,
  timeFormat,
  onTimeFormatChange,
  mode,
  onModeChange,
  locale,
  onLocaleChange,
  interval,
  onIntervalChange,
}: Props) {
  const { t } = useLocale(timeFormat, locale)
  const [open, setOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        aria-label={t('settings.ariaLabel')}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 z-50">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('settings.timezone')}</label>
            <TimezoneSelect
              localTimezone={localTimezone}
              targetTimezone={targetTimezone}
              onChange={onTimezoneChange}
              locale={locale}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('settings.timeFormat')}</label>
            <TimeFormatToggle timeFormat={timeFormat} onChange={onTimeFormatChange} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('settings.interval')}</label>
            <IntervalToggle interval={interval} onChange={onIntervalChange} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('settings.view')}</label>
            <ModeToggle mode={mode} onChange={onModeChange} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('settings.language')}</label>
            <LocaleSelect locale={locale} onChange={onLocaleChange} />
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { setAboutOpen(true); setOpen(false) }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('settings.about')}
            </button>
          </div>
        </div>
      )}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} locale={locale} />
    </div>
  )
}
