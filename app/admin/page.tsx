'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  balance: number
}

interface Action {
  id: string
  name: string
  amount: number
  description?: string
}

interface Transaction {
  id: string
  action: string
  amount: number
  description?: string
  from: { name: string }
  to: { name: string }
  createdAt: string
}

interface Bet {
  id: string
  title: string
  sideA: string
  sideB: string
  amount: number
  creator: { name: string }
  ended: boolean
  winningSide?: string
  voters: Array<{
    userId: string
    side: string
  }>
}

export default function AdminPage() {
  // const { data: session } = useSession()
  const router = useRouter()
  
  const [currentTab, setCurrentTab] = useState<'coins' | 'bets'>('coins')
  const [users, setUsers] = useState<User[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedWinningSide, setSelectedWinningSide] = useState<{ [key: string]: string }>({})
  const [endingBetId, setEndingBetId] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [coinsRes, betsRes] = await Promise.all([
        fetch('/api/admin/manage-coins'),
        fetch('/api/bets')
      ])
      const coinsData = await coinsRes.json()
      const betsData = await betsRes.json()
      
      if (!coinsRes.ok) {
        router.push('/')
        return
      }

      setUsers(coinsData.users)
      setActions(coinsData.actions)
      setTransactions(coinsData.transactions)
      setBets(betsData.filter((bet: Bet) => !bet.ended))
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch:', error)
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApplyAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || (!selectedAction && !customAmount)) {
      setMessage('Select a user and action or amount')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/manage-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          actionId: selectedAction || null,
          customAmount: customAmount ? parseInt(customAmount) : null,
          description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage('❌ ' + (data.error || 'Failed to apply action'))
        return
      }

      setMessage('✅ Action applied successfully!')
      setSelectedUser('')
      setSelectedAction('')
      setCustomAmount('')
      setDescription('')
      
      // Refresh data
      fetchData()
    } catch (error) {
      setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEndBet = async (betId: string) => {
    const winningSide = selectedWinningSide[betId]
    if (!winningSide) {
      alert('Please select a winning side')
      return
    }

    setEndingBetId(betId)
    setMessage('')

    try {
      const res = await fetch('/api/bets/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betId,
          winningSide,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage('❌ ' + (data.error || 'Failed to end bet'))
        return
      }

      setMessage('✅ Bet ended! Winners notified.')
      setSelectedWinningSide({})
      
      // Refresh bets
      setTimeout(() => fetchData(), 1000)
    } catch (error) {
      setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setEndingBetId('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-dark-400">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-red-400">👨‍💼 Admin Panel</h1>
          <p className="text-dark-400 text-sm mt-1">Manage TumbaCoins distribution</p>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="border-b border-dark-700 bg-dark-800 sticky top-24 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            onClick={() => setCurrentTab('coins')}
            className={`font-semibold py-4 px-2 border-b-2 transition-colors ${
              currentTab === 'coins'
                ? 'border-coins text-coins'
                : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            💰 Coins Management
          </button>
          <button
            onClick={() => setCurrentTab('bets')}
            className={`font-semibold py-4 px-2 border-b-2 transition-colors ${
              currentTab === 'bets'
                ? 'border-coins text-coins'
                : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            🎲 Bets Management
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentTab === 'coins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Apply Action to User</h2>
              
              <form onSubmit={handleApplyAction} className="space-y-4">
                {/* User Select */}
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Select User
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-coins"
                  >
                    <option value="">-- Choose User --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.balance} coins
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Predefined Actions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          setSelectedAction(action.id)
                          setCustomAmount('')
                        }}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAction === action.id
                            ? 'bg-coins text-dark-900'
                            : 'bg-dark-700 text-white hover:bg-dark-600'
                        }`}
                      >
                        {action.name}
                        <br />
                        <span className={action.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                          {action.amount > 0 ? '+' : ''}{action.amount}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Or Custom Amount
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAction('')
                    }}
                    placeholder="Enter amount (+ or -)"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins"
                  />
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.startsWith('✅') 
                      ? 'bg-green-900/20 text-green-400 border border-green-700'
                      : 'bg-red-900/20 text-red-400 border border-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-coins text-dark-900 font-semibold py-2 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : '✨ Apply Action'}
                </button>
              </form>
            </div>

            {/* Recent Transactions */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.slice(0, 20).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between bg-dark-700 p-3 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{tx.from.name} → {tx.to.name}</p>
                      <p className="text-dark-400">{tx.action}</p>
                    </div>
                    <span className="font-bold text-coins">+{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Total Balance</h3>
              <p className="text-3xl font-bold text-coins">
                {users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
              </p>
              <p className="text-dark-400 text-sm mt-2">{users.length} users</p>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-lg font-semibold mb-4">👥 User Balances</h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center text-sm">
                    <span className="text-dark-400">{user.name}</span>
                    <span className="font-medium">{user.balance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {currentTab === 'bets' && (
        <div className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.startsWith('✅') 
                ? 'bg-green-900/20 text-green-400 border border-green-700'
                : 'bg-red-900/20 text-red-400 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Open Bets List */}
          <div className="space-y-4">
            {bets.length === 0 ? (
              <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
                <p className="text-dark-400">No open bets to manage</p>
              </div>
            ) : (
              bets.map((bet) => (
                <div key={bet.id} className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{bet.title}</h3>
                      <p className="text-dark-400 text-sm mt-1">by {bet.creator.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-coins font-bold">{bet.amount} coins/vote</p>
                      <p className="text-dark-400 text-sm">{bet.voters.length} votes</p>
                    </div>
                  </div>

                  {/* Sides */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-dark-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-dark-400 mb-1">Side A</p>
                      <p className="font-semibold">{bet.sideA}</p>
                      <p className="text-xs text-dark-400 mt-2">
                        {bet.voters.filter(v => v.side === 'A').length} votes
                      </p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-dark-400 mb-1">Side B</p>
                      <p className="font-semibold">{bet.sideB}</p>
                      <p className="text-xs text-dark-400 mt-2">
                        {bet.voters.filter(v => v.side === 'B').length} votes
                      </p>
                    </div>
                  </div>

                  {/* Winner Selection and Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedWinningSide({ ...selectedWinningSide, [bet.id]: 'A' })}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        selectedWinningSide[bet.id] === 'A'
                          ? 'bg-blue-600 text-white'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                      }`}
                    >
                      ✓ Side A
                    </button>
                    <button
                      onClick={() => setSelectedWinningSide({ ...selectedWinningSide, [bet.id]: 'B' })}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        selectedWinningSide[bet.id] === 'B'
                          ? 'bg-purple-600 text-white'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                      }`}
                    >
                      ✓ Side B
                    </button>
                    <button
                      onClick={() => handleEndBet(bet.id)}
                      disabled={!selectedWinningSide[bet.id] || endingBetId === bet.id}
                      className="flex-1 bg-coins text-dark-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                    >
                      {endingBetId === bet.id ? '⏳' : '🏁'} End Bet
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  )
}

