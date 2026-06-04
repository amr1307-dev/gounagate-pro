import Link from 'next/link'

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
      <section className="relative overflow-hidden px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 hero-gradient">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
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

          {/* 3 Mini UI Mockups with SVG Curves */}
          <div className="relative max-w-5xl mx-auto">
            {/* SVG connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
              <path d="M 280 180 Q 500 80 720 180" fill="none" stroke="#0A6E74" strokeWidth="2" strokeDasharray="8 6" opacity="0.3" />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
              {/* Card 1: Phone mockup */}
              <div className="mockup-card md:translate-y-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">① Guest App</div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mx-auto max-w-[220px]">
                  <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="size-2 rounded-full bg-red-500" />
                      <div className="size-2 rounded-full bg-amber-500" />
                      <div className="size-2 rounded-full bg-green-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">gounagate.app</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 block mb-1">Guest Name</label>
                      <div className="h-7 bg-slate-100 rounded-md px-2 flex items-center text-xs text-slate-400">Omar Hassan</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 block mb-1">Car Plate</label>
                      <div className="h-7 bg-slate-100 rounded-md px-2 flex items-center text-xs text-slate-400">1234 ABC</div>
                    </div>
                    <button className="w-full py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0A6E74] to-[#0FA3B1] shadow-sm">
                      Request Entry Permit
                    </button>
                    <p className="text-[9px] text-slate-400 text-center">Tap to book — takes 10 seconds</p>
                  </div>
                </div>
              </div>

              {/* Card 2: QR Code mockup */}
              <div className="mockup-card md:translate-y-8">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">② Verification</div>
                <div className="relative mx-auto max-w-[220px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0A6E74]/10 to-[#0FA3B1]/10 rounded-2xl blur-xl" />
                  <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-4">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-700">Dynamic QR: Active</span>
                    </div>
                    <div className="bg-white mx-auto mb-3 p-2 rounded-xl border border-slate-100 inline-block">
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <rect x="10" y="10" width="10" height="10" fill="#0A6E74" />
                        <rect x="30" y="10" width="10" height="10" fill="#0A6E74" />
                        <rect x="50" y="10" width="10" height="10" fill="#0A6E74" />
                        <rect x="70" y="10" width="10" height="10" fill="#0A6E74" />
                        <rect x="10" y="30" width="10" height="10" fill="#0A6E74" />
                        <rect x="50" y="30" width="10" height="10" fill="#0A6E74" />
                        <rect x="80" y="30" width="10" height="10" fill="#0A6E74" />
                        <rect x="10" y="50" width="10" height="10" fill="#0A6E74" />
                        <rect x="30" y="50" width="10" height="10" fill="#0A6E74" />
                        <rect x="70" y="50" width="10" height="10" fill="#0A6E74" />
                        <rect x="90" y="50" width="10" height="10" fill="#0A6E74" />
                        <rect x="30" y="70" width="10" height="10" fill="#0A6E74" />
                        <rect x="50" y="70" width="10" height="10" fill="#0A6E74" />
                        <rect x="70" y="70" width="10" height="10" fill="#0A6E74" />
                        <rect x="90" y="70" width="10" height="10" fill="#0A6E74" />
                        <rect x="10" y="90" width="10" height="10" fill="#0A6E74" />
                        <rect x="50" y="90" width="10" height="10" fill="#0A6E74" />
                        <rect x="70" y="90" width="10" height="10" fill="#0A6E74" />
                        <rect x="90" y="90" width="10" height="10" fill="#0A6E74" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 break-all">#H1A2B3C • expires in 24s</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Guard Dashboard mockup */}
              <div className="mockup-card md:translate-y-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">③ Gate Dashboard</div>
                <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden mx-auto max-w-[220px]">
                  <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">🛡️ Gate Panel</span>
                    <span className="text-[10px] text-emerald-400">● Live</span>
                  </div>
                  <div className="p-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center mb-3">
                      <div className="text-2xl mb-1">✅</div>
                      <div className="text-xs font-bold text-emerald-400">ACCESS GRANTED</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-[#0A6E74] to-[#0FA3B1] flex items-center justify-center text-white font-bold text-sm">
                        OH
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Omar Hassan</div>
                        <div className="text-[10px] text-slate-500">Plate: 1234 ABC</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                      <span>Entry: 10:32 AM</span>
                      <span className="text-emerald-400">✓ Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 bg-white/60 border-y border-slate-100">
        <div className="mx-auto max-w-4xl grid grid-cols-3 gap-4">
          <div className="stat-item">
            <div className="stat-number">5,000+</div>
            <div className="stat-label">QR Codes Issued</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Clients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Gates Connected</div>
          </div>
        </div>
      </section>

      {/* Dashboard Screenshots (replaces How It Works) */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4">
            Powerful Dashboard Behind the Scenes
          </h2>
          <p className="text-center text-slate-500 max-w-xl mx-auto mb-12">
            Real-time analytics, booking management, and calendar — all in one place.
          </p>
          <div className="relative glass p-6 sm:p-10 rounded-2xl">
            <div className="absolute -top-3 -right-3 bg-[#0A6E74] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              Live Demo
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-900">📊 Today</span>
                  <span className="text-xs text-slate-400">Updated now</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-600">24</div>
                    <div className="text-[10px] text-slate-500">Bookings</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">18</div>
                    <div className="text-[10px] text-slate-500">Checked In</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">4</div>
                    <div className="text-[10px] text-slate-500">Pending</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">2</div>
                    <div className="text-[10px] text-slate-500">Cancelled</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-900">📅 Recent Activity</span>
                  <span className="text-xs text-slate-400">Today</span>
                </div>
                <div className="space-y-2">
                  {['Omar Hassan ✓', 'Mariam Ali ✓', 'Khaled Youssef', 'Nour El-Din', 'Sara Adel ✓'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-gradient-to-br from-[#0A6E74] to-[#0FA3B1] flex items-center justify-center text-white font-bold text-[8px]">
                          {name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="text-slate-700">{name.replace(' ✓', '')}</span>
                      </div>
                      <span className={name.includes('✓') ? 'text-emerald-500' : 'text-slate-400'}>
                        {name.includes('✓') ? 'Checked In' : 'Confirmed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-900">📈 Occupancy</span>
                  <span className="text-xs text-slate-400">72%</span>
                </div>
                <div className="mb-4">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[72%] bg-gradient-to-r from-[#0A6E74] to-[#0FA3B1] rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-block size-2 rounded-full bg-emerald-500" />
                  Peak hours: 10:00 – 14:00
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/dashboard" className="text-sm text-[#0A6E74] font-semibold hover:underline">
                Explore full dashboard →
              </Link>
            </div>
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
