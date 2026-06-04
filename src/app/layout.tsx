import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { SWRegister } from '@/components/sw-register'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: 'GounaGate - Smart Booking & QR Entry System',
  description: 'Smart booking and QR gate entry system for El Gouna businesses. Reserve your spot instantly with QR confirmation.',
  keywords: 'El Gouna, booking, QR, gate entry, reservation, Egypt, GounaGate',
  openGraph: {
    title: 'GounaGate - Smart Booking',
    description: 'Book your entry to El Gouna venues with instant QR confirmation.',
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230A6E74'/><path d='M8 16L14 22L24 10' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
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
