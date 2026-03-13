'use client'

import NotificationCenter from './NotificationCenter'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-800 border-b border-dark-700 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-coins">TumbaHub</h1>
        <NotificationCenter />
      </div>
    </header>
  )
}
