import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { SWRegister } from '@/components/sw-register'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: 'Paradise World Hurghada - Premium Spa & Wellness',
  description: 'Book your premium spa experience at Paradise World Hurghada. Massage, salt cave, sauna, beauty treatments and more. Instant QR booking confirmation.',
  keywords: 'Paradise World, Hurghada, spa, massage, salt cave, sauna, beauty, wellness, Egypt, booking',
  openGraph: {
    title: 'Paradise World Hurghada - Premium Spa',
    description: 'Book your premium spa experience with instant QR confirmation.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${cairo.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23B8860B'/><path d='M16 6C12 6 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16' stroke='white' stroke-width='3' stroke-linecap='round' fill='none'/><circle cx='16' cy='16' r='4' fill='white'/></svg>" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A6E74" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen flex flex-col">
        <SWRegister />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
