import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { QRScanner } from '@/components/qr-scanner'
import { getUser } from '@/lib/supabase-server'
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
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusiness(slug)
  return {
    title: business ? `Scan QR - ${business.name} | GounaGate` : 'Scan QR | GounaGate',
    description: 'Scan guest QR codes for gate entry verification.',
  }
}

export default async function ScanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusiness(slug)
  const user = await getUser()

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
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
          <p className="text-slate-500">Gate Entry Verification</p>
        </div>

        <QRScanner businessId={business.id} userId={user?.id} />
      </div>
    </>
  )
}
