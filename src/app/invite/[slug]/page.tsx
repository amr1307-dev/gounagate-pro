'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateBookingRef, generateHash, getTodayStr } from '@/lib/utils'
import { QRDisplay } from '@/components/qr-display'
import { useParams } from 'next/navigation'
import Script from 'next/script'

type InviteData = {
  id: string
  business_id: string
  slug: string
  description: string
  max_uses: number
  use_count: number
  is_active: boolean
  expires_at: string | null
  businesses: { name: string; slug: string }
}

type BookingData = {
  id: string
  booking_ref: string
  guest_name: string
  guest_phone: string
  guest_email: string
  car_plate: string
  booking_date: string
  booking_time: string
  guests: number
  hash: string
  status: string
  created_at: string
}

export default function InvitePage() {
  const { slug } = useParams()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'result'>('form')
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/invite?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.error) {
          setError('Invite link not found or expired')
          return
        }
        if (!data.is_active) {
          setError('This invite link is no longer active')
          return
        }
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError('This invite link has expired')
          return
        }
        if (data.max_uses > 0 && data.use_count >= data.max_uses) {
          setError('This invite link has reached its maximum uses')
          return
        }
        setInvite(data)
      })
      .catch(() => setError('Failed to load invite'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const form = e.currentTarget
    const data = {
      guest_name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      guest_phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      guest_email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      car_plate: (form.elements.namedItem('plate') as HTMLInputElement).value.trim(),
      booking_date: (form.elements.namedItem('date') as HTMLInputElement).value,
      booking_time: (form.elements.namedItem('time') as HTMLInputElement).value,
      guests: parseInt((form.elements.namedItem('guests') as HTMLInputElement).value),
    }

    if (!data.guest_name || !data.guest_phone || !data.booking_date || !data.booking_time || !data.guests) {
      setSaving(false)
      return
    }

    try {
      const id = crypto.randomUUID()
      const bookingRef = generateBookingRef()
      const hash = generateHash({
        id, name: data.guest_name, phone: data.guest_phone,
        date: data.booking_date, time: data.booking_time, plate: data.car_plate,
      })

      const supabase = createClient()
      const { error: insertError } = await supabase.from('bookings').insert({
        id,
        business_id: invite!.business_id,
        booking_ref: bookingRef,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        guest_email: data.guest_email,
        car_plate: data.car_plate,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        guests: data.guests,
        hash,
        status: 'confirmed',
      })

      if (insertError) throw insertError

      await fetch(`/api/invite?slug=${slug}`, { method: 'PUT' })

      setBooking({
        id, booking_ref: bookingRef, hash, status: 'confirmed', created_at: new Date().toISOString(),
        guest_name: data.guest_name, guest_phone: data.guest_phone, guest_email: data.guest_email,
        car_plate: data.car_plate,
        booking_date: data.booking_date, booking_time: data.booking_time, guests: data.guests,
      })
      setStep('result')
    } catch {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block size-8 border-4 border-[#0A6E74]/30 border-t-[#0A6E74] rounded-full animate-spin mb-4" />
          <p className="text-slate-500">Loading invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invite</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (step === 'result' && booking && invite) {
    return (
      <>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" strategy="lazyOnload" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
          <QRDisplay booking={booking} businessName={invite.businesses.name} onNew={() => { setStep('form'); setBooking(null) }} />
        </div>
      </>
    )
  }

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{invite?.businesses.name}</h1>
          {invite?.description && (
            <p className="text-slate-500 mt-2">{invite.description}</p>
          )}
          <p className="text-slate-400 text-sm mt-1">Register yourself — no app needed</p>
        </div>

        <div className="glass p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">📋 Quick Registration</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Full Name *</label>
                <input name="name" type="text" className="input-field" placeholder="e.g. Omar Hassan" required minLength={3} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Phone *</label>
                <input name="phone" type="tel" className="input-field" placeholder="e.g. 01234567890" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Car Plate</label>
                <input name="plate" type="text" className="input-field" placeholder="e.g. 1234 ABC" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Email</label>
                <input name="email" type="email" className="input-field" placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Date *</label>
                <input name="date" type="date" className="input-field" defaultValue={getTodayStr()} min={getTodayStr()} required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Time *</label>
                <input name="time" type="time" className="input-field" defaultValue={new Date().toTimeString().slice(0, 5)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Guests *</label>
                <input name="guests" type="number" className="input-field" defaultValue={1} min={1} max={50} required />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center text-base">
              {saving ? 'Registering...' : '✅ Register & Get QR'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
