'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      label: 'Home',
      path: '/',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="12 1 3 5 3 19 12 23 21 19 21 5 12 1" />
          <polyline points="12 12 3 8 12 4 21 8 12 12" />
          <polyline points="12 12 12 23" />
          <polyline points="3 8 12 12 21 8" />
        </svg>
      ),
      label: 'Leaderboard',
      path: '/leaderboard',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9h12m0 0l-1-8H7l-1 8" />
          <path d="M14 9v8.5m-4 0v-8.5m-2 0v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6" />
        </svg>
      ),
      label: 'Bets',
      path: '/bets',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      label: 'Shop',
      path: '/shop',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      label: 'Profile',
      path: '/profile',
    },
  ]

  // Filter out admin page if user is not admin
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700">
      <div className="flex justify-around items-center max-w-6xl mx-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center py-3 px-4 transition-all duration-200 ${
                isActive
                  ? 'text-coins border-t-2 border-coins'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
