'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Business = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  whatsapp_owner: string
  max_capacity: number
  working_hours: Record<string, { open: string; close: string }>
}

export function SettingsForm({ business }: { business: Business }) {
  const [name, setName] = useState(business.name)
  const [color, setColor] = useState(business.primary_color)
  const [whatsapp, setWhatsapp] = useState(business.whatsapp_owner)
  const [capacity, setCapacity] = useState(business.max_capacity)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('businesses')
      .update({
        name,
        primary_color: color,
        whatsapp_owner: whatsapp,
        max_capacity: capacity,
      })
      .eq('id', business.id)

    if (error) {
      setMessage('Error saving settings')
    } else {
      setMessage('Settings saved successfully!')
      router.refresh()
    }
    setSaving(false)
  }

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  }

  return (
    <form onSubmit={saveSettings} className="glass p-6 space-y-8">
      {/* Business Info */}
      <section>
        <h3 className="font-semibold text-slate-900 mb-4">🏢 Business Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Business Name</label>
            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Slug (URL)</label>
            <input type="text" className="input-field bg-slate-50 text-slate-400" value={business.slug} disabled />
            <p className="text-xs text-slate-400 mt-1">/{business.slug}</p>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Branding */}
      <section>
        <h3 className="font-semibold text-slate-900 mb-4">🎨 Branding</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                className="size-12 rounded-lg border border-slate-200 cursor-pointer"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <input
                type="text"
                className="input-field font-mono text-sm"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Preview</label>
            <div className="flex gap-2 items-center">
              <div className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: color }}>
                Button
              </div>
              <div className="px-4 py-2 rounded-lg text-sm font-semibold border-2" style={{ borderColor: color, color }}>
                Outline
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Contact & Capacity */}
      <section>
        <h3 className="font-semibold text-slate-900 mb-4">📞 Contact & Capacity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">WhatsApp Number (Owner)</label>
            <input
              type="tel"
              className="input-field"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="201028803080"
            />
            <p className="text-xs text-slate-400 mt-1">International format without +</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Max Capacity</label>
            <input
              type="number"
              className="input-field"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
        </div>
      </section>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}

      <button type="submit" disabled={saving} className="btn-primary px-10">
        {saving ? 'Saving...' : '💾 Save Settings'}
      </button>
    </form>
  )
}
