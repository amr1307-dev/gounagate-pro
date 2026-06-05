type Booking = {
  id: string
  booking_ref: string
  guest_name: string
  guest_phone: string
  booking_date: string
  booking_time: string
  total_price?: number
  status: string
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function BookingTable({ bookings, compact }: { bookings: Booking[]; compact?: boolean }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-sm">No bookings yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
            <th className="pb-3 font-medium pr-4">Ref</th>
            <th className="pb-3 font-medium pr-4">Name</th>
            {!compact && <th className="pb-3 font-medium pr-4">Phone</th>}
            <th className="pb-3 font-medium pr-4">Date</th>
            <th className="pb-3 font-medium pr-4">Time</th>
            <th className="pb-3 font-medium pr-4 text-right">Total</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-slate-100 text-slate-700">
              <td className="py-3 pr-4">
                <span className="inline-block bg-[#0A6E74]/10 text-[#0A6E74] px-2 py-0.5 rounded text-xs font-bold">
                  {b.booking_ref || b.id.slice(0, 8)}
                </span>
              </td>
              <td className="py-3 pr-4 font-medium">{b.guest_name}</td>
              {!compact && <td className="py-3 pr-4 text-slate-400">{b.guest_phone}</td>}
              <td className="py-3 pr-4 text-slate-500">{formatDate(b.booking_date)}</td>
              <td className="py-3 pr-4 text-slate-500">{b.booking_time}</td>
              <td className="py-3 pr-4 text-right font-semibold text-[#D4A843]">{b.total_price?.toLocaleString('en-EG') || ''} EGP</td>
              <td className="py-3">
                <span className={`status-badge ${b.status}`}>{b.status === 'completed' ? 'Completed' : b.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
