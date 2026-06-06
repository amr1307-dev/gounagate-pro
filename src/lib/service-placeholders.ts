type ServiceStyle = {
  container: string
  icon: string
}

const serviceStyles: Record<string, ServiceStyle> = {
  'salt-cave': {
    container: 'bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50 pattern-dots',
    icon: '🧂',
  },
  massage: {
    container: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 pattern-waves',
    icon: '💆',
  },
  spa: {
    container: 'bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-50 pattern-circles',
    icon: '👑',
  },
  beauty: {
    container: 'bg-gradient-to-br from-pink-100 via-rose-50 to-red-50 pattern-diagonal',
    icon: '✨',
  },
  sauna: {
    container: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 pattern-waves',
    icon: '🧖',
  },
  default: {
    container: 'bg-gradient-to-br from-teal-100 via-cyan-50 to-emerald-50',
    icon: '✦',
  },
}

function getSlug(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('salt') || n.includes('cave')) return 'salt-cave'
  if (n.includes('swedish') || n.includes('massage') || n.includes('hot stone') || n.includes('thai')) return 'massage'
  if (n.includes('royal') || n.includes('couples') || n.includes('spa')) return 'spa'
  if (n.includes('facial') || n.includes('beauty') || n.includes('manicure') || n.includes('pedicure')) return 'beauty'
  if (n.includes('sauna') || n.includes('steam')) return 'sauna'
  return 'default'
}

export function getServiceStyle(name: string): ServiceStyle {
  return serviceStyles[getSlug(name)] ?? serviceStyles.default
}
