'use client'

import Link from 'next/link' // הוספנו את זה
import NotificationCenter from './NotificationCenter'
import InventoryCenter from './InventoryCenter'
// הסרנו מפה את ה-WheelOfFortune!

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-800 border-b border-dark-700 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-coins">TumbaHub</h1>
        <div className="flex items-center gap-4">
          
          {/* הנה האייקון החדש שיוביל לעמוד הגלגל המלא! */}
          <Link 
            href="/wheel" 
            className="p-2 text-dark-400 hover:text-coins hover:scale-110 transition-all duration-200"
            title="Daily Wheel"
          >
            <span className="text-2xl">🎡</span>
          </Link>

          <InventoryCenter />
          <NotificationCenter />
          
        </div>
      </div>
    </header>
  )
}
