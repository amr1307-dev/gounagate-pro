import { createServerSupabase, getUserProfile } from '@/lib/supabase-server'
import { StatsCards } from '@/components/stats-cards'
import { BookingTable } from '@/components/booking-table'
import { ChartSection } from '@/components/chart-section'

export default async function DashboardPage() {
  const profile = await getUserProfile()
  const businessId = profile?.business_id

  if (!businessId) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🏗️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Business Found</h2>
        <p className="text-slate-500">Create a business first to see the dashboard.</p>
      </div>
    )
  }

  const supabase = await createServerSupabase()

  const today = new Date().toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .eq('booking_date', today)
    .order('booking_time', { ascending: true })

  const all = bookings || []
  const todayB = todayBookings || []

  const stats = {
    total: all.length,
    todayCount: todayB.length,
    checkedIn: all.filter(b => b.status === 'checked-in').length,
    capacity: 0,
  }

  const recentBookings = all.slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your bookings and activity</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSection bookings={all} />
        <div className="glass p-6">
          <h3 className="font-semibold text-slate-900 mb-4">📋 Recent Bookings</h3>
          <BookingTable bookings={recentBookings} compact />
        </div>
      </div>

      <div className="text-center">
        <a href="/dashboard/bookings" className="text-sm text-[#0A6E74] font-medium hover:underline">
          View all bookings →
        </a>
      </div>
    </div>
  )
}
