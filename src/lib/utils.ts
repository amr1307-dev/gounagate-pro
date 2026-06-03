import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBookingRef(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `GG-${ts}-${rand}`
}

export function generateHash(data: Record<string, unknown>): string {
  const raw = `${data.id}|${data.name}|${data.phone}|${data.date}|${data.time}|${Date.now()}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `H${Math.abs(hash).toString(16).toUpperCase().padStart(7, '0')}`
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':')
  return `${h}:${m}`
}

export function getEgyptPhone(phone: string): string {
  const cleaned = phone.replace(/[\s+]/g, '')
  if (cleaned.startsWith('2')) return cleaned
  if (cleaned.startsWith('0')) return '2' + cleaned.substring(1)
  return '2' + cleaned
}
