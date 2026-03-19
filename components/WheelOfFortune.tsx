'use client'

import { useState } from 'react'

// רשימת הפרסים שהגדרת, עם צבעים שמתאימים לעיצוב הכהה שלנו
const PRIZES = [
  { id: 1, label: '+20 Coins', color: '#10B981', value: 20, type: 'coins' }, // ירוק
  { id: 2, label: 'Leader Veto', color: '#8B5CF6', value: 'leader_veto', type: 'item' }, // סגול
  { id: 3, label: '+10 Coins', color: '#34D399', value: 10, type: 'coins' }, // ירוק בהיר
  { id: 4, label: '-10 Coins', color: '#EF4444', value: -10, type: 'penalty' }, // אדום
  { id: 5, label: 'No Driving', color: '#3B82F6', value: 'no_driving', type: 'special' }, // כחול
  { id: 6, label: 'Try Again', color: '#6B7280', value: 0, type: 'empty' }, // אפור
  { id: 7, label: '-15 Coins', color: '#DC2626', value: -15, type: 'penalty' }, // אדום כהה
  { id: 8, label: '+5 Coins', color: '#6EE7B7', value: 5, type: 'coins' }, // מנטה
]

export default function WheelOfFortune() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)

  // הפונקציה שמייצרת את הרקע של הגלגל בעזרת CSS
  const getWheelBackground = () => {
    const sliceAngle = 360 / PRIZES.length
    let gradient = 'conic-gradient('
    
    PRIZES.forEach((prize, index) => {
      const startAngle = index * sliceAngle
      const endAngle = startAngle + sliceAngle
      gradient += `${prize.color} ${startAngle}deg ${endAngle}deg${index === PRIZES.length - 1 ? '' : ', '}`
    })
    
    gradient += ')'
    return gradient
  }

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)

    // חישוב לאיזה פרס הגלגל ייפול (כרגע רנדומלי בלקוח, בהמשך נעביר לשרת)
    const winningIndex = Math.floor(Math.random() * PRIZES.length)
    
    // כל משולש הוא 45 מעלות (360 לחלק ל-8)
    const sliceAngle = 360 / PRIZES.length
    
    // חישוב המעלות המדויקות כדי שהמחט תעצור באמצע המשולש המנצח
    // אנחנו מוסיפים 5 סיבובים מלאים (5 * 360) כדי שזה ייראה כמו סיבוב אמיתי ארוך
    const baseSpins = 360 * 5 
    const targetRotation = baseSpins + (360 - (winningIndex * sliceAngle)) - (sliceAngle / 2)

    setRotation((prev) => prev + targetRotation)

    // מחכים שהאנימציה תסתיים (5 שניות) ואז חושפים את התוצאה
    setTimeout(() => {
      setIsSpinning(false)
      setResult(PRIZES[winningIndex].label)
    }, 5000)
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-dark-800 rounded-xl border border-dark-600 shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Daily Spin</h2>
      
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
        {/* המחט העליונה שמצביעה על הפרס */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white drop-shadow-md"></div>
        </div>

        {/* הגלגל עצמו */}
        <div 
          className="w-full h-full rounded-full border-4 border-dark-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-[5000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ 
            background: getWheelBackground(),
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {/* הטקסטים של הפרסים */}
          {PRIZES.map((prize, index) => {
            const rotationAngle = (index * (360 / PRIZES.length)) + ((360 / PRIZES.length) / 2)
            return (
              <div
                key={prize.id}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 origin-bottom text-center flex flex-col justify-start pt-4"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <span className="text-white text-xs md:text-sm font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] -rotate-90 origin-center whitespace-nowrap translate-y-8 md:translate-y-12">
                  {prize.label}
                </span>
              </div>
            )
          })}
        </div>
        
        {/* העיגול הפנימי המרכזי */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-dark-900 rounded-full border-2 border-coins z-10 shadow-inner"></div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="w-full py-3 bg-coins hover:bg-yellow-400 text-dark-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-[0_0_15px_rgba(255,215,0,0.3)]"
      >
        {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
      </button>

      {result && (
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-dark-400 text-sm mb-1">You won:</p>
          <p className="text-2xl font-bold text-coins drop-shadow-md">{result}</p>
        </div>
      )}
    </div>
  )
}