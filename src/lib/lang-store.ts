let currentLang: 'en' | 'ar' = 'en'
const listeners = new Set<(lang: 'en' | 'ar') => void>()

if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('site_lang')
    if (stored === 'ar' || stored === 'en') currentLang = stored
  } catch {}
}

export function getLang() { return currentLang }

export function setLang(newLang: 'en' | 'ar') {
  currentLang = newLang
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = newLang
  try { localStorage.setItem('site_lang', newLang) } catch {}
  listeners.forEach(fn => fn(newLang))
}

export function subscribe(fn: (lang: 'en' | 'ar') => void) {
  listeners.add(fn)
  fn(currentLang)
  return () => { listeners.delete(fn) }
}
