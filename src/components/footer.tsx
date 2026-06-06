import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg viewBox="0 0 32 32" fill="none" className="size-6">
            <rect width="32" height="32" rx="8" fill="#B8860B"/>
            <path d="M16 6C12 6 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
          <span className="font-bold text-slate-700">Paradise World Hurghada</span>
        </div>
        <p className="text-sm text-slate-400">
          Premium spa & wellness in Hurghada &copy; {new Date().getFullYear()}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition">Home</Link>
          <Link href="/about" className="hover:text-slate-600 transition">About</Link>
          <a href="https://wa.me/201019382288" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition">WhatsApp</a>
          <Link href="/auth/login" className="hover:text-slate-600 transition">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
