import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const supabase = await createServerSupabase()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const { data: packages } = await supabase
    .from('packages')
    .select('*, categories(name_en)')
    .order('created_at', { ascending: false })

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <SettingsForm
      categories={categories || []}
      packages={packages || []}
      testimonials={testimonials || []}
    />
  )
}
