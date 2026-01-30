export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getTimezoneAbbr(timezone: string): string {
  return (
    new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value || timezone
  )
}

function getTimezoneOffset(date: Date, timezone: string): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return (tzDate.getTime() - utcDate.getTime()) / 60000
}

export function convertHour(
  hour: number,
  date: Date,
  fromTz: string,
  toTz: string
): { hour: number; dayOffset: number } {
  const sourceDate = new Date(date)
  sourceDate.setHours(hour, 0, 0, 0)

  const fromOffset = getTimezoneOffset(sourceDate, fromTz)
  const toOffset = getTimezoneOffset(sourceDate, toTz)
  const diffMinutes = toOffset - fromOffset

  let convertedHour = hour + diffMinutes / 60
  let dayOffset = 0

  if (convertedHour < 0) {
    dayOffset = -1
    convertedHour += 24
  } else if (convertedHour >= 24) {
    dayOffset = 1
    convertedHour -= 24
  }

  return { hour: convertedHour, dayOffset }
}
