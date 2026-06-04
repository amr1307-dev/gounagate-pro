import Link from 'next/link'

const stats = [
  { number: '5,000+', key: 'statsQR' },
  { number: '500+', key: 'statsClients' },
  { number: '15+', key: 'statsGates' },
]

const steps = [
  { icon: '📱', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: '⚙️', titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: '✅', titleKey: 'step3Title', descKey: 'step3Desc' },
]

const features = [
  { bg: 'bg-emerald-50', icon: '🔄', titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { bg: 'bg-blue-50', icon: '🔗', titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { bg: 'bg-amber-50', icon: '🔔', titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { bg: 'bg-purple-50', icon: '📊', titleKey: 'feature4Title', descKey: 'feature4Desc' },
  { bg: 'bg-teal-50', icon: '🌐', titleKey: 'feature5Title', descKey: 'feature5Desc' },
  { bg: 'bg-slate-50', icon: '📡', titleKey: 'feature6Title', descKey: 'feature6Desc' },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 hero-gradient">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="trust-badge mb-4 inline-flex">🏆 #1 QR Entry System for El Gouna</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              Save 15+ Minutes of{' '}
              <span className="bg-gradient-to-r from-[#0A6E74] to-[#0FA3B1] bg-clip-text text-transparent">
                Waiting
              </span>{' '}
              at Every Gate
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
              Smart booking & QR entry system for El Gouna venues. No calls, no queues — just scan and enter.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/book/demo" className="btn-primary text-lg px-10 py-4 text-base">
                🚀 Try Free Demo
              </Link>
              <Link href="/auth/signup" className="btn-secondary text-lg px-10 py-4 text-base">
                Get a Demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card required · GDPR Compliant · 99.9% Uptime</p>
          </div>

          {/* Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-center max-w-4xl mx-auto">
            <div className="flow-step">
              <div className="flow-step-icon">📱</div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Guest Books</h3>
              <p className="text-sm text-slate-500">Fills the form from their phone in seconds. No app download needed.</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-step-icon">⚙️</div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">System Generates QR</h3>
              <p className="text-sm text-slate-500">Encrypted smart QR code with unique verification hash issued instantly.</p>
            </div>
            <div className="flow-arrow md:hidden">→</div>
            <div className="flow-step md:col-start-3">
              <div className="flow-step-icon">✅</div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Guard Scans & Approves</h3>
              <p className="text-sm text-slate-500">Scan at the gate → green light → instant entry with status update.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 bg-white/60 border-y border-slate-100">
        <div className="mx-auto max-w-4xl grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.key} className="stat-item">
              <div className="stat-number">{s.number}</div>
              <div className="stat-label">{s.key === 'statsQR' ? 'QR Codes Issued' : s.key === 'statsClients' ? 'Active Clients' : 'Gates Connected'}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-slate-500 max-w-xl mx-auto mb-12">
            Three simple steps from booking to entry. No training required.
          </p>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="glass p-8 text-center relative">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-sm font-bold text-[#0A6E74] mb-2">STEP 0{i + 1}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.titleKey === 'step1Title' ? 'Guest Books' : step.titleKey === 'step2Title' ? 'System Generates QR' : 'Guard Scans & Approves'}</h3>
                <p className="text-slate-500">{step.descKey === 'step1Desc' ? 'Fills the form from their phone in seconds. No app download needed.' : step.descKey === 'step2Desc' ? 'Encrypted smart QR code with unique verification hash issued instantly.' : 'Scan at the gate → green light → instant entry with status update.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4">
            Why GounaGate?
          </h2>
          <p className="text-center text-slate-500 max-w-xl mx-auto mb-12">
            Built for El Gouna venues. Designed for security, speed, and simplicity.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.titleKey} className="feature-card">
                <div className={`feature-icon ${f.bg}`}>{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1 text-lg">{f.titleKey === 'feature1Title' ? 'Dynamic QR Security' : f.titleKey === 'feature2Title' ? 'Guest Self-Registration' : f.titleKey === 'feature3Title' ? 'Real-Time Alerts' : f.titleKey === 'feature4Title' ? 'Smart Dashboard' : f.titleKey === 'feature5Title' ? 'Bilingual (EN/AR)' : 'Works Offline'}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.descKey === 'feature1Desc' ? 'QR codes that refresh every 30 seconds. Screenshot protection built-in.' : f.descKey === 'feature2Desc' ? 'Send a WhatsApp link — guests register themselves. Zero data entry for you.' : f.descKey === 'feature3Desc' ? 'Get notified instantly when your guest passes the gate via WhatsApp or browser.' : f.descKey === 'feature4Desc' ? 'Real-time analytics, peak hours, occupancy rates, and booking trends.' : f.descKey === 'feature5Desc' ? 'Full Arabic and English support with automatic RTL layout detection.' : 'Guard app queues scans offline and syncs automatically when connection returns.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center relative overflow-hidden hero-gradient">
        <div className="mx-auto max-w-2xl relative">
          <div className="text-5xl mb-6">🎯</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Gate Experience?
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Start with a free demo. No commitment, no credit card.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book/demo" className="btn-primary text-lg px-12 py-4 text-base">
              🚀 Try Free Demo
            </Link>
            <Link href="/auth/signup" className="btn-secondary text-lg px-12 py-4 text-base">
              Create Account
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">No credit card required · GDPR Compliant · 99.9% Uptime</p>
        </div>
      </section>
    </div>
  )
}
