import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OutputPreview } from './OutputPreview'
import { makeSlotKey } from '../types'
import { addDays, getMonday } from '../utils/dateUtils'

const baseProps = {
  timeFormat: '24h' as const,
  locale: 'en' as const,
  localTimezone: 'UTC',
  targetTimezone: 'UTC',
  interval: '1h' as const,
  appendLink: false,
}

const weekOne = { weekStart: '2025-01-06', slots: [makeSlotKey('monday', 10, 0)] }
const weekTwo = { weekStart: '2025-01-13', slots: [makeSlotKey('tuesday', 14, 0)] }

describe('OutputPreview', () => {
  it('shows only the visited week in generic mode', () => {
    render(
      <OutputPreview
        mode="generic"
        weekSelections={[weekOne, weekTwo]}
        currentWeekSlots={new Set([makeSlotKey('monday', 10, 0)])}
        {...baseProps}
      />
    )
    expect(screen.getByText(/Mon: 10:00-11:00 UTC/)).toBeTruthy()
    expect(screen.queryByText(/Tue: 14:00-15:00/)).toBeNull()
  })

  it('shows every week with its date in week mode', () => {
    render(
      <OutputPreview
        mode="week"
        weekSelections={[weekOne, weekTwo]}
        currentWeekSlots={new Set()}
        {...baseProps}
      />
    )
    const text = screen.getByText(/I'm available:/).textContent ?? ''
    expect(text).toContain('Mon (1/6): 10:00-11:00 UTC')
    expect(text).toContain('Tue (1/14): 14:00-15:00 UTC')
  })

  it('names this week and next week in week mode', () => {
    const monday = getMonday(new Date())
    const nextMonday = addDays(monday, 7)
    const key = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    render(
      <OutputPreview
        mode="week"
        weekSelections={[
          { weekStart: key(monday), slots: [makeSlotKey('monday', 10, 0)] },
          { weekStart: key(nextMonday), slots: [makeSlotKey('tuesday', 14, 0)] },
        ]}
        currentWeekSlots={new Set()}
        {...baseProps}
      />
    )
    const text = screen.getByText(/I'm available:/).textContent ?? ''
    expect(text).toContain('This week (')
    expect(text).toContain('Next week (')
    expect(text.match(/I'm available:/g)).toHaveLength(1)
  })
})
