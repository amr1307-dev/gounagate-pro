'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Package = {
  id: string
  category_id: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  price: number
  duration_minutes: number
  image_url: string | null
}

type Category = {
  id: string
  name_en: string
  name_ar: string
  slug: string
  icon: string
  packages?: Package[]
}

type Testimonial = {
  id: string
  client_name: string
  rating: number
  comment_en: string
  comment_ar: string
  client_country: string
}

const features = [
  { bg: 'bg-emerald-50', icon: '🔄', title: 'Instant QR Booking', desc: 'Book any service and get an instant QR code. No app download needed.' },
  { bg: 'bg-blue-50', icon: '💬', title: 'WhatsApp Confirmation', desc: 'Receive booking confirmation and reminders via WhatsApp automatically.' },
  { bg: 'bg-amber-50', icon: '🔔', title: 'Real-Time Alerts', desc: 'Get notified when guests arrive and check in for their appointments.' },
  { bg: 'bg-purple-50', icon: '📊', title: 'Admin Dashboard', desc: 'Manage bookings, packages, and view analytics all in one place.' },
]

export default function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [allPackages, setAllPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
    ]).then(([cats, tests, pkgs]) => {
      setCategories(cats || [])
      setTestimonials(tests || [])
      setAllPackages(pkgs || [])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'all'
    ? allPackages
    : allPackages.filter(p => p.category_id === activeCategory)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-28 sm:pt-28 sm:pb-36 hero-gradient-paradise">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="trust-badge mb-4 inline-flex">🌴 Premium Spa & Wellness in Hurghada</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              Your Moment of{' '}
              <span className="text-gradient-gold">
                Calm
              </span>{' '}
              in Hurghada
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
              Book your premium spa experience — massage, salt cave, sauna, beauty treatments. 
              Instant QR confirmation, no waiting.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#services" className="btn-gold text-lg px-10 py-4 text-base">
                🛎️ Book Your Session
              </a>
              <a href="#how-it-works" className="btn-secondary text-lg px-10 py-4 text-base">
                How It Works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">Premium service · Instant QR confirmation · WhatsApp notification</p>
          </div>

          {/* Mini preview cards */}
          <div className="relative max-w-5xl mx-auto">
            <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 relative z-10 overflow-x-auto snap-x snap-mandatory md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
              <div className="mockup-card snap-center shrink-0 min-w-[85vw] md:min-w-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">① Choose Service</div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mx-auto max-w-[220px]">
                  <div className="p-4 space-y-3">
                    <div className="text-center text-3xl">💆</div>
                    <div className="text-center font-bold text-sm text-slate-800">Swedish Massage</div>
                    <div className="text-center">
                      <span className="text-lg font-bold text-[#D4A843]">600 EGP</span>
                      <span className="text-xs text-slate-400 ml-2">60 min</span>
                    </div>
                    <button className="w-full py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0A6E74] to-[#0FA3B1] shadow-sm">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="mockup-card md:translate-y-8 snap-center shrink-0 min-w-[85vw] md:min-w-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">② Get QR</div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mx-auto max-w-[220px]">
                  <div className="p-4 text-center space-y-3">
                    <div className="flex justify-center">
                      <svg viewBox="0 0 100 100" width="80" height="80">
                        <rect x="10" y="10" width="30" height="30" fill="#0A6E74" rx="4" />
                        <rect x="60" y="10" width="30" height="30" fill="#0A6E74" rx="4" />
                        <rect x="10" y="60" width="14" height="14" fill="#0A6E74" rx="2" />
                        <rect x="38" y="60" width="14" height="14" fill="#0A6E74" rx="2" />
                        <rect x="60" y="60" width="14" height="30" fill="#0A6E74" rx="2" />
                        <rect x="78" y="60" width="12" height="14" fill="#0A6E74" rx="2" />
                        <rect x="38" y="78" width="14" height="12" fill="#0A6E74" rx="2" />
                        <rect x="38" y="38" width="14" height="14" fill="#D4A843" rx="2" />
                        <rect x="60" y="38" width="14" height="14" fill="#D4A843" rx="2" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400">Confirmed · Ref: PW-ABC123</p>
                    <span className="inline-block text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      QR refreshes in 28s
                    </span>
                  </div>
                </div>
              </div>

              <div className="mockup-card snap-center shrink-0 min-w-[85vw] md:min-w-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">③ Show & Enjoy</div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mx-auto max-w-[220px]">
                  <div className="p-4 text-center space-y-3">
                    <div className="text-3xl">✅</div>
                    <div className="font-bold text-sm text-emerald-700">Session Verified</div>
                    <div className="text-xs text-slate-500">Show at reception to start your spa journey</div>
                    <div className="flex justify-center gap-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-[#D4A843] text-sm">★</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16" id="branches">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Locations</h2>
          <p className="text-slate-500 mt-2">Visit us at either of our branches</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { name: 'Corniche Branch', nameAr: 'فرع الكورنيش', addr: 'Corniche Road, Hurghada, Egypt', icon: '🌊' },
            { name: 'Florenza Khamsin', nameAr: 'فرع فلورنزا خماسين', addr: 'Florenza Khamsin Resort, Hurghada, Egypt', icon: '🌴' },
          ].map((b, i) => (
            <div key={i} className="glass p-6 flex items-start gap-4">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <h3 className="font-bold text-slate-900">{b.name}</h3>
                <p className="text-slate-400 text-sm">{b.addr}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16" id="services">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Premium Services</h2>
          <p className="text-slate-500 mt-2">Choose from our selection of world-class spa treatments</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border',
              activeCategory === 'all'
                ? 'bg-[#0A6E74] text-white border-[#0A6E74]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#0A6E74]/30'
            )}
          >
            All Services
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border',
                activeCategory === cat.id
                  ? 'bg-[#0A6E74] text-white border-[#0A6E74]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#0A6E74]/30'
              )}
            >
              {cat.icon} {cat.name_en}
            </button>
          ))}
        </div>

        {/* Packages grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(pkg => (
              <div key={pkg.id} className="feature-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{pkg.name_en}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{pkg.duration_minutes} minutes</p>
                  </div>
                  <div className="price-tag">{pkg.price.toLocaleString('en-EG')} EGP</div>
                </div>
                <p className="text-sm text-slate-500 mb-4">{pkg.description_en}</p>
                <Link
                  href={`/book/${pkg.id}`}
                  className="btn-primary w-full justify-center text-sm"
                >
                  🛎️ Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-500 mt-2">Three simple steps to your spa experience</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Choose Your Service', desc: 'Browse our packages and pick what suits you best.', icon: '💆' },
            { step: '02', title: 'Book & Get QR', desc: 'Fill in your details and receive an instant QR confirmation.', icon: '📱' },
            { step: '03', title: 'Show & Enjoy', desc: 'Show your QR at reception for a seamless check-in.', icon: '✨' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-4">{s.icon}</div>
              <div className="text-xs font-bold text-[#D4A843] mb-1">{s.step}</div>
              <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
              <p className="text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-slate-50/50 py-16" id="testimonials">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">What Our Guests Say</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="glass p-6">
                  <div className="flex gap-2 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-[#D4A843]">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 mb-4 italic">&ldquo;{t.comment_en}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-[#0A6E74] flex items-center justify-center text-white text-sm font-bold">
                      {t.client_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.client_name}</p>
                      {t.client_country && <p className="text-xs text-slate-400">{t.client_country}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why Paradise World?</h2>
          <p className="text-slate-500 mt-2">Everything you need for a seamless spa experience</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className={`feature-icon ${f.bg}`}>{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <div className="glass p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Ready for Your Spa Experience?</h2>
          <p className="text-slate-500 mb-6">Book your session now and let us take care of the rest.</p>
          <a href="#services" className="btn-gold text-lg px-12 py-4">
            🛎️ Book Your Session
          </a>
        </div>
      </section>
    </div>
  )
}
