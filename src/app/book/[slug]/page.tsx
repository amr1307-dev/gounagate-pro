import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { BookingForm } from '@/components/booking-form'
import Script from 'next/script'

async function getBusiness(slug: string) {
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
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusiness(slug)
  if (!business) return { title: 'Business Not Found - GounaGate' }

  return {
    title: `${business.name} - Booking | GounaGate`,
    description: `Book your spot at ${business.name} with GounaGate. Instant QR confirmation.`,
  }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Business Not Found</h1>
          <p className="text-slate-500">The business you&apos;re looking for doesn&apos;t exist or is inactive.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          {business.logo_url && (
            <img src={business.logo_url} alt={business.name} className="h-12 mx-auto mb-3 object-contain" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{business.name}</h1>
          <p className="text-slate-500 mt-1">Book your spot — instant QR confirmation</p>
        </div>

        <div style={{ '--primary': business.primary_color } as React.CSSProperties}>
          <BookingForm business={business} />
        </div>
      </div>
    </>
  )
}
