'use client'

import { useState } from 'react'

// הפרופיל החדש: שחור-כתום לסירוגין!
const PRIZES = [
  { id: 1, label: '+20 Coins', color: '#1F2937', textClass: 'text-coins', value: 20 },      // רקע כהה, טקסט זהב
  { id: 2, label: 'Leader Veto', color: '#F59E0B', textClass: 'text-dark-900', value: 'veto' }, // רקע זהב/כתום, טקסט כהה
  { id: 3, label: '+10 Coins', color: '#1F2937', textClass: 'text-coins', value: 10 },
  { id: 4, label: '-10 Coins', color: '#F59E0B', textClass: 'text-dark-900', value: -10 },
  { id: 5, label: 'No Driving', color: '#1F2937', textClass: 'text-coins', value: 'no_drive' },
  { id: 6, label: 'Try Again', color: '#F59E0B', textClass: 'text-dark-900', value: 0 },
  { id: 7, label: '-15 Coins', color: '#1F2937', textClass: 'text-coins', value: -15 },
  { id: 8, label: '+5 Coins', color: '#F59E0B', textClass: 'text-dark-900', value: 5 },
]

export default function WheelOfFortune() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)

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

    const winningIndex = Math.floor(Math.random() * PRIZES.length)
    const sliceAngle = 360 / PRIZES.length
    const baseSpins = 360 * 5 
    
    // החישוב המדויק לעצירה באמצע המשולש
    const targetRotation = baseSpins + (360 - (winningIndex * sliceAngle)) - (sliceAngle / 2)

    setRotation((prev) => prev + targetRotation)

    setTimeout(() => {
      setIsSpinning(false)
      setResult(PRIZES[winningIndex].label)
    }, 5000)
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-dark-800 rounded-xl border border-dark-600 shadow-xl max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-white mb-8">Daily Spin</h2>
      
      <div className="relative w-72 h-72 md:w-80 md:h-80 mb-8">
        {/* המחט העליונה - עכשיו בזהב/כתום כדי לבלוט */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-coins drop-shadow-lg filter"></div>
        </div>

        {/* הגלגל עצמו */}
        <div 
          className="w-full h-full rounded-full border-4 border-dark-900 shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-hidden transition-transform duration-[5000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ 
            background: getWheelBackground(),
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {/* הטקסטים של הפרסים - תוקנו למרכוז מושלם! */}
          {PRIZES.map((prize, index) => {
            const rotationAngle = (index * (360 / PRIZES.length)) + ((360 / PRIZES.length) / 2)
            return (
              // העטיפה הזו מסתובבת
              <div
                key={prize.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                {/* העטיפה הזו ממורכזת למעלה ותמיד נשארת ישרה ביחס למשולש */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 flex items-start justify-center pt-4 md:pt-6">
                  <span 
                    className={`font-black text-xs md:text-sm whitespace-nowrap -rotate-90 translate-y-12 md:translate-y-14 drop-shadow-md ${prize.textClass}`}
                  >
                    {prize.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* העיגול הפנימי המרכזי */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-dark-900 rounded-full border-4 border-coins z-10 shadow-inner flex items-center justify-center">
          <span className="text-coins text-lg">🎡</span>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="w-full py-4 bg-gradient-to-r from-coins to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-dark-900 font-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] uppercase tracking-wider"
      >
        {isSpinning ? 'Good Luck...' : 'Spin Now!'}
      </button>

      {/* אזור התוצאה */}
      <div className="mt-8 h-16 flex items-center justify-center">
        {result && (
          <div className="text-center animate-fade-in bg-dark-900 px-6 py-3 rounded-lg border border-coins/30 shadow-lg">
            <p className="text-dark-400 text-xs uppercase tracking-widest mb-1">Result</p>
            <p className="text-xl font-bold text-coins">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}