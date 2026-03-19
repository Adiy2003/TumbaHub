import WheelOfFortune from '@/components/WheelOfFortune' // וודא שהנתיב תואם לאיפה ששמרת את הקומפוננטה

export const metadata = {
  title: 'Daily Wheel | TumbaHub',
  description: 'Spin the daily wheel to win TumbaCoins and exclusive items!',
}

export default function WheelPage() {
  return (
    <div className="min-h-screen py-20 px-4 flex flex-col items-center">
      <div className="text-center mb-10 max-w-lg mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coins to-yellow-500 mb-4 drop-shadow-sm">
          Daily Fortune Wheel
        </h1>
        <p className="text-dark-400 text-lg">
          Feeling lucky today? Spin the wheel to win TumbaCoins, special items, or maybe... a penalty! 😈
        </p>
      </div>

      {/* הקומפוננטה שיצרנו קודם */}
      <WheelOfFortune />
      
      {/* פה נוסיף בהמשך את הטיימר שסופר לאחור לסיבוב של מחר */}
      <div className="mt-8 text-dark-500 text-sm font-medium">
        Come back every day for a free spin!
      </div>
    </div>
  )
}