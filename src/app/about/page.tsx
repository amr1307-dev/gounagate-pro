'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function FadeInSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref} className={cn('transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const BASE_URL = 'https://andnjljpdfagluqjfroo.supabase.co/storage/v1/object/public/package-images/packages/'

export default function AboutPage() {
  const t = (en: string, ar: string) => en

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("${BASE_URL}slide-7.jpg")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-transparent to-teal-900/30" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
            ✦ {t('About Paradise World', 'عن بارادايس وورلد')}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-serif-alt leading-[1.1]">
            {t('Where Luxury Meets', 'حيث يلتقي الفخامة')}{' '}
            <span className="text-amber-300">{t('Wellness', 'بالعافية')}</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            {t('For over a decade, Paradise World has been Hurghada\'s premier destination for relaxation, rejuvenation, and world-class spa experiences.', 'لأكثر من عقد، كانت بارادايس وورلد الوجهة الأولى في الغردقة للاسترخاء والتجديد وتجارب السبا العالمية.')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={BASE_URL + 'gallery-spa-4.jpg'}
                  alt="Paradise World Spa Interior"
                  className="w-full h-[400px] object-cover"
                  loading="lazy"
                />
              </div>
            </FadeInSection>
            <FadeInSection delay={100}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full mb-4">
                ✦ {t('Our Story', 'قصتنا')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-alt mb-6">
                {t('A Decade of Excellence in Wellness', 'عقد من التميز في العافية')}
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  {t('Founded in 2015, Paradise World Hurghada began with a simple vision: create a sanctuary where guests could escape the stress of everyday life and reconnect with their inner peace. What started as a small massage studio on the Corniche has grown into one of Hurghada\'s most trusted wellness destinations.', 'تأسست بارادايس وورلد الغردقة في عام 2015 برؤية بسيطة: إنشاء ملاذ يمكن للضيوف فيه الهروب من ضغوط الحياة اليومية وإعادة الاتصال بسلامهم الداخلي. ما بدأ كاستوديو مساج صغير على الكورنيش نما ليصبح واحداً من أكثر وجهات العافية الموثوقة في الغردقة.')}
                </p>
                <p>
                  {t('Today, we operate two premium branches — our flagship Corniche location and an exclusive resort branch inside Florenza Khamsin. We have served over 7,000 happy guests from more than 40 countries, earning consistent 5-star reviews on Google and TripAdvisor.', 'اليوم، ندير فرعين متميزين — موقعنا الرئيسي على الكورنيش وفرع حصري داخل منتجع فلورنزا خماسين. خدمنا أكثر من 7,000 ضيف سعيد من أكثر من 40 دولة، وحصلنا على تقييمات 5 نجوم باستمرار على جوجل وتريب أدفايزر.')}
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-teal-900 to-teal-800 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '11+', label: t('Years Experience', 'سنوات خبرة') },
              { num: '7,000+', label: t('Happy Guests', 'ضيف سعيد') },
              { num: '40+', label: t('Nationalities Served', 'جنسية') },
              { num: '4.8 ★', label: t('Average Rating', 'متوسط التقييم') },
            ].map((stat, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="text-white">
                  <div className="text-3xl sm:text-4xl font-bold font-serif-alt">{stat.num}</div>
                  <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full">
              ✦ {t('Our Team', 'فريقنا')}
            </span>
          </div>
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center font-serif-alt mb-4">
              {t('Skilled Therapists, Real Care', 'معالجون ماهرون، عناية حقيقية')}
            </h2>
            <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
              {t('Every member of our team is certified, experienced, and passionate about wellness. From Swedish massage to salt cave therapy, our therapists bring expertise and warmth to every session.', 'كل عضو في فريقنا معتمد وذو خبرة وشغوف بالعافية. من المساج السويدي إلى علاج كهف الملح، معالجونا يجلبون الخبرة والدفء لكل جلسة.')}
            </p>
          </FadeInSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: t('Ahmed Hassan', 'أحمد حسن'), role: t('Founder & Chief Therapist', 'المؤسس وكبير المعالجين'), bio: t('Licensed massage therapist with 15+ years of experience. Trained in Thailand, Sweden, and Egypt.', 'معالج مساج مرخص بخبرة تزيد عن 15 عاماً. تدرب في تايلاند والسويد ومصر.'), img: null },
              { name: t('Nadia Ibrahim', 'نادية إبراهيم'), role: t('Senior Spa Therapist', 'معالجة سبا أولى'), bio: t('Specialist in hot stone therapy and deep tissue massage. 10+ years of transforming guest wellness.', 'متخصصة في العلاج بالأحجار الساخنة والمساج العميق. أكثر من 10 سنوات في تحويل صحة الضيوف.'), img: null },
              { name: t('Omar El-Sayed', 'عمر السيد'), role: t('Salt Cave Specialist', 'أخصائي كهف الملح'), bio: t('Certified halotherapy practitioner. Passionate about natural respiratory wellness and salt therapy.', 'ممارس معتمد للعلاج بالملح. شغوف بالعافية التنفسية الطبيعية والعلاج بالملح.'), img: null },
            ].map((member, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="testimonial-card text-center">
                  <div className="size-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">{member.role}</p>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{member.bio}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full">
              ✦ {t('Our Values', 'قيمنا')}
            </span>
          </div>
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center font-serif-alt mb-12">
              {t('What We Stand For', 'ما نمثله')}
            </h2>
          </FadeInSection>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: t('Authentic Care', 'عناية حقيقية'), desc: t('Every treatment is personalized. We listen, we understand, we deliver — because your wellness is personal.', 'كل علاج مخصص. نستمع، نفهم، نقدم — لأن عافيتك شخصية.'), icon: '🤲' },
              { title: t('Premium Hygiene', 'نظافة فاخرة'), desc: t('Hospital-grade sanitation, fresh linens for every guest, and spotless facilities. Your safety drives every standard.', 'تعقيم بمستوى المستشفيات، أغطية جديدة لكل ضيف، ومرافق نقية. سلامتك تقود كل معاييرنا.'), icon: '✨' },
              { title: t('Egyptian Hospitality', 'ضيافة مصرية'), desc: t('Warm welcomes, genuine smiles, and the legendary hospitality that Egypt is known for around the world.', 'ترحيب حار، ابتسامات صادقة، والضيافة الأسطورية التي تشتهر بها مصر في جميع أنحاء العالم.'), icon: '❤️' },
            ].map((v, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="feature-card-v2 text-center">
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <FadeInSection>
            <div className="cta-box-enhanced">
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif-alt mb-3">
                {t('Experience Paradise Today', 'اختبر الجنة اليوم')}
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
                {t('Book your session now and discover why thousands trust Paradise World.', 'احجز جلستك الآن واكتشف لماذا يثق الآلاف في بارادايس وورلد.')}
              </p>
              <Link
                href="/#services"
                className="cta-button btn-shimmer inline-flex"
              >
                ✨ {t('Browse Services', 'تصفح الخدمات')} →
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}
