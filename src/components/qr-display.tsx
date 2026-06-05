'use client'

import { useEffect, useRef, useState } from 'react'
import { getEgyptPhone, generateTimeBasedHash } from '@/lib/utils'

type BookingData = {
  id: string
  booking_ref: string
  guest_name: string
  guest_phone: string
  guest_email?: string
  booking_date: string
  booking_time: string
  total_price?: number
  hash: string
  special_requests?: string
  package_id?: string
  branch_id?: string
}

export function QRDisplay({
  booking,
  packageName,
  branchName,
  onNew
}: {
  booking: BookingData
  packageName: string
  branchName: string
  onNew: () => void
}) {
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<any>(null)
  const [expiresAt, setExpiresAt] = useState(Date.now() + 30000)
  const [ttl, setTtl] = useState(30)

  const generateQR = (expiry: number) => {
    if (!qrRef.current || typeof QRCode === 'undefined') return

    qrRef.current.innerHTML = ''

    const dynamicHash = generateTimeBasedHash(booking.id, booking.hash)

    const qrData = JSON.stringify({
      id: booking.id,
      ref: booking.booking_ref,
      name: booking.guest_name,
      phone: booking.guest_phone,
      date: booking.booking_date,
      time: booking.booking_time,
      hash: booking.hash,
      dynamicHash,
      expiresAt: expiry,
    })

    qrInstance.current = new QRCode(qrRef.current, {
      text: qrData,
      width: 220,
      height: 220,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    })
  }

  useEffect(() => {
    const expiry = Date.now() + 30000
    setExpiresAt(expiry)
    generateQR(expiry)

    const ttlInterval = setInterval(() => {
      setTtl(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }, 1000)

    const qrInterval = setInterval(() => {
      const nextExpiry = Date.now() + 30000
      setExpiresAt(nextExpiry)
      setTtl(30)
      generateQR(nextExpiry)
    }, 30000)

    return () => {
      clearInterval(ttlInterval)
      clearInterval(qrInterval)
    }
  }, [booking])

  const downloadQR = async () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    if (typeof html2canvas !== 'undefined') {
      try {
        const c = await html2canvas(qrRef.current!, { backgroundColor: '#ffffff', scale: 3, useCORS: true })
        const link = document.createElement('a')
        link.download = `ParadiseWorld-${booking.booking_ref}.png`
        link.href = c.toDataURL('image/png')
        link.click()
        return
      } catch {}
    }

    const link = document.createElement('a')
    link.download = `ParadiseWorld-${booking.booking_ref}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const guestWa = () => {
    const msg = encodeURIComponent(
      `✅ Paradise World Booking Confirmed!\n` +
      `Ref: ${booking.booking_ref}\nService: ${packageName}\nBranch: ${branchName}\n` +
      `Name: ${booking.guest_name}\nDate: ${booking.booking_date}\nTime: ${booking.booking_time}\n` +
      `Total: ${booking.total_price?.toLocaleString('en-EG') || ''} EGP\nHash: ${booking.hash}`
    )
    window.open(`https://wa.me/${getEgyptPhone(booking.guest_phone)}?text=${msg}`, '_blank')
  }

  const ownerWa = () => {
    const msg = encodeURIComponent(
      `🆕 New Booking - Paradise World\n` +
      `Ref: ${booking.booking_ref}\nService: ${packageName}\nBranch: ${branchName}\n` +
      `Guest: ${booking.guest_name}\nPhone: ${booking.guest_phone}\n` +
      `Date: ${booking.booking_date} at ${booking.booking_time}\n` +
      `Total: ${booking.total_price?.toLocaleString('en-EG') || ''} EGP\nStatus: Confirmed`
    )
    window.open(`https://wa.me/201019382288?text=${msg}`, '_blank')
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

        <div className="flex justify-center mb-2">
          <div className="bg-white p-4 rounded-xl" ref={qrRef} />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${ttl > 10 ? 'bg-emerald-500' : ttl > 5 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="font-mono text-slate-500">QR refreshes in {ttl}s</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 border border-slate-100">
          <SummaryRow label="Ref" value={booking.booking_ref} badge />
          <SummaryRow label="Service" value={packageName} />
          <SummaryRow label="Branch" value={branchName} />
          <SummaryRow label="Name" value={booking.guest_name} />
          <SummaryRow label="Phone" value={booking.guest_phone} />
          <SummaryRow label="Date" value={formatDate(booking.booking_date)} />
          <SummaryRow label="Time" value={booking.booking_time} />
          <SummaryRow label="Total" value={`${booking.total_price?.toLocaleString('en-EG') || ''} EGP`} />
          <SummaryRow label="Hash" value={booking.hash} mono />
          <SummaryRow label="Dynamic" value={generateTimeBasedHash(booking.id, booking.hash)} mono />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={downloadQR} className="btn-primary flex-1 justify-center">
            📥 Download QR
          </button>
          <button onClick={guestWa} className="btn-secondary flex-1 justify-center">
            📱 Send to Guest
          </button>
          <button onClick={ownerWa} className="btn-secondary flex-1 justify-center">
            📲 Notify Spa
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
