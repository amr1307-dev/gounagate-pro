import { createServerSupabase, getUserProfile } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/auth/login')

  const supabase = await createServerSupabase()
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', profile.business_id)
    .single()

  if (!business) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🏗️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Business Found</h2>
        <p className="text-slate-500">Create a business first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your business profile and preferences</p>
      </div>

      <SettingsForm business={business} />
    </div>
  )
}
