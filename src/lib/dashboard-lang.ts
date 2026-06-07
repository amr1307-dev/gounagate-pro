import { useState, useEffect } from 'react'

export type Lang = 'en' | 'ar'

export function useDashboardLang() {
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dashboard_lang') as Lang | null
      if (stored === 'ar' || stored === 'en') setLang(stored)
    } catch {}
  }, [])
  return lang
}

export function t(lang: Lang, en: string, ar: string) {
  return lang === 'ar' ? ar : en
}
