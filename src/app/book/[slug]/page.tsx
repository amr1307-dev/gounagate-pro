import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { BookingForm } from '@/components/booking-form'
import Script from 'next/script'
import { notFound } from 'next/navigation'

async function getPackage(slug: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data } = await supabase
    .from('packages')
    .select('*, categories(name_en, name_ar)')
    .eq('id', slug)
    .eq('is_active', true)
    .single()

  return data
}

async function getBranches() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name_en')

  return data || []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pkg = await getPackage(slug)
  if (!pkg) return { title: 'Service Not Found - Paradise World' }

  return {
    title: `${pkg.name_en} - Booking | Paradise World Hurghada`,
    description: `Book ${pkg.name_en} at Paradise World Hurghada. ${pkg.duration_minutes} min session for ${pkg.price} EGP. Instant QR confirmation.`,
  }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [pkg, branches] = await Promise.all([getPackage(slug), getBranches()])

  if (!pkg) notFound()

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">{pkg.categories?.name_en === 'Massage' ? '💪' : pkg.categories?.name_en === 'Salt Cave' ? '🧂' : pkg.categories?.name_en === 'Beauty' ? '💄' : pkg.categories?.name_en === 'Sauna' ? '🧖' : '💆'}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{pkg.name_en}</h1>
          <p className="text-slate-500 mt-1">
            {pkg.duration_minutes} min · <span className="text-[#D4A843] font-bold">{pkg.price.toLocaleString('en-EG')} EGP</span>
          </p>
          {pkg.description_en && <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">{pkg.description_en}</p>}
        </div>

        <BookingForm pkg={pkg} branches={branches} />
      </div>
    </>
  )
}
