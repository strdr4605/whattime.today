import { useLocale } from './hooks/useLocale'
import { useAvailability } from './hooks/useAvailability'
import { ModeToggle } from './components/ModeToggle'
import { WeekNav } from './components/WeekNav'
import { TimeList } from './components/TimeList'
import { TimeGrid } from './components/TimeGrid'
import { ActionFooter } from './components/ActionFooter'

function App() {
  const { t } = useLocale()
  const {
    mode,
    setMode,
    weekStart,
    selectedSlots,
    toggleSlot,
    selectSlots,
    clearSlots,
    goToToday,
    goToPrev,
    goToNext,
  } = useAvailability()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20">
      <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold leading-tight">
              {t('app.title')}
              <span className="block md:inline text-sm font-normal text-gray-500 dark:text-gray-400">
                {' '}{t('app.subtitle')}
              </span>
            </h1>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
          {mode === 'week' && (
            <WeekNav
              weekStart={weekStart}
              onToday={goToToday}
              onPrev={goToPrev}
              onNext={goToNext}
            />
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="md:hidden">
          <TimeList
            mode={mode}
            weekStart={weekStart}
            selectedSlots={selectedSlots}
            onToggle={toggleSlot}
          />
        </div>
        <div className="hidden md:block">
          <TimeGrid
            mode={mode}
            weekStart={weekStart}
            selectedSlots={selectedSlots}
            onToggle={toggleSlot}
            onSelect={selectSlots}
          />
        </div>
      </main>

      <ActionFooter
        mode={mode}
        weekStart={weekStart}
        selectedSlots={selectedSlots}
        onClear={clearSlots}
      />
    </div>
  )
}

export default App
