import { useMemo } from 'react'
import en from '../locales/en.json'
import ro from '../locales/ro.json'
import ru from '../locales/ru.json'
import type { WeekDay, Hour, TimeFormat, Locale } from '../types'

type TranslationKey = keyof typeof en

const translations: Record<Locale, typeof en> = { en, ro, ru }

export function useLocale(timeFormat: TimeFormat = '12h', locale: Locale = 'en') {
  const messages = translations[locale]

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = messages[key] || en[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }

  const formatters = useMemo(
    () => ({
      date: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      hour12: new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true }),
      hour24: new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: false }),
    }),
    [locale]
  )

  const formatDate = (date: Date): string => formatters.date.format(date)

  const formatWeekday = (weekday: WeekDay, format: 'short' | 'long' = 'short'): string => {
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(weekday)
    const date = new Date(2024, 0, 1 + dayIndex) // Jan 1, 2024 was Monday
    const formatted = format === 'short' ? formatters.weekdayShort.format(date) : formatters.weekdayLong.format(date)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const formatHour = (hour: Hour): string => {
    if (timeFormat === '24h') {
      return `${hour}:00`
    }
    const date = new Date(2024, 0, 1, hour)
    return formatters.hour12.format(date).toLowerCase().replace(' ', '')
  }

  return { t, formatDate, formatWeekday, formatHour, locale }
}

export function getUserLocale(): Locale {
  const lang = navigator.language.split('-')[0]
  if (lang === 'ro') return 'ro'
  if (lang === 'ru') return 'ru'
  return 'en'
}
