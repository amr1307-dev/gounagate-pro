'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Toast = {
  id: string
  message: string
  type: 'check-in' | 'new-booking'
}

export function RealtimeToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `status=eq.completed`,
        },
        (payload) => {
          const booking = payload.new as any
          const toast: Toast = {
            id: crypto.randomUUID(),
            message: `✅ ${booking.guest_name} started their session!`,
            type: 'check-in',
          }
          setToasts((prev) => [...prev, toast])
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }, 4000)

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Session Started', {
              body: `${booking.guest_name} has started their session.`,
              icon: '/favicon.ico',
            })
          }
        }
      )
      .subscribe()

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slide-up bg-white border border-emerald-200 shadow-lg rounded-xl px-4 py-3 text-sm font-medium text-slate-800 flex items-center gap-3"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <span className="text-lg">{t.type === 'check-in' ? '✅' : '📋'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
