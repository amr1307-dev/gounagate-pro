'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Booking = {
  id: string
  booking_ref: string
  guest_name: string
  guest_phone: string
  guest_email: string
  booking_date: string
  booking_time: string
  guests: number
  special_requests: string
  status: string
  hash: string
  checked_in_at: string | null
  created_at: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    let result = bookings
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.booking_ref?.toLowerCase().includes(q) ||
        b.guest_name.toLowerCase().includes(q) ||
        b.guest_phone.includes(q)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, bookings])

  async function loadBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookings(data as Booking[])
      setFiltered(data as Booking[])
    }
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        ...(newStatus === 'checked-in' ? { checked_in_at: new Date().toISOString() } : {}),
      })
      .eq('id', id)

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    }
  }

  async function deleteBooking(id: string) {
    if (!confirm('Are you sure you want to delete this booking?')) return
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id))
    }
  }

  const exportCSV = () => {
    const headers = ['Ref', 'Name', 'Phone', 'Email', 'Date', 'Time', 'Guests', 'Status', 'Hash', 'Created']
    const rows = filtered.map(b => [
      b.booking_ref, `"${b.guest_name}"`, b.guest_phone, b.guest_email,
      b.booking_date, b.booking_time, b.guests, b.status, b.hash, b.created_at
    ].join(','))
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `GounaGate-Bookings-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const statusMap: Record<string, string> = {
    confirmed: 'Confirmed', 'checked-in': 'Checked In', cancelled: 'Cancelled', pending: 'Pending', 'no-show': 'No Show',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500">Manage and monitor all reservations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary text-sm px-4">
            📤 Export CSV
          </button>
          <button onClick={loadBookings} className="btn-secondary text-sm px-4">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Search by name, ID, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
          <option value="no-show">No Show</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 text-center text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <p>{search || statusFilter !== 'all' ? 'No bookings match your filters' : 'No bookings yet'}</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-3 font-medium">Ref</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium text-center">Guests</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100 text-slate-700 hover:bg-slate-50/50">
                    <td className="p-3">
                      <span className="inline-block bg-[#0A6E74]/10 text-[#0A6E74] px-2 py-0.5 rounded text-xs font-bold">
                        {b.booking_ref || b.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{b.guest_name}</td>
                    <td className="p-3 text-slate-400">{b.guest_phone}</td>
                    <td className="p-3 text-slate-500">{new Date(b.booking_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-3 text-slate-500">{b.booking_time}</td>
                    <td className="p-3 text-center">{b.guests}</td>
                    <td className="p-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer"
                      >
                        {Object.entries(statusMap).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteBooking(b.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 text-xs text-slate-400 border-t border-slate-100 text-center">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
      )}
    </div>
  )
}
