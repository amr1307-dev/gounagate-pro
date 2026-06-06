'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      'sticky top-0 z-50 h-16 border-b transition-all duration-300',
      isDashboard
        ? 'bg-slate-900/95 border-slate-800 text-white'
        : scrolled
          ? 'navbar-scrolled text-slate-900'
          : 'bg-transparent border-transparent text-slate-900'
    )}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={isDashboard ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-lg">
          <svg viewBox="0 0 32 32" fill="none" className="size-7 shrink-0">
            <rect width="32" height="32" rx="8" fill="#B8860B"/>
            <path d="M16 6C12 6 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
          <span className={cn('hidden sm:inline', !scrolled && !isDashboard && 'opacity-90')}>
            Paradise World
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {isPublic && (
            <>
              <Link
                href="/scan/paradise-world"
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-semibold transition hidden sm:inline-block',
                  scrolled
                    ? 'text-teal-700 hover:bg-teal-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {lang === 'en' ? 'Scan QR' : 'مسح QR'}
              </Link>
              <Link
                href="/auth/login"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  scrolled
                    ? 'bg-[#0A6E74] text-white hover:bg-[#065256]'
                    : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                )}
              >
                {lang === 'en' ? 'Admin' : 'المشرف'}
              </Link>
            </>
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
            className={cn(
              'size-10 flex items-center justify-center rounded-lg transition',
              isDashboard
                ? 'hover:bg-slate-800'
                : scrolled
                  ? 'hover:bg-slate-100'
                  : 'hover:bg-white/10'
            )}
            aria-label="Toggle language"
          >
            <span className={cn('text-sm', isDashboard || scrolled ? '' : 'brightness-0 invert')}>🌐</span>
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'sm:hidden size-10 flex items-center justify-center rounded-lg transition',
              isDashboard
                ? 'hover:bg-slate-800'
                : scrolled
                  ? 'hover:bg-slate-100'
                  : 'hover:bg-white/10'
            )}
            aria-label="Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={cn(
                'block h-0.5 w-full rounded transition-all duration-200',
                isDashboard ? 'bg-white' : scrolled ? 'bg-slate-800' : 'bg-white'
              )} />
              <span className={cn(
                'block h-0.5 w-3/4 rounded transition-all duration-200',
                isDashboard ? 'bg-white' : scrolled ? 'bg-slate-800' : 'bg-white'
              )} />
              <span className={cn(
                'block h-0.5 w-full rounded transition-all duration-200',
                isDashboard ? 'bg-white' : scrolled ? 'bg-slate-800' : 'bg-white'
              )} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'sm:hidden overflow-hidden transition-all duration-300',
        menuOpen ? 'max-h-60' : 'max-h-0'
      )}>
        <div className={cn(
          'px-4 py-3 space-y-2 border-t',
          isDashboard ? 'bg-slate-900 border-slate-800' : scrolled ? 'bg-white border-slate-200' : 'bg-white/95 backdrop-blur-md border-slate-200'
        )}>
          <Link
            href="/scan/paradise-world"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setMenuOpen(false)}
          >
            {lang === 'en' ? 'Scan QR' : 'مسح QR'}
          </Link>
          <a
            href="https://wa.me/201019382288"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            onClick={() => setMenuOpen(false)}
          >
            {lang === 'en' ? 'WhatsApp' : 'واتساب'}
          </a>
        </div>
      </div>
    </nav>
  )
}
