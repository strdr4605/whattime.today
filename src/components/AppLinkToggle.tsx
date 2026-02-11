type Props = {
  appendLink: boolean
  onChange: (v: boolean) => void
}

export function AppLinkToggle({ appendLink, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!appendLink)}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${appendLink
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }
      `}
      title={appendLink ? 'Share link enabled' : 'Share link disabled'}
    >
      🔗
    </button>
  )
}
