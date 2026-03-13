'use client'

import BalanceCard from './BalanceCard'

interface User {
  id: string
  name: string
  balance: number
}

interface UsersListProps {
  users: User[]
}

export default function UsersList({ users }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
        <p className="text-dark-400">No other users yet. Invite your friends!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <BalanceCard key={user.id} user={user} isCurrentUser={false} />
      ))}
    </div>
  )
}
