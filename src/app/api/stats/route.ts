import { createServerSupabase, getUserProfile } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const profile = await getUserProfile()
  if (!profile?.business_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', profile.business_id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  const all = bookings || []

  const dailyStats: { date: string; total: number; checkedIn: number }[] = []
  const dailyMap = new Map<string, { total: number; checkedIn: number }>()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailyMap.set(key, { total: 0, checkedIn: 0 })
  }

  for (const b of all) {
    const key = b.booking_date || b.created_at?.split('T')[0]
    if (dailyMap.has(key)) {
      const entry = dailyMap.get(key)!
      entry.total++
      if (b.status === 'checked-in') entry.checkedIn++
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
    { name: 'Checked In', value: all.filter(b => b.status === 'checked-in').length },
    { name: 'Cancelled', value: all.filter(b => b.status === 'cancelled').length },
    { name: 'No Show', value: all.filter(b => b.status === 'no-show').length },
  ].filter(s => s.value > 0)

  const { data: business } = await supabase
    .from('businesses')
    .select('max_capacity')
    .eq('id', profile.business_id)
    .single()

  const todayCheckedIn = all.filter(
    b => b.status === 'checked-in' && b.booking_date === new Date().toISOString().split('T')[0]
  ).length

  return NextResponse.json({
    dailyStats,
    peakHours,
    statusBreakdown,
    currentOccupancy: {
      current: todayCheckedIn,
      max: business?.max_capacity || 100,
    },
  })
}
