'use client'

import { useState, useEffect, useCallback } from 'react'
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
  highlights?: string[]
  good_to_know?: string[]
  whats_included?: string[]
  faqs?: { q: string; a: string }[]
  video_url?: string | null
  discount_percent?: number
  original_price?: number
}

type Testimonial = {
  id: string
  client_name: string
  rating: number
  comment_en: string
  comment_ar: string
  client_country: string
}

const DEFAULT_HIGHLIGHTS = ['Relaxation & stress relief', 'Self-care & pampering', 'Trying something new', 'A special treat']
const DEFAULT_GOOD_TO_KNOW = ['Robes & slippers provided', 'Arrive 10 min early', 'Free cancellation up to 2h before', 'All levels welcome']
const DEFAULT_INCLUDED = ['Full session treatment', 'Fresh robe & slippers', 'Herbal tea post-session', 'Professional therapist']
const DEFAULT_FAQS = [
  { q: 'What should I wear?', a: 'Comfortable clothes. We provide a robe and slippers for your session.' },
  { q: 'Is it suitable for beginners?', a: 'Absolutely! Our therapists guide you through everything.' },
  { q: 'What if I need to cancel?', a: 'Free cancellation up to 2 hours before your booking.' },
]

type ServiceDrawerProps = {
  service: Package | null
  open: boolean
  onClose: () => void
  testimonials: Testimonial[]
}

export function ServiceDrawer({ service, open, onClose, testimonials }: ServiceDrawerProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) close() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, close])

  if (!service) return null

  const highlights = service.highlights?.filter(Boolean) || DEFAULT_HIGHLIGHTS
  const goodToKnow = service.good_to_know?.filter(Boolean) || DEFAULT_GOOD_TO_KNOW
  const whatsIncluded = service.whats_included?.filter(Boolean) || DEFAULT_INCLUDED
  const faqs = service.faqs?.filter(f => f.q || f.a) || DEFAULT_FAQS

  const serviceTestimonials = testimonials.filter(t => {
    const serviceWords = service.name_en.toLowerCase().split(' ')
    const commentLower = t.comment_en.toLowerCase()
    return serviceWords.some((w: string) => w.length > 3 && commentLower.includes(w))
  }).slice(0, 3)

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
      />

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[70] transition-transform duration-300 ease-out',
          visible ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl mx-auto max-w-2xl w-full relative">
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 bg-white rounded-t-3xl" onClick={close}>
            <div className="w-10 h-1 rounded-full bg-slate-300 cursor-pointer" />
          </div>

          <button
            onClick={close}
            className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-white/90 shadow-md text-slate-500 hover:text-slate-800 transition"
          >
            ✕
          </button>

          <div className="px-4 pb-6">
            <div className="relative h-52 sm:h-64 rounded-2xl overflow-hidden mb-4 -mx-0">
              {service.video_url ? (
                <iframe
                  src={service.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                  title={service.name_en}
                />
              ) : (
                <img
                  src={service.image_url || `/api/placeholder?name=${encodeURIComponent(service.name_en)}`}
                  alt={service.name_en}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-xl font-bold text-white drop-shadow-sm">{service.name_en}</h3>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {service.discount_percent && service.discount_percent > 0 ? (
                  <>
                    <span className="text-red-600 font-bold text-lg">
                      {service.price.toLocaleString('en-EG')} EGP
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {(service.original_price || Math.round(service.price / (1 - service.discount_percent / 100))).toLocaleString('en-EG')} EGP
                    </span>
                    <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                      -{service.discount_percent}%
                    </span>
                  </>
                ) : (
                  <span className="text-[#D4A843] font-bold text-lg">
                    {service.price.toLocaleString('en-EG')} EGP
                  </span>
                )}
                <span className="text-sm text-slate-400">· {service.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-amber-500">★★★★★</span>
                <span className="text-slate-500 ml-1">4.9</span>
              </div>
            </div>

            {service.description_en && (
              <div className="mb-5">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">What to Expect</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{service.description_en}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-teal-50 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1.5">Perfect For</h4>
                <ul className="space-y-1">
                  {highlights.map((item, i) => (
                    <li key={i} className="text-xs text-teal-700 flex items-start gap-1.5">
                      <span className="text-teal-500 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5">Good to Know</h4>
                <ul className="space-y-1">
                  {goodToKnow.map((item, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5 shrink-0">ℹ</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="font-semibold text-slate-900 mb-2 text-sm">What&apos;s Included</h4>
              <div className="space-y-2">
                {whatsIncluded.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <span className="text-teal-700 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {faqs.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">Frequently Asked</h4>
                <div className="space-y-1 border border-slate-200 rounded-xl overflow-hidden">
                  {faqs.map((item, i) => (
                    <div key={i} className="border-b border-slate-100 last:border-b-0">
                      <button
                        onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition"
                      >
                        {item.q}
                        <span className={cn(
                          'text-slate-400 transition-transform duration-200 shrink-0 ml-2',
                          faqOpen === i && 'rotate-180'
                        )}>
                          ▼
                        </span>
                      </button>
                      <div className={cn(
                        'overflow-hidden transition-all duration-200',
                        faqOpen === i ? 'max-h-40' : 'max-h-0'
                      )}>
                        <p className="px-4 pb-3 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serviceTestimonials.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">Guest Reviews</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {serviceTestimonials.map(t => (
                    <div key={t.id} className="min-w-[240px] bg-slate-50 rounded-xl p-3 shrink-0">
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i} className="text-amber-500 text-xs">★</span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed">&ldquo;{t.comment_en}&rdquo;</p>
                      <div className="flex items-center gap-1.5">
                        <div className="size-6 rounded-full bg-teal-700 flex items-center justify-center text-white text-[10px] font-bold">
                          {t.client_name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-slate-800">{t.client_name}</span>
                          {t.client_country && <span className="text-[10px] text-slate-400 ml-1">{t.client_country}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Link
                href={`/book/${service.id}`}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0A6E74] to-[#065256] text-white font-bold py-3.5 rounded-xl text-sm hover:shadow-lg hover:shadow-teal-900/20 transition-all active:scale-[0.98]"
              >
                Book This Session — {service.price.toLocaleString('en-EG')} EGP
                {service.discount_percent && service.discount_percent > 0 && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    -{service.discount_percent}%
                  </span>
                )}
              </Link>
              <a
                href="https://wa.me/201019382288"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] font-semibold py-3 rounded-xl text-sm hover:bg-[#25D366] hover:text-white transition-all active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Questions? Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
