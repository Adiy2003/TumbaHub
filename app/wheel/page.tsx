'use client'

import { useState, useEffect } from 'react'
import WheelOfFortune from '@/components/WheelOfFortune' // וודא שהנתיב תואם

export default function WheelPage() {
  const [canSpin, setCanSpin] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. בודקים מתי הייתה הפעם האחרונה שהוא סובב
    const checkDailySpin = () => {
      // כרגע נשמור את זה ב-localStorage (הזיכרון של הדפדפן)
      // בהמשך תוכלו לשמור את התאריך הזה בפיירבייס תחת המשתמש!
      const lastSpin = localStorage.getItem('lastTumbaSpinDate')
      const today = new Date().toLocaleDateString('en-GB')

      if (lastSpin === today) {
        setCanSpin(false)
      } else {
        setCanSpin(true)
      }
      setLoading(false)
    }

    checkDailySpin()

    // 2. מפעילים טיימר שסופר לאחור עד חצות בדיוק
    const timer = setInterval(() => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0) // מכוון לחצות של הלילה הקרוב
      
      const diff = tomorrow.getTime() - now.getTime()
      
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      
      // מפרמט שיראה כמו 09:05:02 במקום 9:5:2
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // פונקציה שתרוץ כשהמשתמש מסיים לסובב את הגלגל
  const handleSpinComplete = () => {
    const today = new Date().toLocaleDateString('en-GB')
    localStorage.setItem('lastTumbaSpinDate', today)
    setCanSpin(false) // נועל את הגלגל ומציג את הטיימר מיד
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 flex flex-col items-center bg-dark-900">
      <div className="text-center mb-10 max-w-lg mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coins to-yellow-500 mb-4 drop-shadow-sm">
          Daily Fortune Wheel
        </h1>
        <p className="text-dark-400 text-lg">
          {canSpin 
            ? "Feeling lucky today? Spin the wheel to win TumbaCoins, special items, or maybe... a penalty! 😈"
            : "You've already spun today! Come back tomorrow for another chance."}
        </p>
      </div>

      {canSpin ? (
        // אם הוא עדיין לא סובב היום, נציג לו את הגלגל
        // שים לב שהוספתי פרופ כדי שנדע מתי הוא סיים לסובב
        <div onClick={handleSpinComplete}>
          <WheelOfFortune />
        </div>
      ) : (
        // אם הוא כבר סובב, נציג את חלון ההמתנה עם הטיימר
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center shadow-xl animate-fade-in-up">
          <h3 className="text-xl font-semibold text-dark-400 mb-4 uppercase tracking-wider">Next Spin In</h3>
          <div className="text-5xl md:text-6xl font-mono font-black text-coins tracking-wider mb-6 drop-shadow-md">
            {timeLeft}
          </div>
          <div className="w-full bg-dark-700 h-1 rounded-full overflow-hidden">
             <div className="bg-coins h-full w-full opacity-50"></div>
          </div>
        </div>
      )}
      
      <div className="mt-12 text-dark-500 text-sm font-medium">
        The wheel resets every night at midnight.
      </div>
    </div>
  )
}
