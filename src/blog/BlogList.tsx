const articles = [
  {
    slug: 'when2meet-alternatives',
    title: '7 Best When2Meet Alternatives in 2026',
    description: 'Compare the best alternatives to When2Meet for scheduling group meetings. Find simpler tools that let you share availability without complex booking links.',
    date: '2026-02-06',
  },
]

export function BlogList() {
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
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Tips and guides for sharing your availability effectively
        </p>
        <div className="space-y-6">
          {articles.map((article) => (
            <a
              key={article.slug}
              href={`/articles/${article.slug}/`}
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {article.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {article.description}
              </p>
              <time className="text-xs text-gray-500">{article.date}</time>
            </a>
          ))}
        </div>
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
