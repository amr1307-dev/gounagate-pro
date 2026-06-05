import { getUser } from '@/lib/supabase-server'
import { QRScanner } from '@/components/qr-scanner'
import Script from 'next/script'

export async function generateMetadata() {
  return {
    title: 'Scan QR - Paradise World Hurghada',
    description: 'Scan guest QR codes for session verification.',
  }
}

export default async function ScanPage() {
  const user = await getUser()

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js" strategy="lazyOnload" />

      <div className="min-h-screen hero-gradient-paradise">
        <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
          <QRScanner userId={user?.id} />
        </div>
      </div>
    </>
  )
}
