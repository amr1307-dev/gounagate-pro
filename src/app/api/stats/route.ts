import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  const all = bookings || []

  const dailyStats: { date: string; total: number; completed: number }[] = []
  const dailyMap = new Map<string, { total: number; completed: number }>()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailyMap.set(key, { total: 0, completed: 0 })
  }

  for (const b of all) {
    const key = b.booking_date || b.created_at?.split('T')[0]
    if (dailyMap.has(key)) {
      const entry = dailyMap.get(key)!
      entry.total++
      if (b.status === 'completed') entry.completed++
    }
  }

  for (const [date, data] of dailyMap) {
    dailyStats.push({ date, ...data })
  }

  const peakHourCount: Record<number, number> = {}
  for (const b of all) {
    const hour = parseInt((b.booking_time || '00:00').split(':')[0])
    peakHourCount[hour] = (peakHourCount[hour] || 0) + 1
  }
  const peakHours = Object.entries(peakHourCount).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  })).sort((a, b) => a.hour - b.hour)

  const statusBreakdown = [
    { name: 'Confirmed', value: all.filter(b => b.status === 'confirmed').length },
    { name: 'Completed', value: all.filter(b => b.status === 'completed').length },
    { name: 'Cancelled', value: all.filter(b => b.status === 'cancelled').length },
  ].filter(s => s.value > 0)

  return NextResponse.json({
    dailyStats,
    peakHours,
    statusBreakdown,
  })
}
