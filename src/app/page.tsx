'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ServiceDrawer } from '@/components/service-drawer'

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

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight * 100, 100) : 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div className="h-full bg-gradient-to-r from-[#0A6E74] via-[#D4A843] to-[#0A6E74] transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
    </div>
  )
}

function FadeInSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const BASE_URL = 'https://andnjljpdfagluqjfroo.supabase.co/storage/v1/object/public/package-images/packages/'
const HERO_SLIDES = [
  BASE_URL + 'slide-4.jpg',
  BASE_URL + 'slide-5.jpg',
  BASE_URL + 'slide-6.jpg',
  BASE_URL + 'slide-7.jpg',
  BASE_URL + 'slide-10.jpg',
  BASE_URL + 'slide-15.jpg',
]
const HERO_PHOTOS = [
  { src: BASE_URL + 'gallery-spa-5.jpg', size: 160, top: 7, left: 4, delay: 0 },
  { src: BASE_URL + 'gallery-salt-cave-1.jpg', size: 130, top: 3, left: 78, delay: -2 },
  { src: BASE_URL + 'gallery-spa-4.jpg', size: 140, top: 56, left: 3, delay: -4 },
  { src: BASE_URL + 'beauty-center.jpg', size: 120, top: 54, left: 82, delay: -1 },
]

export default function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [allPackages, setAllPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<Package | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [currentSlide, setCurrentSlide] = useState(0)

  const servicesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const userLang = navigator.language || navigator.languages?.[0] || 'en'
    if (userLang.startsWith('ar')) {
      setLang('ar')
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    }
  }, [])

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(c => (c + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const openDrawer = useCallback((pkg: Package) => {
    setSelectedService(pkg)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedService(null)
  }, [])

  const filtered = activeCategory === 'all'
    ? allPackages
    : allPackages.filter(p => p.category_id === activeCategory)

  const t = (en: string, ar: string) => lang === 'ar' ? ar : en

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const FALLBACK_SERVICES: Package[] = [
    { id: '1', category_id: '', name_en: 'Swedish Massage', name_ar: 'مساج سويدي', price: 800, description_en: '', description_ar: '', duration_minutes: 60, image_url: null },
    { id: '2', category_id: '', name_en: 'Salt Cave Session', name_ar: 'جلسة كهف الملح', price: 500, description_en: '', description_ar: '', duration_minutes: 45, image_url: null },
    { id: '3', category_id: '', name_en: 'Hot Stone Massage', name_ar: 'مساج الأحجار الساخنة', price: 1200, description_en: '', description_ar: '', duration_minutes: 90, image_url: null },
  ]
  const featuredServices = allPackages.length > 0 ? allPackages.slice(0, 3) : FALLBACK_SERVICES

  return (
    <div className="overflow-x-hidden">
      <ScrollProgress />
      {/* ==================== HERO ==================== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="hero-slider-bg">
          {HERO_SLIDES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={`hero-slide-img ${currentSlide === i ? 'active' : ''}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/30 z-[1]" />
        </div>

        {/* Floating Photo Gallery */}
        <div className="floating-photo-gallery">
          {HERO_PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="hero-photo-card"
              style={{
                width: `${photo.size}px`,
                height: `${photo.size * 0.75}px`,
                top: `${photo.top}%`,
                left: `${photo.left}%`,
                animationDelay: `${photo.delay}s`,
                zIndex: 0,
              }}
            >
              <img src={photo.src} alt="" />
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-24 pb-20 sm:pt-28 sm:pb-28 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3 text-center lg:text-left animate-in">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                <span className="trust-badge">🏆 {t('Google 4.7★', 'جوجل 4.7★')}</span>
                <span className="trust-badge">⭐ {t('TripAdvisor 4.8★', 'تريب أدفايزر 4.8★')}</span>
                <span className="trust-badge">❤️ {t('+700 Happy Guests', '+700 عميل سعيد')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                {t('Escape to', 'اهرب إلى')}{' '}
                <span className="text-gradient-gold">
                  {t('Paradise', 'الجنة')}
                </span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t(
                  'Where every tension melts away. Premium spa treatments, salt cave therapy, and massages — book in 30 seconds with instant QR confirmation.',
                  'حيث تذوب كل همومك. علاجات سبا فاخرة، علاج بملح البحر، مساج — احجز في 30 ثانية مع تأكيد فوري بالـ QR.'
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
                <button
                  onClick={scrollToServices}
                  className="btn-hero-primary-gold btn-shimmer text-base sm:text-lg px-10 py-4"
                >
                  <span>✨</span> {t('Book Your Session', 'احجز جلستك')} <span>↓</span>
                </button>
                <a
                  href="https://wa.me/201019382288"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-secondary-glass text-base px-10 py-4"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {t('WhatsApp', 'واتساب')}
                </a>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 mt-6">
                <div className="flex -space-x-2">
                  {[BASE_URL + 'massage-home.png', BASE_URL + 'sauna-home.png', BASE_URL + 'beauty-center.jpg', BASE_URL + 'gallery-spa-4.jpg'].map((src, i) => (
                    <div
                      key={i}
                      className="size-10 rounded-full border-2 border-white shadow-md overflow-hidden"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800">{t('+2k Bookings', '+2 ألف حجز')}</div>
                  <div className="text-xs text-slate-400">{t('Trusted by guests worldwide', 'موثوق من ضيوف حول العالم')}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 hidden lg:block animate-in">
              <div className="card-elevated p-6 rounded-2xl quick-book-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">{t('Book in 30 Seconds', 'احجز في 30 ثانية')}</h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-medium">✓ {t('Instant', 'فوري')}</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="input-card">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('Date', 'التاريخ')}</span>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="input-card">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('Time', 'الوقت')}</span>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">{t('Choose time →', 'اختر الوقت ←')}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1.5 block">{t('Popular', 'الأكثر طلباً')}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {featuredServices.map(s => (
                        <button
                          key={s.id}
                          onClick={() => openDrawer(s)}
                          className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition font-medium"
                        >
                          {s.name_en} — {s.price.toLocaleString('en-EG')} EGP
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={scrollToServices}
                    className="w-full mt-3 bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-white font-bold py-3.5 rounded-xl text-sm hover:shadow-lg hover:shadow-amber-900/25 transition-all active:scale-[0.97] btn-shimmer"
                  >
                    ✨ {t('Book Now', 'احجز الآن')}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    {t('Free cancellation · Instant QR code', 'إلغاء مجاني · QR فوري')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      <section ref={servicesRef} className="mx-auto max-w-6xl px-4 sm:px-6 py-20" id="services">
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full">
            ✦ {t('Premium Treatments', 'علاجات فاخرة')}
          </span>
        </div>
        <FadeInSection>
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-alt">
              {t('Your Wellness Journey Starts Here', 'رحلة العافية تبدأ من هنا')}
            </h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">
              {t('From traditional massages to modern salt therapy — find your perfect escape.', 'من المساج التقليدي إلى العلاج بالملح الحديث — اعثر على ملاذك المثالي.')}
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={100}>
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8 justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'pill-filter',
                activeCategory === 'all' && 'pill-filter-active'
              )}
            >
              {t('All', 'الكل')}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'pill-filter',
                  activeCategory === cat.id && 'pill-filter-active'
                )}
              >
                {cat.icon} {cat.name_en}
              </button>
            ))}
          </div>
        </FadeInSection>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="service-card animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                    <div className="h-4 bg-slate-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pkg, i) => (
              <FadeInSection key={pkg.id} delay={i * 80}>
                <div className="service-card">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={pkg.image_url || `/api/placeholder?name=${encodeURIComponent(pkg.name_en)}`}
                      alt={pkg.name_en}
                      className="w-full h-full object-cover service-card-img"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      {pkg.duration_minutes} min
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900">{pkg.name_en}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{pkg.description_en}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="price-tag text-base">{pkg.price.toLocaleString('en-EG')} EGP</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openDrawer(pkg)}
                          className="btn-details"
                        >
                          {t('Details', 'التفاصيل')}
                        </button>
                        <Link
                          href={`/book/${pkg.id}`}
                          className="btn-book-gold"
                        >
                          {t('Book', 'احجز')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        )}
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full">
              ✦ {t('Simple Process', 'عملية بسيطة')}
            </span>
          </div>
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center font-serif-alt mb-12">
              {t('Your Spa Journey in 3 Steps', 'رحلة السبا في 3 خطوات')}
            </h2>
          </FadeInSection>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-12 left-[17%] right-[17%] h-0.5 bg-gradient-to-r from-teal-200 via-amber-200 to-teal-200" />
            {[
              { num: '01', title: t('Choose & Book', 'اختر واحجز'), desc: t('Browse services, pick your treatment, choose date/time — 30 seconds.', 'تصفح الخدمات، اختر علاجك، حدد التاريخ والوقت — 30 ثانية.'), icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              )},
              { num: '02', title: t('Get QR Code', 'استلم QR'), desc: t('Instant QR confirmation via WhatsApp. 30-second rolling hash for security.', 'تأكيد فوري عبر واتساب. رمز QR متغير كل 30 ثانية للأمان.'), icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="4" height="4"/><rect x="8" y="14" width="3" height="3"/><rect x="3" y="19" width="3" height="3"/></svg>
              )},
              { num: '03', title: t('Show & Relax', 'استعرض واسترخ'), desc: t('Show QR at reception, get checked in instantly — zero waiting, pure bliss.', 'أظهر QR في الاستقبال، سجل دخولك فوراً — لا انتظار، فقط استرخاء.'), icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              )},
            ].map((step, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="flex flex-col items-center text-center step-card">
                  <div className="step-number relative z-10">
                    <span className="text-white font-bold text-lg">{step.num}</span>
                  </div>
                  <div className="step-icon">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-3">{step.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-[260px]">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      {testimonials.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full">
                ★ {t('What Guests Say', 'ماذا يقول الضيوف')}
              </span>
            </div>
            <FadeInSection>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center font-serif-alt mb-3">
                {t('Trusted by +700 Happy Guests', 'موثوق من +700 عميل سعيد')}
              </h2>
            </FadeInSection>

            <FadeInSection delay={100}>
              <div className="flex justify-center gap-4 mb-10">
                <div className="rating-badge">
                  <span className="text-lg">⭐</span>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{t('4.7 ★ Google', '4.7 ★ جوجل')}</div>
                    <div className="text-[11px] text-slate-400">{t('Reviews', 'تقييمات')}</div>
                  </div>
                </div>
                <div className="rating-badge">
                  <span className="text-lg">🏆</span>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{t('4.8 ★ TripAdvisor', '4.8 ★ تريب أدفايزر')}</div>
                    <div className="text-[11px] text-slate-400">{t('Certificate of Excellence', 'شهادة التميز')}</div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <div className="testimonials-marquee">
              <div className="testimonials-track">
                {[...testimonials, ...testimonials].map((tItem, i) => (
                  <div key={`${tItem.id}-${i}`} className="testimonial-card min-w-[320px] max-w-[360px] shrink-0">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: tItem.rating }).map((_, ri) => (
                        <span key={ri} className="text-amber-500 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed italic">
                      &ldquo;{tItem.comment_en}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="size-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {tItem.client_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{tItem.client_name}</p>
                        {tItem.client_country && (
                          <p className="text-xs text-slate-400">{tItem.client_country}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FadeInSection delay={200}>
              <div className="text-center mt-8">
                <a
                  href="https://www.tripadvisor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  📝 {t('Read All Reviews on TripAdvisor', 'اقرأ كل التقييمات على تريب أدفايزر')} →
                </a>
              </div>
            </FadeInSection>
          </div>
        </section>
      )}

      {/* ==================== WHY PARADISE WORLD ==================== */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full">
              ✦ {t('Why Choose Us', 'لماذا تختارنا')}
            </span>
          </div>
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center font-serif-alt mb-12">
              {t('Designed for Your Wellbeing', 'مصمم لراحتك')}
            </h2>
          </FadeInSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2"/><path d="M4 7h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"/><path d="M9 11h6"/></svg>
              ), title: t('Instant QR Booking', 'حجز QR فوري'), desc: t('No app download needed. Book in 30 seconds, get a rotating QR code via WhatsApp.', 'لا حاجة لتحميل تطبيق. احجز في 30 ثانية، واستلم QR متغير عبر واتساب.'), bg: 'bg-teal-50' },
              { icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              ), title: t('WhatsApp Confirmation', 'تأكيد واتساب'), desc: t('Automatic booking confirmation & reminders via WhatsApp. No SMS fees.', 'تأكيد وتذكير تلقائي عبر واتساب. بدون رسوم رسائل.'), bg: 'bg-blue-50' },
              { icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ), title: t('Smart Check-In', 'تسجيل وصول ذكي'), desc: t('Staff scans your QR for instant check-in. No paperwork, no waiting.', 'يقوم الفريق بمسح QR لتسجيل الوصول الفوري. لا أوراق ولا انتظار.'), bg: 'bg-amber-50' },
              { icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9D174D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ), title: t('Premium Hygiene', 'نظافة فاخرة'), desc: t('Fresh linens, sanitized equipment, private sessions. Your safety is #1.', 'أغطية نظيفة، معدات معقمة، جلسات خاصة. سلامتك أولاً.'), bg: 'bg-rose-50' },
            ].map((feat, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="feature-card-v2">
                  <div className={`feature-icon-v2 ${feat.bg}`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BRANCHES ==================== */}
      <section className="py-20" id="branches">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full">
              📍 {t('Locations', 'الفروع')}
            </span>
          </div>
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center font-serif-alt mb-4">
              {t('Find Paradise World in Hurghada', 'اعثر على بارادايس وورلد في الغردقة')}
            </h2>
            <p className="text-slate-500 text-center max-w-xl mx-auto mb-10">
              {t('Two convenient locations — visit us at the Corniche or inside Florenza Khamsin Resort.', 'فرعين في موقعين متميزين — زورنا على الكورنيش أو داخل فلورنزا خماسين ريزورت.')}
            </p>
          </FadeInSection>
          <div className="grid lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3">
              <FadeInSection>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-full min-h-[350px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3547.28680843997!2d33.84572582554609!3d27.241532845884254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145287f9bf96c5f5%3A0x77015ad87068b78f!2sParadise%20spa%20hurghada!5e0!3m2!1sar!2seg!4v1780789684582!5m2!1sar!2seg"
                    width="100%"
                    height="100%"
                    className="min-h-[350px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Paradise Spa Hurghada Location"
                  />
                </div>
              </FadeInSection>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              {[
                { name: t('Corniche Branch', 'فرع الكورنيش'), addr: t('Corniche Road, Hurghada, Egypt', 'شارع الكورنيش، الغردقة، مصر'), gradient: 'from-teal-600 to-teal-800', emoji: '🌊' },
                { name: t('Florenza Khamsin', 'فرع فلورنزا خماسين'), addr: t('Florenza Khamsin Resort, Hurghada, Egypt', 'فلورنزا خماسين ريزورت، الغردقة، مصر'), gradient: 'from-amber-600 to-amber-800', emoji: '🌴' },
              ].map((branch, i) => (
                <FadeInSection key={i} delay={i * 100}>
                  <div className="branch-card group flex-1 flex flex-col">
                    <div className={`h-28 bg-gradient-to-br ${branch.gradient} flex items-center justify-center relative overflow-hidden shrink-0`}>
                      <span className="text-4xl relative z-10">{branch.emoji}</span>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{branch.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{branch.addr}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(branch.addr)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-direction flex-1 text-sm py-2"
                        >
                          📍 {t('Directions', 'اتجاهات')}
                        </a>
                        <a
                          href="https://wa.me/201019382288"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-whatsapp"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <FadeInSection>
          <div className="cta-box-enhanced">
            <div className="floating-circle absolute w-48 h-48 bg-white/5 rounded-full -top-16 -right-16" style={{ animationDelay: '-1s' }} />
            <div className="floating-circle absolute w-32 h-32 bg-amber-300/5 rounded-full -bottom-10 -left-10" style={{ animationDelay: '-3s' }} />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif-alt mb-3">
                {t('Ready for Your Escape?', 'مستعد لرحلتك؟')}
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
                {t('Book your session now — free cancellation, instant confirmation.', 'احجز جلستك الآن — إلغاء مجاني، تأكيد فوري.')}
              </p>
              <button
                onClick={scrollToServices}
                className="cta-button btn-shimmer"
              >
                ✨ {t('Book Your Session', 'احجز جلستك')} →
              </button>
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-white/70">
                <span className="flex items-center gap-1.5">✓ {t('Free cancellation', 'إلغاء مجاني')}</span>
                <span className="flex items-center gap-1.5">✓ {t('Instant QR code', 'QR فوري')}</span>
                <span className="flex items-center gap-1.5">✓ {t('WhatsApp support', 'دعم واتساب')}</span>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ==================== SERVICE DRAWER ==================== */}
      <ServiceDrawer
        service={selectedService}
        open={drawerOpen}
        onClose={closeDrawer}
        testimonials={testimonials}
      />
    </div>
  )
}
