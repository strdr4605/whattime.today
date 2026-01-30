import { useLocale } from './hooks/useLocale'
import { useAvailability } from './hooks/useAvailability'
import { ModeToggle } from './components/ModeToggle'
import { TimeFormatToggle } from './components/TimeFormatToggle'
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
    weekStart,
    selectedSlots,
    toggleSlot,
    selectSlots,
    clearSlots,
    goToToday,
    goToPrev,
    goToNext,
    canGoPrev,
    localTimezone,
    targetTimezone,
    setTargetTimezone,
    locale,
    setLocale,
  } = useAvailability()

  const { t } = useLocale(timeFormat, locale)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold leading-tight">
              {t('app.title')}
              <span className="block md:inline text-sm font-normal text-gray-500 dark:text-gray-400">
                {' '}{t('app.subtitle')}
              </span>
            </h1>
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
              />
            </div>
            <div className="hidden md:flex gap-2">
              <TimezoneSelect
                localTimezone={localTimezone}
                targetTimezone={targetTimezone}
                onChange={setTargetTimezone}
              />
              <TimeFormatToggle timeFormat={timeFormat} onChange={setTimeFormat} />
              <ModeToggle mode={mode} onChange={setMode} />
              <LocaleSelect locale={locale} onChange={setLocale} />
              <AboutButton />
            </div>
          </div>
          {mode === 'week' && (
            <WeekNav
              weekStart={weekStart}
              onToday={goToToday}
              onPrev={goToPrev}
              onNext={goToNext}
              canGoPrev={canGoPrev}
            />
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="md:hidden">
          <TimeList
            mode={mode}
            weekStart={weekStart}
            selectedSlots={selectedSlots}
            onToggle={toggleSlot}
            timeFormat={timeFormat}
            locale={locale}
          />
        </div>
        <div className="hidden md:flex gap-6">
          <div className="flex-1 min-w-0">
            <TimeGrid
              mode={mode}
              weekStart={weekStart}
              selectedSlots={selectedSlots}
              onToggle={toggleSlot}
              onSelect={selectSlots}
              timeFormat={timeFormat}
              locale={locale}
            />
          </div>
          <div className="hidden xl:block w-80 flex-shrink-0">
            <OutputPreview
              mode={mode}
              weekStart={weekStart}
              selectedSlots={selectedSlots}
              timeFormat={timeFormat}
              locale={locale}
              localTimezone={localTimezone}
              targetTimezone={targetTimezone}
            />
          </div>
        </div>
      </main>

      <ActionFooter
        mode={mode}
        weekStart={weekStart}
        selectedSlots={selectedSlots}
        onClear={clearSlots}
        timeFormat={timeFormat}
        localTimezone={localTimezone}
        targetTimezone={targetTimezone}
        locale={locale}
      />
    </div>
  )
}

export default App
