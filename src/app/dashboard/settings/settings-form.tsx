'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Category = { id: string; name_en: string; name_ar: string; slug: string; icon: string; sort_order: number }
type Package = { id: string; name_en: string; name_ar: string; price: number; duration_minutes: number; is_active: boolean; categories: { name_en: string } }
type Testimonial = { id: string; client_name: string; rating: number; comment_en: string; client_country: string; is_visible: boolean }

export function SettingsForm({ categories, packages, testimonials }: { categories: Category[]; packages: Package[]; testimonials: Testimonial[] }) {
  const [tab, setTab] = useState<'packages' | 'categories' | 'testimonials'>('packages')
  const router = useRouter()
  const supabase = createClient()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage packages, categories, and testimonials</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {(['packages', 'categories', 'testimonials'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-[1px] ${
              tab === t
                ? 'border-[#0A6E74] text-[#0A6E74]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'packages' ? '📦 Packages' : t === 'categories' ? '📂 Categories' : '💬 Testimonials'}
          </button>
        ))}
      </div>

      {tab === 'packages' && <PackagesEditor packages={packages} categories={categories} supabase={supabase} router={router} />}
      {tab === 'categories' && <CategoriesEditor categories={categories} supabase={supabase} router={router} />}
      {tab === 'testimonials' && <TestimonialsEditor testimonials={testimonials} supabase={supabase} router={router} />}
    </div>
  )
}

function PackagesEditor({ packages, categories, supabase, router }: { packages: Package[]; categories: Category[]; supabase: any; router: any }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name_en: '', name_ar: '', price: 0, duration_minutes: 60, category_id: '' })
  const [saving, setSaving] = useState(false)

  const createNew = async () => {
    setSaving(true)
    await supabase.from('packages').insert({
      category_id: categories[0]?.id,
      name_en: 'New Package',
      name_ar: 'باقة جديدة',
      price: 0,
      duration_minutes: 60,
    })
    setSaving(false)
    router.refresh()
  }

  const updatePackage = async (id: string) => {
    setSaving(true)
    await supabase.from('packages').update(form).eq('id', id)
    setEditing(null)
    setSaving(false)
    router.refresh()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('packages').update({ is_active: !active }).eq('id', id)
    router.refresh()
  }

  const deletePkg = async (id: string) => {
    if (!confirm('Delete this package?')) return
    await supabase.from('packages').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">All Packages</h3>
        <button onClick={createNew} disabled={saving} className="btn-primary text-sm px-4 py-2">+ Add Package</button>
      </div>

      {packages.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No packages yet. Create your first one.</p>
      ) : (
        <div className="space-y-3">
          {packages.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex-1 min-w-0">
                {editing === p.id ? (
                  <div className="flex flex-wrap gap-2">
                    <input className="input-field w-40 text-sm" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
                    <input className="input-field w-28 text-sm" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
                    <input className="input-field w-20 text-sm" type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 60 }))} />
                    <button onClick={() => updatePackage(p.id)} className="btn-primary text-xs px-3 py-1">Save</button>
                    <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-3 py-1">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-sm text-slate-800 truncate">{p.name_en}</div>
                    <div className="text-xs text-slate-400">{p.price.toLocaleString('en-EG')} EGP · {p.duration_minutes} min · {p.categories?.name_en}</div>
                  </>
                )}
              </div>
              {editing !== p.id && (
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => { setEditing(p.id); setForm({ name_en: p.name_en, name_ar: p.name_ar, price: p.price, duration_minutes: p.duration_minutes, category_id: '' }) }} className="text-xs text-[#0A6E74] hover:underline">Edit</button>
                  <button onClick={() => toggleActive(p.id, p.is_active)} className="text-xs text-amber-600 hover:underline">{p.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => deletePkg(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoriesEditor({ categories, supabase, router }: { categories: Category[]; supabase: any; router: any }) {
  const [form, setForm] = useState({ name_en: '', name_ar: '', icon: '💆', sort_order: 0 })
  const [saving, setSaving] = useState(false)

  const createNew = async () => {
    setSaving(true)
    const slug = form.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await supabase.from('categories').insert({
      name_en: form.name_en || 'New Category',
      name_ar: form.name_ar || 'تصنيف جديد',
      slug,
      icon: form.icon,
      sort_order: categories.length + 1,
    })
    setForm({ name_en: '', name_ar: '', icon: '💆', sort_order: 0 })
    setSaving(false)
    router.refresh()
  }

  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category? This will also delete all packages in it.')) return
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="glass p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Categories</h3>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Name (EN)</label>
          <input className="input-field w-40 text-sm" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Name (AR)</label>
          <input className="input-field w-40 text-sm" value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Icon</label>
          <input className="input-field w-20 text-sm" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
        </div>
        <button onClick={createNew} disabled={saving} className="btn-primary text-sm px-4 py-2.5">+ Add</button>
      </div>

      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">{c.icon}</span>
              <div>
                <span className="text-sm font-medium text-slate-800">{c.name_en}</span>
                <span className="text-xs text-slate-400 ml-2">{c.name_ar}</span>
                <span className="text-xs text-slate-300 ml-2">/{c.slug}</span>
              </div>
            </div>
            <button onClick={() => deleteCat(c.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function TestimonialsEditor({ testimonials, supabase, router }: { testimonials: Testimonial[]; supabase: any; router: any }) {
  const [form, setForm] = useState({ client_name: '', rating: 5, comment_en: '', client_country: '' })
  const [saving, setSaving] = useState(false)

  const createNew = async () => {
    setSaving(true)
    await supabase.from('testimonials').insert({
      client_name: form.client_name || 'Guest',
      rating: form.rating,
      comment_en: form.comment_en || 'Amazing experience!',
      client_country: form.client_country,
    })
    setForm({ client_name: '', rating: 5, comment_en: '', client_country: '' })
    setSaving(false)
    router.refresh()
  }

  const toggleVisible = async (id: string, visible: boolean) => {
    await supabase.from('testimonials').update({ is_visible: !visible }).eq('id', id)
    router.refresh()
  }

  const deleteTest = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="glass p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Testimonials</h3>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Name</label>
          <input className="input-field w-36 text-sm" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Rating (1-5)</label>
          <input className="input-field w-16 text-sm" type="number" min={1} max={5} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseInt(e.target.value) || 5 }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Country</label>
          <input className="input-field w-28 text-sm" value={form.client_country} onChange={e => setForm(f => ({ ...f, client_country: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Comment</label>
          <input className="input-field w-60 text-sm" value={form.comment_en} onChange={e => setForm(f => ({ ...f, comment_en: e.target.value }))} />
        </div>
        <button onClick={createNew} disabled={saving} className="btn-primary text-sm px-4 py-2.5">+ Add</button>
      </div>

      <div className="space-y-2">
        {testimonials.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{t.client_name}</span>
                <span className="text-xs text-[#D4A843]">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                {t.client_country && <span className="text-xs text-slate-400">{t.client_country}</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{t.comment_en}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button onClick={() => toggleVisible(t.id, t.is_visible)} className="text-xs text-amber-600 hover:underline">{t.is_visible ? 'Hide' : 'Show'}</button>
              <button onClick={() => deleteTest(t.id)} className="text-xs text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
