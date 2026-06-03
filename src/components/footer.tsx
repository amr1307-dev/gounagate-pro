import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg viewBox="0 0 32 32" fill="none" className="size-6">
            <rect width="32" height="32" rx="8" fill="#0A6E74"/>
            <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-slate-700">GounaGate</span>
        </div>
        <p className="text-sm text-slate-400">
          Smart booking for El Gouna businesses &copy; {new Date().getFullYear()}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition">Home</Link>
          <Link href="/auth/login" className="hover:text-slate-600 transition">Login</Link>
          <span>Powered by Cognitum.One</span>
        </div>
      </div>
    </footer>
  )
}
