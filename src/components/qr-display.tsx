'use client'

import { useEffect, useRef } from 'react'
import { getEgyptPhone } from '@/lib/utils'

type BookingData = {
  id: string
  booking_ref: string
  guest_name: string
  guest_phone: string
  booking_date: string
  booking_time: string
  guests: number
  hash: string
}

export function QRDisplay({
  booking,
  businessName,
  onNew
}: {
  booking: BookingData
  businessName: string
  onNew: () => void
}) {
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<any>(null)

  useEffect(() => {
    if (!qrRef.current || typeof QRCode === 'undefined') return

    qrRef.current.innerHTML = ''

    const qrData = JSON.stringify({
      id: booking.id,
      ref: booking.booking_ref,
      name: booking.guest_name,
      phone: booking.guest_phone,
      date: booking.booking_date,
      time: booking.booking_time,
      guests: booking.guests,
      hash: booking.hash,
    })

    qrInstance.current = new QRCode(qrRef.current, {
      text: qrData,
      width: 220,
      height: 220,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    })
  }, [booking])

  const downloadQR = async () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    if (typeof html2canvas !== 'undefined') {
      try {
        const c = await html2canvas(qrRef.current!, { backgroundColor: '#ffffff', scale: 3, useCORS: true })
        const link = document.createElement('a')
        link.download = `GounaGate-${booking.booking_ref}.png`
        link.href = c.toDataURL('image/png')
        link.click()
        return
      } catch {}
    }

    const link = document.createElement('a')
    link.download = `GounaGate-${booking.booking_ref}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const guestWa = () => {
    const msg = encodeURIComponent(
      `✅ GounaGate Booking Confirmed!\n` +
      `Ref: ${booking.booking_ref}\nName: ${booking.guest_name}\n` +
      `Date: ${booking.booking_date}\nTime: ${booking.booking_time}\n` +
      `Guests: ${booking.guests}\nHash: ${booking.hash}`
    )
    window.open(`https://wa.me/${getEgyptPhone(booking.guest_phone)}?text=${msg}`, '_blank')
  }

  const ownerWa = () => {
    const msg = encodeURIComponent(
      `🆕 New Booking - ${businessName}\n` +
      `Ref: ${booking.booking_ref}\nGuest: ${booking.guest_name}\n` +
      `Phone: ${booking.guest_phone}\nDate: ${booking.booking_date} at ${booking.booking_time}\n` +
      `Guests: ${booking.guests}\nStatus: Confirmed`
    )
    window.open(`https://wa.me/201028803080?text=${msg}`, '_blank')
  }

  const formatDate = (d: string) => {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="animate-slide-up">
      <div className="glass p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          ✅ Booking Confirmed
        </h2>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl" ref={qrRef} />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 border border-slate-100">
          <SummaryRow label="Ref" value={booking.booking_ref} badge />
          <SummaryRow label="Name" value={booking.guest_name} />
          <SummaryRow label="Phone" value={booking.guest_phone} />
          <SummaryRow label="Date" value={formatDate(booking.booking_date)} />
          <SummaryRow label="Time" value={booking.booking_time} />
          <SummaryRow label="Guests" value={`${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`} />
          <SummaryRow label="Hash" value={booking.hash} mono />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={downloadQR} className="btn-primary flex-1 justify-center">
            📥 Download QR
          </button>
          <button onClick={guestWa} className="btn-secondary flex-1 justify-center">
            📱 Send to Guest
          </button>
          <button onClick={ownerWa} className="btn-secondary flex-1 justify-center">
            📲 Notify Owner
          </button>
          <button onClick={onNew} className="btn-secondary flex-1 justify-center">
            ➕ New Booking
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, badge, mono }: { label: string; value: string; badge?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className={`font-semibold text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>
        {badge ? <span className="inline-block bg-[#0A6E74] text-white px-3 py-0.5 rounded-full text-xs font-bold">{value}</span> : value}
      </span>
    </div>
  )
}
