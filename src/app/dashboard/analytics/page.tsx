'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

type Stats = {
  dailyStats: { date: string; total: number; completed: number }[]
  peakHours: { hour: number; count: number }[]
  statusBreakdown: { name: string; value: number }[]
}

const COLORS = ['#0A6E74', '#10B981', '#EF4444', '#F59E0B']

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats?days=14')
      .then(r => r.json())
      .then(data => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="inline-block size-8 border-4 border-[#0A6E74]/30 border-t-[#0A6E74] rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-16 text-slate-500">Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Booking trends and performance metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PeakHoursChart data={stats.peakHours} />
        <StatusPie data={stats.statusBreakdown} />
      </div>

      <DailyTrendChart data={stats.dailyStats} />
    </div>
  )
}

function PeakHoursChart({ data }: { data: { hour: number; count: number }[] }) {
  return (
    <div className="glass p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Peak Hours</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}:00`} tick={{ fontSize: 11 }} />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="count" fill="#0A6E74" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatusPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="glass p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Status Breakdown</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function DailyTrendChart({ data }: { data: { date: string; total: number; completed: number }[] }) {
  return (
    <div className="glass p-6">
      <h3 className="font-semibold text-slate-900 mb-4">14-Day Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tickFormatter={(d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric' })} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#0A6E74" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
          <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
