'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Booking = {
  id: string
  booking_date: string
  status: string
  created_at: string
}

export function ChartSection({ bookings }: { bookings: Booking[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const data = last7Days.map(date => {
    const dayBookings = bookings.filter(b => b.booking_date === date)
    return {
      date: new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      bookings: dayBookings.length,
      completed: dayBookings.filter(b => b.status === 'completed').length,
    }
  })

  return (
    <div className="glass p-6">
      <h3 className="font-semibold text-slate-900 mb-4">📈 7-Day Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32} barGap={4}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: 13,
              }}
            />
            <Bar dataKey="bookings" fill="#0A6E74" radius={[4, 4, 0, 0]} name="Bookings" />
            <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
