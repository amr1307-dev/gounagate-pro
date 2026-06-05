'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateBookingRef, generateHash, getTodayStr } from '@/lib/utils'
import { QRDisplay } from './qr-display'

type BookingData = {
  id: string
  booking_ref: string
  guest_name: string
  guest_phone: string
  guest_email: string
  booking_date: string
  booking_time: string
  total_price: number
  special_requests: string
  hash: string
  status: string
  created_at: string
  package_id?: string
  branch_id?: string
}

type Package = {
  id: string
  name_en: string
  price: number
  duration_minutes: number
  categories: { name_en: string }
}

type Branch = {
  id: string
  name_en: string
  name_ar: string
  address: string
}

export function BookingForm({ pkg, branches }: { pkg: Package; branches: Branch[] }) {
  const [step, setStep] = useState<'form' | 'result'>('form')
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    const form = e.currentTarget
    const data = {
      guest_name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      guest_phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      guest_email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      branch_id: (form.elements.namedItem('branch') as HTMLSelectElement).value,
      booking_date: (form.elements.namedItem('date') as HTMLInputElement).value,
      booking_time: (form.elements.namedItem('time') as HTMLInputElement).value,
      special_requests: (form.elements.namedItem('requests') as HTMLTextAreaElement).value.trim(),
    }

    const newErrors: Record<string, string> = {}

    if (data.guest_name.length < 3) newErrors.name = 'At least 3 characters required'
    if (!/^01[0-9]{9}$/.test(data.guest_phone)) newErrors.phone = 'Valid Egyptian number required (01xxxxxxxxx)'
    if (data.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guest_email)) newErrors.email = 'Valid email required'
    if (!data.booking_date) newErrors.date = 'Please select a date'
    if (!data.booking_time) newErrors.time = 'Please select a time'
    if (!data.branch_id) newErrors.branch = 'Please select a branch'

    if (data.booking_date && data.booking_time) {
      const dt = new Date(`${data.booking_date}T${data.booking_time}`)
      if (dt <= new Date()) newErrors.date = 'Date and time must be in the future'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const id = crypto.randomUUID()
      const bookingRef = generateBookingRef()
      const hash = generateHash({ id, name: data.guest_name, phone: data.guest_phone, date: data.booking_date, time: data.booking_time })

      const newBooking: BookingData = {
        id,
        booking_ref: bookingRef,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        guest_email: data.guest_email,
        package_id: pkg.id,
        branch_id: data.branch_id,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        total_price: pkg.price,
        special_requests: data.special_requests,
        hash,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      }

      const supabase = createClient()
      const { error } = await supabase.from('bookings').insert({
        id: newBooking.id,
        booking_ref: newBooking.booking_ref,
        package_id: pkg.id,
        branch_id: data.branch_id,
        guest_name: newBooking.guest_name,
        guest_phone: newBooking.guest_phone,
        guest_email: newBooking.guest_email,
        booking_date: newBooking.booking_date,
        booking_time: newBooking.booking_time,
        total_price: pkg.price,
        special_requests: newBooking.special_requests,
        hash: newBooking.hash,
        status: newBooking.status,
      })

      if (error) throw error

      setBooking(newBooking)
      setStep('result')
    } catch (err) {
      console.error('Booking error:', err)
      setErrors({ submit: 'Failed to create booking. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'result' && booking) {
    return <QRDisplay booking={booking} packageName={pkg.name_en} branchName={branches.find(b => b.id === booking.branch_id)?.name_en || ''} onNew={() => { setStep('form'); setBooking(null) }} />
  }

  return (
    <div className="glass p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        📋 Book Your Session
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name" error={errors.name} required>
            <input name="name" type="text" className={`input-field ${errors.name ? 'error' : ''}`} placeholder="e.g. Omar Hassan" required minLength={3} />
          </FormField>
          <FormField label="Phone Number" error={errors.phone} required>
            <input name="phone" type="tel" className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="e.g. 01234567890" required />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input name="email" type="email" className={`input-field ${errors.email ? 'error' : ''}`} placeholder="email@example.com" />
          </FormField>
          <FormField label="Branch" error={errors.branch} required>
            <select name="branch" className={`input-field ${errors.branch ? 'error' : ''}`} required>
              <option value="">Select a branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name_en} - {b.name_ar}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Date" error={errors.date} required>
            <input name="date" type="date" className={`input-field ${errors.date ? 'error' : ''}`} defaultValue={getTodayStr()} min={getTodayStr()} required />
          </FormField>
          <FormField label="Time" error={errors.time} required>
            <input name="time" type="time" className={`input-field ${errors.time ? 'error' : ''}`} defaultValue={new Date().toTimeString().slice(0, 5)} required />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Special Requests">
              <textarea name="requests" className="input-field min-h-[72px] resize-y" placeholder="Any special requests..." rows={2} />
            </FormField>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{errors.submit}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `✅ Book Now - ${pkg.price.toLocaleString('en-EG')} EGP`
          )}
        </button>
      </form>
    </div>
  )
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
