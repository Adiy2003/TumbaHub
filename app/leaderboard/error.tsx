'use client'

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Leaderboard</h2>
          <p className="text-dark-400 mb-8 max-w-md mx-auto">
            {error.message || 'There was a problem loading the leaderboard. Please try again.'}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-coins hover:bg-yellow-300 text-dark-900 font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    </div>
  )
}
