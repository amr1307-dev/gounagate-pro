'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type LangContextType = {
  lang: 'en' | 'ar'
  setLang: (lang: 'en' | 'ar') => void
  t: (en: string, ar: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (en: string) => en,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const stored = (() => { try { return localStorage.getItem('site_lang') } catch { return null } })()
    if (stored === 'ar' || stored === 'en') {
      setLangState(stored)
      document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = stored
    } else {
      const userLang = navigator.language || navigator.languages?.[0] || 'en'
      if (userLang.startsWith('ar')) {
        setLangState('ar')
        document.documentElement.dir = 'rtl'
        document.documentElement.lang = 'ar'
      }
    }
  }, [])

  const setLang = (newLang: 'en' | 'ar') => {
    setLangState(newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
    try { localStorage.setItem('site_lang', newLang) } catch {}
  }

  const t = (en: string, ar: string) => lang === 'ar' ? ar : en

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
