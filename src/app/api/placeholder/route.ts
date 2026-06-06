import { NextRequest, NextResponse } from 'next/server'

const CATEGORIES = [
  { keywords: ['massage', 'swedish', 'hot stone', 'thai'], colors: ['#064E3B', '#0D9488'], emoji: '💆' },
  { keywords: ['salt', 'cave'], colors: ['#92400E', '#FBBF24'], emoji: '🧂' },
  { keywords: ['spa', 'royal', 'couples'], colors: ['#4C1D95', '#7C3AED'], emoji: '👑' },
  { keywords: ['beauty', 'facial', 'manicure', 'pedicure'], colors: ['#9D174D', '#F43F5E'], emoji: '✨' },
  { keywords: ['sauna', 'steam'], colors: ['#C2410C', '#F97316'], emoji: '🧖' },
]

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function getCategory(name: string) {
  const lower = name.toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(k => lower.includes(k))) return cat
  }
  return { colors: ['#0F766E', '#06B6D4'], emoji: '✦' }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || 'Spa Service'
  const width = Math.min(Math.max(parseInt(searchParams.get('width') || '400', 10) || 400, 100), 2000)
  const height = Math.min(Math.max(parseInt(searchParams.get('height') || '250', 10) || 250, 100), 2000)

  const cat = getCategory(name)
  const fontSize = Math.max(14, Math.min(24, Math.round(width / 18)))

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cat.colors[0]}"/>
      <stop offset="100%" stop-color="${cat.colors[1]}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="12" fill="url(#g)"/>
  <text x="50%" y="${Math.round(height * 0.38)}" text-anchor="middle" dominant-baseline="central" font-size="72">${cat.emoji}</text>
  <text x="50%" y="${Math.round(height * 0.65)}" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600">${escapeXml(name)}</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
