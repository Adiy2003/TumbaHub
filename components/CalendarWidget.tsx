'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Car, Home, GlassWater } from 'lucide-react'

// הגדרת המבנה של אירוע
interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  type: string
  createdByName: string
}

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  
  // מצבי המודאל
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  // מצבי הטופס
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventType, setNewEventType] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  // שליפת אירועים בטעינת הקומפוננטה
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      if (data.events) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to load events', error)
    }
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // ממיר את היום, החודש והשנה לסטרינג מדויק (YYYY-MM-DD)
  const formatDateString = (d: number, m: number, y: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))

  // כשלוחצים על משבצת של יום בלוח
  const handleDayClick = (day: number) => {
    const dateStr = formatDateString(day, month, year)
    setSelectedDate(dateStr)
    setIsModalOpen(true)
  }

  // שמירת האירוע במסד הנתונים
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim() || !selectedDate) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEventTitle,
          date: selectedDate,
          type: newEventType
        })
      })

      const data = await res.json()
      if (data.success) {
        setEvents([...events, data.event]) // מוסיף את האירוע החדש למסך מיד
        setNewEventTitle('')
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error('Error saving event', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // שליפת האירועים הרלוונטיים לתאריך שנבחר כדי להציג במודאל
  const selectedDayEvents = selectedDate ? events.filter(e => e.date === selectedDate) : []

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-5 sm:p-6 shadow-xl w-full relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-coins" size={24} />
          <h2 className="text-xl font-bold text-white">
            {monthNames[month]} <span className="text-dark-400 font-medium">{year}</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg bg-dark-900/50 text-dark-400 hover:text-coins hover:bg-dark-700 transition-colors border border-dark-600">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg bg-dark-900/50 text-dark-400 hover:text-coins hover:bg-dark-700 transition-colors border border-dark-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-dark-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square rounded-lg bg-transparent"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const today = isToday(day)
            const dateStr = formatDateString(day, month, year)
            // מוצא אם יש אירועים ליום הספציפי הזה בתוך הלולאה
            const dayEvents = events.filter(e => e.date === dateStr)
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm sm:text-base font-medium transition-all duration-200 group
                  ${today 
                    ? 'bg-coins text-dark-900 shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:bg-yellow-400' 
                    : 'bg-dark-900/30 text-white border border-dark-700 hover:border-coins/50 hover:bg-dark-700'
                  }
                `}
              >
                <span className={dayEvents.length > 0 && !today ? '-translate-y-1' : ''}>{day}</span>
                
                {/* הנקודות של האירועים */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-1 absolute bottom-1.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <span 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          today ? 'bg-dark-900' : 
                          event.type === 'drive' ? 'bg-blue-400' : 
                          event.type === 'host' ? 'bg-green-400' : 'bg-coins'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <Plus size={12} className={`absolute top-1 right-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${today ? 'text-dark-900' : 'text-dark-500'}`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* --- המודאל של הוספת אירוע --- */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative z-10 w-full max-w-md bg-dark-800 rounded-xl border border-dark-600 shadow-2xl p-6 animate-fade-in-up">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Events for {new Date(selectedDate).toLocaleDateString('en-GB')}
            </h3>

            {/* רשימת אירועים קיימים לאותו יום */}
            <div className="mb-6 space-y-2 mt-4">
              {selectedDayEvents.length === 0 ? (
                <p className="text-dark-400 text-sm">No events scheduled for this day.</p>
              ) : (
                selectedDayEvents.map(event => (
                  <div key={event.id} className="bg-dark-700/50 border border-dark-600 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {event.type === 'drive' ? <Car size={16} className="text-blue-400" /> : 
                       event.type === 'host' ? <Home size={16} className="text-green-400" /> : 
                       <GlassWater size={16} className="text-coins" />}
                      <span className="font-medium text-white">{event.title}</span>
                    </div>
                    <span className="text-xs text-dark-400">by {event.createdByName}</span>
                  </div>
                ))
              )}
            </div>

            {/* טופס הוספה חדש */}
            <form onSubmit={handleAddEvent} className="border-t border-dark-700 pt-4 mt-2">
              <p className="text-sm font-semibold text-coins mb-3 uppercase tracking-wider">Add New Event</p>
              
              <input
                type="text"
                placeholder="What's happening?"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white mb-3 focus:outline-none focus:border-coins transition-colors"
                required
              />

              <div className="grid grid-cols-3 gap-2 mb-4">
                <button type="button" onClick={() => setNewEventType('general')} className={`p-2 rounded-lg text-sm font-medium border transition-colors ${newEventType === 'general' ? 'bg-coins/20 border-coins text-coins' : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-500'}`}>
                  General
                </button>
                <button type="button" onClick={() => setNewEventType('drive')} className={`p-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1 ${newEventType === 'drive' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-500'}`}>
                  Drive
                </button>
                <button type="button" onClick={() => setNewEventType('host')} className={`p-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1 ${newEventType === 'host' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-500'}`}>
                  Host
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newEventTitle.trim()}
                className="w-full bg-coins hover:bg-yellow-400 text-dark-900 font-bold rounded-lg p-3 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}