import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getEvents } from '../../services/api'

interface Event {
  id: number
  title: string
  date: string
  time: string
  type: string
}

const eventColors: Record<string, string> = {
  lecture: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
  lab: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  workshop: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  meeting: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  exam: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  deadline: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4)) // May 2026

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getEvents()
        setEvents(res.data)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const today = new Date()
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.date)
    return eventDate.getDate() === 13 && eventDate.getMonth() === 4 && eventDate.getFullYear() === 2026
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3 min-w-[140px] text-center">{monthName}</span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 p-6"
        >
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`text-center py-3 text-sm rounded-lg cursor-pointer transition-all duration-200 ${
                  day && isToday(day)
                    ? 'bg-primary-600 text-white font-medium shadow-lg shadow-primary-200 dark:shadow-primary-900/30'
                    : day
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                    : ''
                }`}
              >
                {day || ''}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's Events */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Today's Events</h3>
          <div className="space-y-3">
            {todayEvents.length > 0 ? todayEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`p-3 rounded-xl border ${eventColors[event.type] || eventColors.lecture}`}
              >
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs opacity-70 mt-0.5">{event.time}</p>
              </motion.div>
            )) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No events today</p>
            )}

            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6 mb-2">All Events</h4>
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`p-3 rounded-xl border ${eventColors[event.type] || eventColors.lecture}`}
              >
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs opacity-70 mt-0.5">{event.date} • {event.time}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
