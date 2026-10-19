import { useEffect } from 'react'
import { useLocale } from './hooks/useLocale'
import { useAvailability } from './hooks/useAvailability'
import { ModeToggle } from './components/ModeToggle'
import { TimeFormatToggle } from './components/TimeFormatToggle'
import { IntervalToggle } from './components/IntervalToggle'
import { AppLinkToggle } from './components/AppLinkToggle'
import { TimezoneSelect } from './components/TimezoneSelect'
import { LocaleSelect } from './components/LocaleSelect'
import { AboutButton } from './components/AboutButton'
import { SettingsMenu } from './components/SettingsMenu'
import { WeekNav } from './components/WeekNav'
import { TimeList } from './components/TimeList'
import { TimeGrid } from './components/TimeGrid'
import { OutputPreview } from './components/OutputPreview'
import { ActionFooter } from './components/ActionFooter'

function App() {
  const {
    mode,
    setMode,
    timeFormat,
    setTimeFormat,
    currentWeekStart,
    currentWeekSlots,
    weekSelections,
    totalSelectedCount,
    toggleSlot,
    selectSlots,
    clearSlots,
    goToToday,
    goToPrev,
    addWeek,
    canGoPrev,
    localTimezone,
    targetTimezone,
    setTargetTimezone,
    locale,
    setLocale,
    interval,
    setInterval,
    appendLink,
    setAppendLink,
  } = useAvailability()

  const { t } = useLocale(timeFormat, locale)

  // Track shared link visits
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('s')) {
      window.umami?.track('Shared link opened')
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-xl font-bold leading-tight">{t('app.title')}</h1>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="md:hidden">
              <SettingsMenu
                localTimezone={localTimezone}
                targetTimezone={targetTimezone}
                onTimezoneChange={setTargetTimezone}
                timeFormat={timeFormat}
                onTimeFormatChange={setTimeFormat}
                mode={mode}
                onModeChange={setMode}
                locale={locale}
                onLocaleChange={setLocale}
                interval={interval}
                onIntervalChange={setInterval}
                appendLink={appendLink}
                onAppendLinkChange={setAppendLink}
              />
            </div>
            <div className="hidden md:flex gap-2">
              <TimezoneSelect
                localTimezone={localTimezone}
                targetTimezone={targetTimezone}
                onChange={setTargetTimezone}
                locale={locale}
              />
              <TimeFormatToggle timeFormat={timeFormat} onChange={setTimeFormat} />
              <IntervalToggle interval={interval} onChange={setInterval} />
              <AboutButton locale={locale} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            {mode === 'week' && (
              <WeekNav
                weekStart={currentWeekStart}
                onToday={goToToday}
                onPrev={goToPrev}
                onNext={addWeek}
                canGoPrev={canGoPrev}
                weeksCount={weekSelections.length}
                locale={locale}
              />
            )}
            <div className="hidden md:flex gap-2 ml-auto">
              <ModeToggle mode={mode} onChange={setMode} />
              <LocaleSelect locale={locale} onChange={setLocale} />
              <AppLinkToggle appendLink={appendLink} onChange={setAppendLink} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="md:hidden">
          <TimeList
            mode={mode}
            weekStart={currentWeekStart}
            selectedSlots={currentWeekSlots}
            onToggle={toggleSlot}
            timeFormat={timeFormat}
            locale={locale}
            interval={interval}
          />
          {totalSelectedCount > 0 && (
            <div className="mt-6 mb-4">
              <OutputPreview
                mode={mode}
                weekSelections={weekSelections}
                currentWeekSlots={currentWeekSlots}
                timeFormat={timeFormat}
                locale={locale}
                localTimezone={localTimezone}
                targetTimezone={targetTimezone}
                interval={interval}
                appendLink={appendLink}
              />
            </div>
          )}
        </div>
        <div className="hidden md:flex gap-6">
          <div className="flex-1 min-w-0">
            <TimeGrid
              mode={mode}
              weekStart={currentWeekStart}
              selectedSlots={currentWeekSlots}
              onToggle={toggleSlot}
              onSelect={selectSlots}
              timeFormat={timeFormat}
              locale={locale}
              interval={interval}
            />
          </div>
          <div className="hidden xl:block w-80 flex-shrink-0">
            <OutputPreview
              mode={mode}
              weekSelections={weekSelections}
              currentWeekSlots={currentWeekSlots}
              timeFormat={timeFormat}
              locale={locale}
              localTimezone={localTimezone}
              targetTimezone={targetTimezone}
              interval={interval}
              appendLink={appendLink}
            />
          </div>
        </div>
      </main>

      <ActionFooter
        mode={mode}
        weekSelections={weekSelections}
        currentWeekSlots={currentWeekSlots}
        onClear={clearSlots}
        timeFormat={timeFormat}
        localTimezone={localTimezone}
        targetTimezone={targetTimezone}
        locale={locale}
        interval={interval}
        appendLink={appendLink}
      />
    </div>
  )
}

export default App
