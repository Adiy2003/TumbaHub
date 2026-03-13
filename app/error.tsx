'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-dark-400 mb-8">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-coins hover:bg-yellow-300 text-dark-900 font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
