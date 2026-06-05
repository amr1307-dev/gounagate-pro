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
    booking_date: string
    booking_time: string
    status: string
  }
}

export function QRScanner({ userId }: { userId?: string }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await handleScan(decodedText)
        },
        () => {}
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied. Please allow camera permissions.'
      setError(msg)
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    try {
      await scannerRef.current?.stop()
    } catch {}
    setScanning(false)
  }

  const handleScan = async (data: string) => {
    await stopScanning()

    try {
      const parsed = JSON.parse(data)

      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        setResult({ valid: false, message: 'QR code has expired — please ask the guest to refresh their QR' })
        return
      }

      const supabase = createClient()
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', parsed.id)
        .eq('hash', parsed.hash)
        .single()

      if (fetchError || !booking) {
        setResult({ valid: false, message: 'Invalid QR code — booking not found or hash mismatch' })
        return
      }

      if (booking.status === 'cancelled') {
        setResult({ valid: false, message: 'This booking was cancelled' })
        return
      }

      if (booking.status === 'completed') {
        setResult({
          valid: false,
          message: 'This session has already been completed',
          booking: {
            id: booking.id,
            booking_ref: booking.booking_ref,
            guest_name: booking.guest_name,
            guest_phone: booking.guest_phone,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            status: booking.status,
          },
        })
        return
      }

      setResult({
        valid: true,
        message: 'Booking verified — ready for check-in',
        booking: {
          id: booking.id,
          booking_ref: booking.booking_ref,
          guest_name: booking.guest_name,
          guest_phone: booking.guest_phone,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          status: booking.status,
        },
      })
    } catch {
      setResult({ valid: false, message: 'Invalid QR code format' })
    }
  }

  const checkIn = async () => {
    if (!result?.booking || !userId) return

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
      setResult({
        ...result,
        message: '📡 Queued offline — will sync when connected',
        booking: { ...result.booking!, status: 'completed' },
      })
      return
    }

    await supabase.from('qr_scans').insert({
      booking_id: result.booking.id,
      action: 'check-in',
    })

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Started', {
        body: `${result.booking.guest_name} has started their session.`,
        icon: '/favicon.ico',
      })
    }

    setResult({
      ...result,
      message: '✅ Session started successfully!',
      booking: { ...result.booking!, status: 'completed' },
    })
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
        await supabase.from('qr_scans').insert({
          booking_id: item.bookingId,
          action: 'check-in',
        })
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

  return (
    <div className="glass p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        📷 Scan QR Code
      </h2>

      {!scanning && !result && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-slate-500 mb-6">Point the camera at a guest&apos;s QR code to verify their booking.</p>
          <button onClick={startScanning} className="btn-primary text-lg px-10">
            📷 Start Camera
          </button>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}
        </div>
      )}

      {scanning && (
        <div className="text-center">
          <div id="qr-scanner-container" ref={containerRef} className="mb-4 flex justify-center" />
          <p className="text-sm text-slate-400 mb-4">Align QR code within the frame</p>
          <button onClick={stopScanning} className="btn-secondary">Cancel</button>
        </div>
      )}

      {result && (
        <div className="animate-slide-up">
          <div className={`p-6 rounded-xl mb-4 text-center ${
            result.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="text-5xl mb-3">{result.valid ? '✅' : '❌'}</div>
            <h3 className={`text-xl font-bold mb-1 ${result.valid ? 'text-emerald-700' : 'text-red-700'}`}>
              {result.valid ? 'Valid Booking' : 'Invalid Booking'}
            </h3>
            <p className={`text-sm ${result.valid ? 'text-emerald-600' : 'text-red-600'}`}>{result.message}</p>
          </div>

          {result.booking && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 border border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ref</span>
                <span className="font-bold text-[#0A6E74]">{result.booking.booking_ref}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Name</span>
                <span className="font-semibold">{result.booking.guest_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold">{result.booking.guest_phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date</span>
                <span className="font-semibold">{formatDate(result.booking.booking_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="font-semibold">{formatTime(result.booking.booking_time)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className={`status-badge ${result.booking.status}`}>
                  {result.booking.status}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {result.valid && result.booking?.status === 'confirmed' && (
              <button onClick={checkIn} className="btn-primary flex-1 justify-center text-lg py-4">
                ✅ Start Session
              </button>
            )}
            <button onClick={() => { setResult(null); setError(null) }} className="btn-secondary flex-1 justify-center">
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
