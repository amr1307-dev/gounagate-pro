'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Booking = {
  id: string
  booking_ref: string
  guest_name: string
  booking_date: string
  booking_time: string
  guests: number
  status: string
}

const statusColors: Record<string, string> = {
  confirmed: '#0A6E74',
  'checked-in': '#10B981',
  cancelled: '#EF4444',
  pending: '#F59E0B',
  'no-show': '#94A3B8',
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]

    supabase
      .from('bookings')
      .select('id, booking_ref, guest_name, booking_date, booking_time, guests, status')
      .gte('booking_date', startOfMonth)
      .lte('booking_date', endOfMonth)
      .order('booking_date', { ascending: true })
      .then(({ data }) => {
        if (data) setBookings(data as Booking[])
      })
  }, [currentMonth])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const today = new Date().toISOString().split('T')[0]

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const dayBookings = bookings.filter(b => b.booking_date === selectedDate)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-sm text-slate-500">View bookings by date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="btn-secondary text-sm px-3 py-1.5">←</button>
            <h2 className="text-lg font-semibold text-slate-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={nextMonth} className="btn-secondary text-sm px-3 py-1.5">→</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs text-slate-400 font-medium py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
              const dateStr = date.toISOString().split('T')[0]
              const dayBookingsCount = bookings.filter(b => b.booking_date === dateStr).length
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate

              return (
                <button
                  key={i + 1}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative p-2 rounded-lg text-sm transition ${
                    isSelected
                      ? 'bg-[#0A6E74] text-white'
                      : isToday
                        ? 'bg-teal-50 text-slate-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {i + 1}
                  {dayBookingsCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 size-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isSelected ? 'bg-white text-[#0A6E74]' : 'bg-[#0A6E74] text-white'
                    }`}>
                      {dayBookingsCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            📅 {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          {dayBookings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No bookings for this date</div>
          ) : (
            <div className="space-y-3">
              {dayBookings.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-slate-900">{b.guest_name}</span>
                    <span className="text-xs font-bold text-slate-400">{b.booking_time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{b.guests} {b.guests === 1 ? 'guest' : 'guests'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: statusColors[b.status] + '20',
                        color: statusColors[b.status],
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
