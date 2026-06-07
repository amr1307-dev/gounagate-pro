import { getUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar />

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
