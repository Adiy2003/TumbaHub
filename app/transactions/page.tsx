'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  balance?: number
}

interface Transaction {
  id: string
  action: string
  amount: number
  from: { name: string }
  to: { name: string }
  createdAt: string
}

export default function TransactionsPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, transRes] = await Promise.all([
        fetch('/api/users/all'),
        fetch('/api/transactions'),
      ])

      const usersData = await usersRes.json()
      const transData = await transRes.json()

      if (usersData.users) {
        setUsers(usersData.users.filter((u: User) => u.id !== session?.user?.id))
      }

      if (transData.transactions) {
        setTransactions(transData.transactions)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch:', error)
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSendCoins = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !amount || parseInt(amount) <= 0) {
      setMessage('❌ Please select a user and enter a valid amount')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toId: selectedUser,
          amount: parseInt(amount),
          action: description || 'Transfer',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage('❌ ' + (data.error || 'Failed to send coins'))
        return
      }

      setMessage('✅ Coins sent successfully!')
      setSelectedUser('')
      setAmount('')
      setDescription('')
      fetchData()
    } catch (error) {
      setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-dark-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
            💸 Transactions
          </h1>
          <p className="text-dark-400 text-sm mt-1">Send TumbaCoins to friends</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Form */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Send Coins</h2>

              <form onSubmit={handleSendCoins} className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Send to
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-coins"
                  >
                    <option value="">-- Select Friend --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Amount (TumbaCoins)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
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
                    placeholder="e.g., Coffee money, Dinner transfer..."
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
                  {submitting ? 'Sending...' : '✈️ Send Coins'}
                </button>
              </form>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-dark-400 text-sm">No transactions yet</p>
                ) : (
                  transactions.slice(0, 15).map((tx) => (
                    <div key={tx.id} className="bg-dark-700 p-3 rounded-lg text-xs">
                      <div className="font-medium">{tx.action}</div>
                      <div className="text-dark-400 mt-1">
                        {tx.from.name} → {tx.to.name}
                      </div>
                      <div className="text-coins font-semibold mt-1">+{tx.amount} coins</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
