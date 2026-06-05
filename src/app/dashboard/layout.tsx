import Link from 'next/link'
import { getUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-300 p-4 fixed h-full">
        <div className="flex items-center gap-2 mb-8 mt-2">
          <svg viewBox="0 0 32 32" fill="none" className="size-7">
            <rect width="32" height="32" rx="8" fill="#B8860B"/>
            <path d="M16 6C12 6 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16' stroke='white' strokeWidth='3' strokeLinecap='round' fill='none"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
          <span className="font-bold text-white text-lg">Paradise World</span>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarLink href="/dashboard" icon="📊">Dashboard</SidebarLink>
          <SidebarLink href="/dashboard/analytics" icon="📈">Analytics</SidebarLink>
          <SidebarLink href="/dashboard/bookings" icon="📋">Bookings</SidebarLink>
          <SidebarLink href="/dashboard/calendar" icon="📅">Calendar</SidebarLink>
          <SidebarLink href="/dashboard/settings" icon="⚙️">Settings</SidebarLink>
        </nav>

        <div className="border-t border-slate-800 pt-4 mt-4">
          <SidebarLink href="/scan/demo" icon="📷">Scan QR</SidebarLink>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around py-2 px-2">
        <MobileNavLink href="/dashboard" icon="📊" label="Dashboard" />
        <MobileNavLink href="/dashboard/analytics" icon="📈" label="Analytics" />
        <MobileNavLink href="/dashboard/bookings" icon="📋" label="Bookings" />
        <MobileNavLink href="/dashboard/calendar" icon="📅" label="Calendar" />
        <MobileNavLink href="/dashboard/settings" icon="⚙️" label="Settings" />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-800 hover:text-white transition"
    >
      <span>{icon}</span>
      {children}
    </Link>
  )
}

function MobileNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-500 text-xs">
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  )
}
