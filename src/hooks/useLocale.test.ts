import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLocale } from './useLocale'
import { addDays, getMonday } from '../utils/dateUtils'

const renderLocale = () => renderHook(() => useLocale('24h', 'en')).result.current

describe('useLocale — week labels', () => {
  it('names the current week', () => {
    const { formatWeekLabel } = renderLocale()
    const monday = getMonday(new Date())
    expect(formatWeekLabel(monday)).toMatch(/^This week \(/)
  })

  it('names the next week', () => {
    const { formatWeekLabel } = renderLocale()
    const monday = addDays(getMonday(new Date()), 7)
    expect(formatWeekLabel(monday)).toMatch(/^Next week \(/)
  })

  it('names the last week', () => {
    const { formatWeekLabel } = renderLocale()
    const monday = addDays(getMonday(new Date()), -7)
    expect(formatWeekLabel(monday)).toMatch(/^Last week \(/)
  })

  it('falls back to the date range for weeks further away', () => {
    const { formatWeekLabel } = renderLocale()
    const monday = addDays(getMonday(new Date()), 21)
    expect(formatWeekLabel(monday)).not.toMatch(/week/i)
    expect(formatWeekLabel(monday)).toContain('-')
  })

  it('includes the week range', () => {
    const { formatWeekLabel, formatDate } = renderLocale()
    const monday = getMonday(new Date())
    expect(formatWeekLabel(monday)).toContain(`${formatDate(monday)} - ${formatDate(addDays(monday, 6))}`)
  })
})
