import { CoinIcon } from './CoinIcon'
import Image from 'next/image'
import { Car, Home } from 'lucide-react'

// הוספנו את שני השדות החדשים לממשק של המשתמש!
interface User {
  id: string
  name: string
  balance: number
  profilePicture?: string
  lastDriveDate?: string | null
  lastHostDate?: string | null
}

interface BalanceCardProps {
  user: User
  isCurrentUser?: boolean
}

export default function BalanceCard({ user, isCurrentUser = false }: BalanceCardProps) {
  return (
    <div
      className={`rounded-xl p-8 backdrop-blur-sm border transition-all duration-300 hover:scale-105 flex flex-col h-full ${
        isCurrentUser
          ? 'bg-gradient-to-br from-dark-800 to-dark-700 border-coins/50 shadow-lg shadow-coins/20'
          : 'bg-dark-800 border-dark-700 hover:border-dark-600'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
            {user.profilePicture ? (
              <Image 
                src={user.profilePicture} 
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            {isCurrentUser && (
              <p className="text-coins text-sm font-medium mt-1">Your Account</p>
            )}
          </div>
        </div>
        <div className="bg-dark-700 rounded-full p-3 flex-shrink-0">
          <CoinIcon />
        </div>
      </div>

      <div className="mt-6 flex flex-col flex-1">
        <div>
          <p className="text-dark-400 text-sm mb-2">Balance</p>
          <p className={`text-4xl font-bold truncate ${isCurrentUser ? 'text-coins' : 'text-white'}`}>
            {user.balance.toLocaleString()}
          </p>
          <p className="text-dark-400 text-xs mt-2 mb-6">TumbaCoins</p>
        </div>

        {/* הסטטיסטיקות החדשות - נדחפות לתחתית הכרטיסייה */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-dark-700/50">
          <div className="bg-dark-900/40 rounded-lg p-3 flex flex-col items-center justify-center border border-dark-700/50 hover:border-dark-600 transition-colors">
            <Car className="text-dark-400 mb-1.5" size={20} strokeWidth={1.5} />
            <span className="text-[10px] text-dark-500 uppercase font-semibold mb-1 tracking-wider">Last Drive</span>
            <span className="text-xs font-bold text-white">
              {user.lastDriveDate ? user.lastDriveDate : 'Never'}
            </span>
          </div>

          <div className="bg-dark-900/40 rounded-lg p-3 flex flex-col items-center justify-center border border-dark-700/50 hover:border-dark-600 transition-colors">
            <Home className="text-dark-400 mb-1.5" size={20} strokeWidth={1.5} />
            <span className="text-[10px] text-dark-500 uppercase font-semibold mb-1 tracking-wider">Last Host</span>
            <span className="text-xs font-bold text-white">
              {user.lastHostDate ? user.lastHostDate : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}