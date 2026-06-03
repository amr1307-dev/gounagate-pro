import Link from 'next/link'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-teal-50/50 to-transparent" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            Smart Booking &{' '}
            <span className="bg-gradient-to-r from-[#0A6E74] to-[#0FA3B1] bg-clip-text text-transparent">
              QR Entry
            </span>{' '}
            for El Gouna
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            Reserve your spot at El Gouna venues instantly. Get a QR code for fast gate entry.
            No apps, no waiting.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book/demo"
              className="btn-primary text-lg px-8"
            >
              🚀 Try Demo Booking
            </Link>
            <Link
              href="/auth/signup"
              className="btn-secondary text-lg px-8"
            >
              Create Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: '📋', title: 'Create Booking', desc: 'Guest fills the form online in seconds. Name, date, time, guests — done.' },
              { step: '02', icon: '📱', title: 'Get QR Code', desc: 'Instant QR code generated with all booking details and a secure verification hash.' },
              { step: '03', icon: '✅', title: 'Scan & Enter', desc: 'Gatekeeper scans the QR at the entrance. Valid booking = instant access.' },
            ].map((item) => (
              <div key={item.step} className="glass p-8 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-sm font-bold text-[#0A6E74] mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why GounaGate?
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '⚡', title: 'Instant Booking', desc: 'No app download. Works on any device with a browser.' },
              { icon: '🔒', title: 'Secure QR Codes', desc: 'Each booking has a unique verification hash. Tamper-proof.' },
              { icon: '📊', title: 'Real-time Dashboard', desc: 'See all bookings, check-ins, and stats in one place.' },
              { icon: '📱', title: 'WhatsApp Ready', desc: 'Auto-send confirmations to guests and notifications to owners.' },
              { icon: '🌐', title: 'Bilingual', desc: 'Full English and Arabic support with RTL layout.' },
              { icon: '🏗️', title: 'Multi-Venue', desc: 'Manage multiple venues under one account.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-xl border border-slate-100 bg-white">
                <span className="text-3xl shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Try the demo or create your business account in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book/demo" className="btn-primary text-lg px-10">
              🚀 Try Live Demo
            </Link>
            <Link href="/auth/signup" className="btn-secondary text-lg px-10">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
