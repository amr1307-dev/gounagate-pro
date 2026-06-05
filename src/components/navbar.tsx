'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ar' : 'en'
    setLang(newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  const isDashboard = pathname.startsWith('/dashboard')
  const isPublic = !isDashboard

  return (
    <nav className={cn(
      'sticky top-0 z-50 h-16 border-b backdrop-blur-md transition-colors',
      isDashboard
        ? 'bg-slate-900/95 border-slate-800 text-white'
        : 'bg-white/75 border-slate-200/60 text-slate-900'
    )}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={isDashboard ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-lg">
          <svg viewBox="0 0 32 32" fill="none" className="size-7">
            <rect width="32" height="32" rx="8" fill="#B8860B"/>
            <path d="M16 6C12 6 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16' stroke='white' strokeWidth='3' strokeLinecap='round' fill='none"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
          {isDashboard ? 'Paradise World' : 'Paradise World'}
        </Link>

        <div className="flex items-center gap-2">
          {isPublic && (
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0A6E74] text-white hover:bg-[#065256] transition"
            >
              {lang === 'en' ? 'Admin Login' : 'تسجيل الدخول'}
            </Link>
          )}

          {isDashboard && (
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {lang === 'en' ? 'Logout' : 'تسجيل الخروج'}
            </button>
          )}

          <button
            onClick={toggleLang}
            className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle language"
          >
            🌐
          </button>
        </div>
      </div>
    </nav>
  )
}
