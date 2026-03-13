export default function AlbumPage() {
  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
            Photo Album
          </h1>
          <p className="text-dark-400 text-sm mt-1">Share moments with your friends</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-semibold mb-2">Coming in v2.0</h2>
          <p className="text-dark-400">Share your favorite moments with the group in the next release!</p>
        </div>
      </main>
    </div>
  )
}
