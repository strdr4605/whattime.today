import { useMemo } from 'react'
import en from '../locales/en.json'
import es from '../locales/es.json'
import zh from '../locales/zh.json'
import fr from '../locales/fr.json'
import de from '../locales/de.json'
import pt from '../locales/pt.json'
import ro from '../locales/ro.json'
import ru from '../locales/ru.json'
import type { WeekDay, Hour, TimeFormat, Locale, Minute } from '../types'
import { addDays, getMonday } from '../utils/dateUtils'

type TranslationKey = keyof typeof en

const translations: Record<Locale, typeof en> = { en, es, zh, fr, de, pt, ro, ru }

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

  // Human period for a week: "This week", "Next week", "Last week".
  // Weeks further away fall back to their date range.
  const formatWeekLabel = (monday: Date): string => {
    const days = Math.round((monday.getTime() - getMonday(new Date()).getTime()) / 86400000)
    const weeks = days / 7
    const range = `${formatDate(monday)} - ${formatDate(addDays(monday, 6))}`

    if (weeks === 0) return `${t('output.week.this')} (${range})`
    if (weeks === 1) return `${t('output.week.next')} (${range})`
    if (weeks === -1) return `${t('output.week.last')} (${range})`
    return range
  }

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

  const formatTime = (hour: Hour, minute: Minute): string => {
    if (timeFormat === '24h') {
      return `${hour}:${minute.toString().padStart(2, '0')}`
    }
    const date = new Date(2024, 0, 1, hour, minute)
    return formatters.hour12.format(date).toLowerCase().replace(' ', '')
  }

  return { t, formatDate, formatWeekLabel, formatWeekday, formatHour, formatTime, locale }
}

export function getUserLocale(): Locale {
  const lang = navigator.language.split('-')[0]
  if (lang === 'es') return 'es'
  if (lang === 'zh') return 'zh'
  if (lang === 'fr') return 'fr'
  if (lang === 'de') return 'de'
  if (lang === 'pt') return 'pt'
  if (lang === 'ro') return 'ro'
  if (lang === 'ru') return 'ru'
  return 'en'
}
