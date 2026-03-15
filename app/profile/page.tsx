'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  balance: number
  profilePicture?: string
  isAdmin?: boolean
}

interface AdminUser {
  id: string
  name: string
  email: string
  balance: number
}

interface AdminAction {
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

export default function ProfilePage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'admin'>('profile')
  const [adminSubTab, setAdminSubTab] = useState<'coins' | 'bets'>('coins')
  
  // Admin panel state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [adminActions, setAdminActions] = useState<AdminAction[]>([])
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([])
  const [bets, setBets] = useState<Bet[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedWinningSide, setSelectedWinningSide] = useState<{ [key: string]: string }>({})
  const [endingBetId, setEndingBetId] = useState('')
  
  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editMessage, setEditMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    fetchUser()
  }, [session])

  useEffect(() => {
    if (activeTab === 'admin' && user) {
      fetchAdminData()
    }
  }, [activeTab, user])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setLoading(false)
    }
  }

  const fetchAdminData = async () => {
    try {
      setAdminLoading(true)
      const [coinsRes, betsRes] = await Promise.all([
        fetch('/api/admin/manage-coins'),
        fetch('/api/bets')
      ])
      const coinsData = await coinsRes.json()
      const betsData = await betsRes.json()

      if (coinsRes.ok) {
        setAdminUsers(coinsData.users)
        setAdminActions(coinsData.actions)
        setAdminTransactions(coinsData.transactions)
      }
      
      if (betsRes.ok) {
        setBets((betsData || []).filter((bet: Bet) => !bet.ended))
      }
      setAdminLoading(false)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      setAdminLoading(false)
    }
  }

  const handleApplyAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || (!selectedAction && !customAmount)) {
      setMessage('❌ Select a user and action or amount')
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
      fetchAdminData()
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
      setTimeout(() => fetchAdminData(), 1000)
    } catch (error) {
      setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setEndingBetId('')
    }
  }

  const handleEditClick = () => {
    setEditName(user?.name || '')
    setEditMessage('')
    setSelectedFile(null)
    setPreviewUrl(user?.profilePicture || '')
    setIsEditingProfile(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditMessage('❌ Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditMessage('❌ File size cannot exceed 5MB')
        e.target.value = ''
        return
      }

      setSelectedFile(file)
      setEditMessage('')

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editName.trim()) {
      setEditMessage('❌ Name cannot be empty')
      return
    }

    setEditLoading(true)
    setEditMessage('')

    try {
      let res
      
      if (selectedFile) {
        // Upload with file
        const formData = new FormData()
        formData.append('name', editName)
        formData.append('profilePicture', selectedFile)

        res = await fetch('/api/users/me', {
          method: 'PUT',
          body: formData,
        })
      } else {
        // Update name only
        res = await fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        setEditMessage('❌ ' + (data.error || 'Failed to update profile'))
        return
      }

      setUser(data.user)
      setEditMessage('✅ Profile updated!')
      setTimeout(() => {
        setIsEditingProfile(false)
        setEditMessage('')
        setSelectedFile(null)
        setPreviewUrl('')
      }, 1500)
    } catch (error) {
      setEditMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditName('')
    setEditMessage('')
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const isAdmin = user?.isAdmin === true

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
          <p className="mt-4 text-dark-400">Loading profile...</p>
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
                Profile
              </h1>
              <p className="text-dark-400 text-sm mt-1">Your account information</p>
            </div>
            {isAdmin && (
              <span className="bg-red-900/30 text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-700">
                👨‍💼 Admin
              </span>
            )}
          </div>

          {/* Tabs */}
          {isAdmin && (
            <div className="flex gap-4 mt-6 border-t border-dark-700 pt-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-coins text-dark-900'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-coins text-dark-900'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Admin Panel
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'profile' && user && (
          <>
            {/* Profile Header */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-8 mb-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{user.name}</h2>
                  <p className="text-dark-400 text-sm mt-1">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700 rounded-lg p-4">
                  <p className="text-dark-400 text-sm mb-2">Current Balance</p>
                  <p className="text-2xl font-bold text-coins">{user.balance.toLocaleString()}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-4">
                  <p className="text-dark-400 text-sm mb-2">Account Status</p>
                  <p className="text-2xl font-bold text-green-400">Active</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-8">
              <h3 className="text-xl font-semibold mb-6">Settings</h3>

              <div className="space-y-4">
                <button 
                  onClick={handleEditClick}
                  className="w-full bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-lg transition-colors text-left px-4">
                  Edit Profile
                </button>
                <button className="w-full bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-lg transition-colors text-left px-4">
                  Change Password
                </button>
                <button className="w-full bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-lg transition-colors text-left px-4">
                  Notification Preferences
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 font-semibold py-3 rounded-lg transition-colors text-left px-4"
                >
                  Log Out
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'admin' && (
          <>
            {/* Admin Sub-tabs */}
            <div className="flex gap-4 mb-8 border-b border-dark-700 pb-4">
              <button
                onClick={() => setAdminSubTab('coins')}
                className={`font-semibold py-2 px-4 transition-colors ${
                  adminSubTab === 'coins'
                    ? 'border-b-2 border-coins text-coins'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                💰 Coins Management
              </button>
              <button
                onClick={() => setAdminSubTab('bets')}
                className={`font-semibold py-2 px-4 transition-colors ${
                  adminSubTab === 'bets'
                    ? 'border-b-2 border-coins text-coins'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                🎲 Bets Management
              </button>
            </div>

            {adminLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-dark-400">Loading admin data...</p>
              </div>
            ) : adminSubTab === 'coins' ? (
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
                          {adminUsers.map((user) => (
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
                          {adminActions.map((action) => (
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
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            message.startsWith('✅')
                              ? 'bg-green-900/20 text-green-400 border border-green-700'
                              : 'bg-red-900/20 text-red-400 border border-red-700'
                          }`}
                        >
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
                      {adminTransactions.slice(0, 20).map((tx) => (
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
                      {adminUsers.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
                    </p>
                    <p className="text-dark-400 text-sm mt-2">{adminUsers.length} users</p>
                  </div>

                  <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">👥 User Balances</h3>
                    <div className="space-y-2">
                      {adminUsers.map((user) => (
                        <div key={user.id} className="flex justify-between items-center text-sm">
                          <span className="text-dark-400">{user.name}</span>
                          <span className="font-medium">{user.balance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
          </>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-700 max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-dark-400 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-coins transition-colors"
                  placeholder="Enter your name"
                />
                <p className="text-dark-400 text-xs mt-1">
                  {editName.length}/50
                </p>
              </div>

              <div>
                <label className="block text-dark-400 text-sm font-medium mb-2">
                  Profile Picture
                </label>
                {previewUrl && (
                  <div className="mb-3">
                    <img 
                      src={previewUrl} 
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border border-coins"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-dark-400 text-sm focus:outline-none focus:border-coins transition-colors file:bg-coins file:border-0 file:text-dark-900 file:px-3 file:py-1 file:rounded file:text-sm file:font-semibold file:cursor-pointer file:mr-3"
                  disabled={editLoading}
                />
                <p className="text-dark-400 text-xs mt-1">
                  Max 5MB, PNG or JPG
                </p>
              </div>

              {editMessage && (
                <div className="p-3 bg-dark-700 rounded-lg text-sm">
                  {editMessage}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-semibold py-2 rounded-lg transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-coins hover:bg-yellow-400 text-dark-900 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
