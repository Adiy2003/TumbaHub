'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Bet {
  id: string
  title: string
  sideA: string
  sideB: string
  amount: number
  voters: Array<{ userId: string; side: 'A' | 'B' }>
  createdAt: string
  creatorId: string
  ended?: boolean
  winnerSide?: 'A' | 'B'
  endedAt?: string
  creator?: { name: string }
}

export default function BetsHistoryPage() {
  const { data: session } = useSession()
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchBets()
      const interval = setInterval(fetchBets, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchBets = async () => {
    try {
      const res = await fetch('/api/bets?ended=true')
      if (res.ok) {
        const data = await res.json()
        setBets(data || [])
      } else {
        console.error('Failed to fetch bets:', res.status, res.statusText)
        setBets([])
      }
    } catch (error) {
      console.error('Failed to fetch bets:', error)
      setBets([])
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (bet: Bet, side: 'A' | 'B') => {
    if (bet.voters.length === 0) return 0
    const votes = bet.voters.filter((v) => v.side === side).length
    return Math.round((votes / bet.voters.length) * 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
          <p className="mt-4 text-dark-400">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
                📋 Bets History
              </h1>
              <p className="text-dark-400 text-sm mt-1">Completed and settled bets</p>
            </div>
            <Link
              href="/bets"
              className="px-4 py-2 bg-coins text-dark-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              🎲 Back to Open Bets
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-400 text-lg">No completed bets yet</p>
            <Link href="/bets" className="text-coins hover:text-yellow-300 mt-4 inline-block">
              Create a bet to get started →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-dark-800 rounded-xl border border-dark-700 p-6 hover:border-dark-600 transition-colors">
                {/* Bet Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{bet.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-dark-400">
                      <span>By {bet.creator?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatDate(bet.createdAt)}</span>
                      <span>•</span>
                      <span className="text-coins font-semibold">{bet.amount} 🪙</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-dark-400">Winner:</div>
                    <div className="text-lg font-bold text-green-400">
                      {bet.winnerSide === 'A' ? bet.sideA : bet.sideB}
                    </div>
                  </div>
                </div>

                {/* Vote Progress */}
                <div className="space-y-3">
                  {/* Side A */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${bet.winnerSide === 'A' ? 'text-green-400' : 'text-dark-400'}`}>
                        {bet.sideA}
                      </span>
                      <span className="text-sm text-dark-500">
                        {bet.voters.filter((v) => v.side === 'A').length} vote{bet.voters.filter((v) => v.side === 'A').length !== 1 ? 's' : ''} • {calculatePercentage(bet, 'A')}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${bet.winnerSide === 'A' ? 'bg-green-500' : 'bg-coins'} transition-all`}
                        style={{ width: `${calculatePercentage(bet, 'A')}%` }}
                      />
                    </div>
                  </div>

                  {/* Side B */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${bet.winnerSide === 'B' ? 'text-green-400' : 'text-dark-400'}`}>
                        {bet.sideB}
                      </span>
                      <span className="text-sm text-dark-500">
                        {bet.voters.filter((v) => v.side === 'B').length} vote{bet.voters.filter((v) => v.side === 'B').length !== 1 ? 's' : ''} • {calculatePercentage(bet, 'B')}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${bet.winnerSide === 'B' ? 'bg-green-500' : 'bg-coins'} transition-all`}
                        style={{ width: `${calculatePercentage(bet, 'B')}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Votes */}
                <div className="mt-4 pt-4 border-t border-dark-700 text-sm text-dark-500">
                  Total: {bet.voters.length} vote{bet.voters.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
