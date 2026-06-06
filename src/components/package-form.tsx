'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Package = {
  id?: string
  category_id: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  price: number
  duration_minutes: number
  image_url: string | null
  is_active: boolean
}

type Category = {
  id: string
  name_en: string
  name_ar: string
}

export function PackageForm({ pkg }: { pkg?: Package }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState(pkg?.image_url || '')

  const isEdit = !!pkg?.id

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const r = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await r.json()
      if (data.url) setImageUrl(data.url)
      else setError(data.error || 'Upload failed')
    } catch { setError('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const form = e.currentTarget
    const data = {
      category_id: (form.elements.namedItem('category_id') as HTMLSelectElement).value,
      name_en: (form.elements.namedItem('name_en') as HTMLInputElement).value,
      name_ar: (form.elements.namedItem('name_ar') as HTMLInputElement).value,
      description_en: (form.elements.namedItem('description_en') as HTMLTextAreaElement).value,
      description_ar: (form.elements.namedItem('description_ar') as HTMLTextAreaElement).value,
      price: parseFloat((form.elements.namedItem('price') as HTMLInputElement).value),
      duration_minutes: parseInt((form.elements.namedItem('duration') as HTMLInputElement).value),
      image_url: imageUrl || null,
      is_active: (form.elements.namedItem('is_active') as HTMLSelectElement).value === 'true',
    }

    try {
      const url = isEdit ? '/api/admin/packages' : '/api/admin/packages'
      const method = isEdit ? 'PUT' : 'POST'
      const body = isEdit ? { ...data, id: pkg!.id } : data
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const result = await r.json()
      if (result.success) router.push('/dashboard/packages')
      else setError(result.error || 'Save failed')
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name (English)" required>
          <input name="name_en" type="text" className="input-field" defaultValue={pkg?.name_en || ''} required />
        </Field>
        <Field label="Name (Arabic)">
          <input name="name_ar" type="text" className="input-field" defaultValue={pkg?.name_ar || ''} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" required>
          <select name="category_id" className="input-field" defaultValue={pkg?.category_id || ''} required>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_en} / {c.name_ar}</option>
            ))}
          </select>
        </Field>
        <Field label="Duration (minutes)" required>
          <input name="duration" type="number" className="input-field" defaultValue={pkg?.duration_minutes || 60} min={15} required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (EGP)" required>
          <input name="price" type="number" className="input-field" defaultValue={pkg?.price || ''} min={0} step={0.01} required />
        </Field>
        <Field label="Active">
          <select name="is_active" className="input-field" defaultValue={pkg?.is_active !== undefined ? String(pkg.is_active) : 'true'}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </Field>
      </div>

      <Field label="Description (English)">
        <textarea name="description_en" className="input-field min-h-[80px]" defaultValue={pkg?.description_en || ''} rows={3} />
      </Field>
      <Field label="Description (Arabic)">
        <textarea name="description_ar" className="input-field min-h-[80px]" defaultValue={pkg?.description_ar || ''} rows={3} />
      </Field>

      <Field label="Image">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            {uploading ? 'Uploading...' : 'Choose Image'}
          </button>
          {imageUrl && (
            <div className="size-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
          />
          {imageUrl && (
            <button type="button" onClick={() => setImageUrl('')} className="text-xs text-red-500 hover:underline">
              Remove
            </button>
          )}
        </div>
        <input name="image_url" type="hidden" value={imageUrl} />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? 'Saving...' : isEdit ? 'Update Package' : 'Create Package'}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/packages')} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-500">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}
