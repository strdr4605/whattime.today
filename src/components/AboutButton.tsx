import { useState } from 'react'
import { AboutModal } from './AboutModal'

export function AboutButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        ?
      </button>
      <AboutModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
