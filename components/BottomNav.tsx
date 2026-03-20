'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Trophy, TrendingUp, BarChartBig, User } from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
  adminOnly?: boolean
}

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Check if user is admin
  const isAdmin = session?.user?.email === 'alex@example.com'

  const navItems: NavItem[] = [
    {
      icon: <Home size={24} strokeWidth={2} />,
      label: 'Home',
      path: '/',
    },
    {
      icon: <Trophy size={24} strokeWidth={2} />,
      label: 'Leaderboard',
      path: '/leaderboard',
    },
    {
      icon: <TrendingUp size={24} strokeWidth={2} />,
      label: 'TumbaConomy', // קיצרתי קצת כדי שייכנס יפה במסך הקטן
      path: '/tumbaconomy',
    },
    {
      icon: <BarChartBig size={24} strokeWidth={2} />,
      label: 'Recaps',
      path: '/recaps', // זה העמוד הבא שניצור!
    },
    {
      icon: <User size={24} strokeWidth={2} />,
      label: 'Profile',
      path: '/profile',
    },
  ]

  // Filter out admin page if user is not admin
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-50">
      <div className="flex justify-around items-center max-w-6xl mx-auto">
        {visibleItems.map((item) => {
          // הבדיקה פה קצת יותר חכמה עכשיו: אנחנו בודקים אם הנתיב הנוכחי מתחיל בנתיב של האייטם (שימושי לעמודי פנים)
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center py-3 px-2 sm:px-4 transition-all duration-200 w-full ${
                isActive
                  ? 'text-coins border-t-2 border-coins bg-dark-700/30'
                  : 'text-dark-400 hover:text-white border-t-2 border-transparent'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 font-medium transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}