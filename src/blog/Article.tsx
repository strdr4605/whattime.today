interface ArticleProps {
  title: string
  children: React.ReactNode
}

export function Article({ title, children }: ArticleProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-3xl mx-auto">
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            &larr; Back to WTT - What Time Today
          </a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 py-8">
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          {children}
        </article>
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-700 p-4 mt-12">
        <div className="max-w-3xl mx-auto text-center text-sm text-gray-500">
          <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Try WTT - What Time Today
          </a>
          {' '}&middot; Share your availability as plain text
        </div>
      </footer>
    </div>
  )
}
