'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Html5Qrcode } from 'html5-qrcode'
import { formatDate, formatTime } from '@/lib/utils'
import { enqueueCheckIn, syncQueue } from '@/lib/offline-queue'

type ScanResult = {
  valid: boolean
  message: string
  booking?: {
    id: string
    booking_ref: string
    guest_name: string
    guest_phone: string
    guest_email: string
    booking_date: string
    booking_time: string
    total_price: number
    status: string
    package_name?: string
    package_price?: number
    package_duration?: number
    branch_name?: string
    special_requests?: string
  }
}

function playSuccessSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, ctx.currentTime)
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1)
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch {}
}

function playErrorSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

export function QRScanner({ userId }: { userId?: string }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanning = async () => {
    setError(null)
    setResult(null)
    setScanning(true)

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-scanner-container')
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 280, height: 280 }, aspectRatio: 1 },
        async (decodedText) => { await handleScan(decodedText) },
        () => {}
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied. Please allow camera permissions.'
      setError(msg)
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    try { await scannerRef.current?.stop() } catch {}
    setScanning(false)
  }

  const handleScan = async (data: string) => {
    await stopScanning()

    try {
      const parsed = JSON.parse(data)

      if ((parsed.exp || parsed.expiresAt) && Date.now() > (parsed.exp || parsed.expiresAt)) {
        playErrorSound()
        setResult({ valid: false, message: 'QR code has expired - please ask the guest to refresh their QR' })
        return
      }

      const supabase = createClient()

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*, packages!inner(name_en, price, duration_minutes), branches!inner(name_en)')
        .eq('id', parsed.id)
        .eq('hash', parsed.hash)
        .single()

      if (fetchError || !booking) {
        playErrorSound()
        setResult({ valid: false, message: 'Invalid QR code - booking not found or hash mismatch' })
        return
      }

      if (booking.status === 'cancelled') {
        playErrorSound()
        setResult({ valid: false, message: 'This booking was cancelled' })
        return
      }

      if (booking.status === 'completed') {
        playErrorSound()
        setResult({ valid: false, message: 'This session has already been completed', booking: formatBooking(booking) })
        return
      }

      const resp = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: parsed.id, hash: parsed.hash, dynamicHash: parsed.dyn || parsed.dynamicHash }),
      })

      const verifyResult = await resp.json()

      if (!verifyResult.valid) {
        playErrorSound()
        setResult({ valid: false, message: verifyResult.message })
        return
      }

      playSuccessSound()
      setResult({ valid: true, message: 'Booking verified - ready for check-in', booking: formatBooking(booking) })
    } catch {
      playErrorSound()
      setResult({ valid: false, message: 'Invalid QR code format' })
    }
  }

  const formatBooking = (b: any): ScanResult['booking'] => ({
    id: b.id,
    booking_ref: b.booking_ref,
    guest_name: b.guest_name,
    guest_phone: b.guest_phone,
    guest_email: b.guest_email || '',
    booking_date: b.booking_date,
    booking_time: b.booking_time,
    total_price: b.total_price || b.packages?.price || 0,
    status: b.status,
    package_name: b.packages?.name_en,
    package_price: b.packages?.price,
    package_duration: b.packages?.duration_minutes,
    branch_name: b.branches?.name_en,
    special_requests: b.special_requests,
  })

  const checkIn = async () => {
    if (!result?.booking || !userId) return

    setCheckingIn(true)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', result.booking.id)

    if (updateError) {
      await enqueueCheckIn({
        bookingId: result.booking.id,
        guestName: result.booking.guest_name,
        scannedBy: userId,
      })
      setResult({ ...result, message: 'Queued offline - will sync when connected', booking: { ...result.booking!, status: 'completed' } })
      setCheckingIn(false)
      return
    }

    await supabase.from('qr_scans').insert({ booking_id: result.booking.id, action: 'check-in' })

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Started', {
        body: `${result.booking.guest_name} has started their session.`,
        icon: '/favicon.ico',
      })
    }

    setResult({ ...result, message: 'Session started successfully!', booking: { ...result.booking!, status: 'completed' } })
    setCheckingIn(false)
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const doSync = async () => {
      if (!navigator.onLine) return
      const supabase = createClient()
      await syncQueue(async (item) => {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', item.bookingId)
        if (error) return false
        await supabase.from('qr_scans').insert({ booking_id: item.bookingId, action: 'check-in' })
        return true
      })
    }

    doSync()
    window.addEventListener('online', doSync)
    return () => {
      window.removeEventListener('online', doSync)
      scannerRef.current?.stop().catch(() => {})
    }
  }, [userId])

  const resetView = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A6E74] to-[#065256] text-white text-3xl mb-3 shadow-lg shadow-[#0A6E74]/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Scan QR Code</h1>
        <p className="text-slate-500 mt-1">Verify guest bookings and start sessions</p>
      </div>

      {/* Camera / Scanner */}
      <div className="glass p-4 sm:p-6">
        {!scanning && !result && (
          <div className="text-center py-10">
            <div className="relative mx-auto w-48 h-48 mb-8">
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#0A6E74]/30 animate-pulse-soft" />
              <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-[#0A6E74]/5 to-[#D4A843]/5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A6E74]/40"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </div>
            </div>
            <p className="text-slate-500 mb-6 max-w-xs mx-auto">Point the camera at a guest&apos;s QR code to verify their booking instantly</p>
            <button onClick={startScanning} className="btn-primary text-lg px-10 shadow-lg shadow-[#0A6E74]/20">
              Start Camera
            </button>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 justify-center">
                <span>&#x26A0;</span> {error}
              </div>
            )}
          </div>
        )}

        {scanning && (
          <div className="text-center">
            <div className="relative">
              <div id="qr-scanner-container" className="mb-4 flex justify-center" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[280px] pointer-events-none">
                <div className="scan-frame" />
                <div className="scan-line" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">Align QR code within the frame</p>
            <button onClick={stopScanning} className="btn-secondary">Cancel</button>
          </div>
        )}

        {result && (
          <div className="animate-slide-up space-y-4">
            {/* Status Banner */}
            <div className={`p-6 rounded-xl text-center ${result.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl ${result.valid ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {result.valid ? '\u2705' : '\u274C'}
              </div>
              <h3 className={`text-xl font-bold mb-1 ${result.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.valid ? 'Valid Booking' : 'Invalid Booking'}
              </h3>
              <p className={`text-sm ${result.valid ? 'text-emerald-600' : 'text-red-600'}`}>{result.message}</p>
            </div>

            {/* Booking Details Card */}
            {result.booking && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A6E74] to-[#065256] px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-80">{result.booking.booking_ref}</span>
                    <span className={`status-badge text-xs ${result.booking.status === 'completed' ? 'bg-blue-200 text-blue-900' : result.booking.status === 'cancelled' ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'}`}>
                      {result.booking.status}
                    </span>
                  </div>
                </div>

                {/* Guest Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A6E74] to-[#065256] text-white flex items-center justify-center text-sm font-bold">
                      {result.booking.guest_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{result.booking.guest_name}</p>
                      <p className="text-sm text-slate-500">{result.booking.guest_phone}</p>
                    </div>
                  </div>

                  <DetailRow icon={<CalendarIcon />} label="Date" value={formatDate(result.booking.booking_date)} />
                  <DetailRow icon={<ClockIcon />} label="Time" value={formatTime(result.booking.booking_time)} />

                  {result.booking.package_name && (
                    <DetailRow icon={<SparklesIcon />} label="Service" value={result.booking.package_name} />
                  )}

                  {result.booking.package_duration && (
                    <DetailRow icon={<TimerIcon />} label="Duration" value={`${result.booking.package_duration} min`} />
                  )}

                  {result.booking.branch_name && (
                    <DetailRow icon={<MapPinIcon />} label="Branch" value={result.booking.branch_name} />
                  )}

                  <DetailRow icon={<TagIcon />} label="Total" value={`${(result.booking.total_price || result.booking.package_price || 0).toLocaleString('en-EG')} EGP`} highlight />

                  {result.booking.special_requests && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Special Requests</p>
                      <p className="text-sm text-slate-600 italic">{result.booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {result.valid && result.booking?.status === 'confirmed' && (
                <button
                  onClick={checkIn}
                  disabled={checkingIn}
                  className="btn-primary flex-1 justify-center text-lg py-4 shadow-lg shadow-[#0A6E74]/20 disabled:opacity-50"
                >
                  {checkingIn ? 'Starting...' : 'Start Session'}
                </button>
              )}
              <button onClick={resetView} className="btn-secondary flex-1 justify-center">
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-5 h-5 flex items-center justify-center text-slate-400 flex-shrink-0">{icon}</span>
      <span className="text-slate-400 flex-1">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-[#D4A843] text-base' : 'text-slate-800'}`}>{value}</span>
    </div>
  )
}

function CalendarIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }

function ClockIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }

function SparklesIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="M12 3l2.5 2.5"/><path d="M9.5 18.5L12 21"/><path d="M3 12l2.5-2.5"/><path d="M18.5 9.5L21 12"/><path d="M12 3l-2.5 2.5"/><path d="M14.5 18.5L12 21"/><path d="M21 12l-2.5-2.5"/><path d="M5.5 9.5L3 12"/></svg> }

function TimerIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="2" x2="12" y2="6"/><circle cx="12" cy="14" r="8"/><line x1="12" y1="14" x2="12" y2="10"/></svg> }

function MapPinIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }

function TagIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> }
