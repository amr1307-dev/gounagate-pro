'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Lang = 'en' | 'ar'

const t = (lang: Lang, en: string, ar: string) => lang === 'ar' ? ar : en

const links = (lang: Lang) => [
  { href: '/dashboard', icon: '📊', en: 'Dashboard', ar: 'لوحة التحكم' },
  { href: '/dashboard/packages', icon: '📦', en: 'Packages', ar: 'الباقات' },
  { href: '/dashboard/analytics', icon: '📈', en: 'Analytics', ar: 'الإحصائيات' },
  { href: '/dashboard/bookings', icon: '📋', en: 'Bookings', ar: 'الحجوزات' },
  { href: '/dashboard/calendar', icon: '📅', en: 'Calendar', ar: 'التقويم' },
  { href: '/dashboard/settings', icon: '⚙️', en: 'Settings', ar: 'الإعدادات' },
]

export function DashboardSidebar({ initialLang }: { initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang || 'en')
  const pathname = usePathname()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dashboard_lang') as Lang | null
      if (stored === 'ar' || stored === 'en') setLang(stored)
    } catch {}
  }, [])

  function toggleLang() {
    const next = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    try { localStorage.setItem('dashboard_lang', next) } catch {}
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  const navLinks = links(lang)

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-300 p-4 fixed h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 mt-2" style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
          <svg viewBox="0 0 32 32" fill="none" className="size-7 shrink-0">
            <rect width="32" height="32" rx="8" fill="#B8860B"/>
            <path d="M16 6C12 6 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
          <span className="font-bold text-white text-lg">Paradise World</span>
        </div>

        <nav className="space-y-1 flex-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
                  ? 'bg-slate-700 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
              style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link[lang]}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 pt-4 mt-4 space-y-1">
          <Link
            href="/scan/demo"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition hover:bg-slate-800 hover:text-white`}
            style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}
          >
            <span className="text-base">📷</span>
            <span>{t(lang, 'Scan QR', 'مسح QR')}</span>
          </Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition w-full"
            style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}
          >
            <span className="text-base">🌐</span>
            <span>{t(lang, 'English', 'العربية')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around py-2 px-2" style={{ direction: 'ltr' }}>
        {navLinks.slice(0, 5).map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
              pathname === link.href || pathname.startsWith(link.href) ? 'text-teal-600' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link[lang]}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
