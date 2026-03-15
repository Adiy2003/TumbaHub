'use client'

export const dynamic = 'force-dynamic'

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
}

export default function BetsPage() {
  const { data: session } = useSession()
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    sideA: '',
    sideB: '',
    amount: '',
    chosenSide: 'A' as 'A' | 'B',
  })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      fetchBets()
      const interval = setInterval(fetchBets, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchBets = async () => {
    try {
      const res = await fetch('/api/bets?ended=false')
      if (res.ok) {
        const data = await res.json()
        setBets(data || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch bets:', error)
      setLoading(false)
    }
  }

  const handleCreateBet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.sideA || !formData.sideB || !formData.amount) {
      setMessage('❌ Please fill in all fields')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          sideA: formData.sideA,
          sideB: formData.sideB,
          amount: parseInt(formData.amount),
          chosenSide: formData.chosenSide,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage('❌ ' + (data.error || 'Failed to create bet'))
        setSubmitting(false)
        return
      }

      setMessage('✅ Bet created successfully!')
      setFormData({ title: '', sideA: '', sideB: '', amount: '', chosenSide: 'A' })
      setShowForm(false)
      await new Promise(resolve => setTimeout(resolve, 1000))
      fetchBets()
    } catch (error) {
      setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (betId: string, side: 'A' | 'B') => {
    try {
      const res = await fetch('/api/bets/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betId, side }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert('❌ ' + (data.error || 'Failed to vote'))
        return
      }

      fetchBets()
    } catch (error) {
      alert('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const calculatePercentage = (bet: Bet, side: 'A' | 'B') => {
    if (bet.voters.length === 0) return 0
    const votes = bet.voters.filter((v) => v.side === side).length
    return Math.round((votes / bet.voters.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
          <p className="mt-4 text-dark-400">Loading bets...</p>
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
                🎲 Bets
              </h1>
              <p className="text-dark-400 text-sm mt-1">Place bets and settle scores</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/bets/history"
                className="px-4 py-2 bg-dark-700 text-dark-400 font-semibold rounded-lg hover:bg-dark-600 hover:text-white transition-colors"
              >
                📋 History
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-coins text-dark-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                {showForm ? 'Cancel' : '+ New Bet'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Bet Form */}
        {showForm && (
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-12">
            <h2 className="text-xl font-semibold text-white mb-6">Create a New Bet</h2>
            <form onSubmit={handleCreateBet} className="space-y-4">
              {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-900/20 border border-green-700 text-green-400' : 'bg-red-900/20 border border-red-700 text-red-400'}`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Bet Title</label>
                <input
                  type="text"
                  placeholder="e.g., Will Alex beat John in FIFA?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">Side A</label>
                  <input
                    type="text"
                    placeholder="e.g., Yes"
                    value={formData.sideA}
                    onChange={(e) => setFormData({ ...formData, sideA: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">Side B</label>
                  <input
                    type="text"
                    placeholder="e.g., No"
                    value={formData.sideB}
                    onChange={(e) => setFormData({ ...formData, sideB: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Bet Amount (TumbaCoins)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-3">Which side are you voting for?</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-dark-700 border border-dark-600 rounded-lg cursor-pointer hover:border-coins transition-colors">
                    <input
                      type="radio"
                      name="chosenSide"
                      value="A"
                      checked={formData.chosenSide === 'A'}
                      onChange={() => setFormData({ ...formData, chosenSide: 'A' })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-white font-medium">{formData.sideA || 'Side A'}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-dark-700 border border-dark-600 rounded-lg cursor-pointer hover:border-coins transition-colors">
                    <input
                      type="radio"
                      name="chosenSide"
                      value="B"
                      checked={formData.chosenSide === 'B'}
                      onChange={() => setFormData({ ...formData, chosenSide: 'B' })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-white font-medium">{formData.sideB || 'Side B'}</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-coins text-dark-900 font-semibold py-2 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Bet'}
              </button>
            </form>
          </div>
        )}

        {/* Bets Feed */}
        <section>
          <h2 className="text-xl font-semibold text-dark-400 mb-6">Open Bets</h2>
          {bets.length === 0 ? (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <p className="text-dark-400 text-lg">No bets yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {bets.map((bet) => {
                const percentageA = calculatePercentage(bet, 'A')
                const percentageB = calculatePercentage(bet, 'B')
                const userVoted = bet.voters.find((v) => v.userId === session?.user?.id)

                return (
                  <div key={bet.id} className="bg-dark-800 rounded-xl border border-dark-700 p-6 hover:border-dark-600 transition-colors">
                    {/* Bet Title and Amount */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{bet.title}</h3>
                        <p className="text-dark-400 text-sm mt-1">Bet: {bet.amount} TumbaCoins</p>
                      </div>
                      <span className="inline-block px-3 py-1 bg-coins/20 border border-coins rounded-full text-xs font-medium text-coins">
                        {bet.voters.length} votes
                      </span>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4 mb-6">
                      {/* Side A */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-dark-400">{bet.sideA}</span>
                          <span className="text-sm font-bold text-white">{percentageA}%</span>
                        </div>
                        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${percentageA}%` }}></div>
                        </div>
                      </div>

                      {/* Side B */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-dark-400">{bet.sideB}</span>
                          <span className="text-sm font-bold text-white">{percentageB}%</span>
                        </div>
                        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${percentageB}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Vote Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleVote(bet.id, 'A')}
                        disabled={userVoted !== undefined}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          userVoted?.side === 'A'
                            ? 'bg-blue-600 text-white cursor-default'
                            : userVoted
                              ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {userVoted?.side === 'A' ? '✓ ' : ''}{bet.sideA}
                      </button>
                      <button
                        onClick={() => handleVote(bet.id, 'B')}
                        disabled={userVoted !== undefined}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          userVoted?.side === 'B'
                            ? 'bg-purple-600 text-white cursor-default'
                            : userVoted
                              ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {userVoted?.side === 'B' ? '✓ ' : ''}{bet.sideB}
                      </button>
                    </div>

                    {userVoted && (
                      <p className="text-xs text-dark-400 mt-3 text-center">✓ You&apos;ve already voted on this bet</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
