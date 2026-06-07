'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardLang, t } from '@/lib/dashboard-lang'

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
  highlights?: string[]
  good_to_know?: string[]
  whats_included?: string[]
  faqs?: { q: string; a: string }[]
  video_url?: string | null
}

type Category = {
  id: string
  name_en: string
  name_ar: string
}

export function PackageForm({ pkg }: { pkg?: Package }) {
  const lang = useDashboardLang()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState(pkg?.image_url || '')
  const [highlights, setHighlights] = useState<string[]>(pkg?.highlights || ['', '', '', ''])
  const [goodToKnow, setGoodToKnow] = useState<string[]>(pkg?.good_to_know || ['', '', '', ''])
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(pkg?.whats_included || ['', '', '', ''])
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(pkg?.faqs || [{ q: '', a: '' }])
  const [videoUrl, setVideoUrl] = useState(pkg?.video_url || '')

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

  function addFaq() { setFaqs([...faqs, { q: '', a: '' }]) }
  function removeFaq(i: number) { setFaqs(faqs.filter((_, idx) => idx !== i)) }
  function updateFaq(i: number, field: 'q' | 'a', val: string) {
    const copy = [...faqs]; copy[i] = { ...copy[i], [field]: val }; setFaqs(copy)
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
      highlights: highlights.filter(h => h.trim()),
      good_to_know: goodToKnow.filter(g => g.trim()),
      whats_included: whatsIncluded.filter(w => w.trim()),
      faqs: faqs.filter(f => f.q.trim() || f.a.trim()),
      video_url: videoUrl || null,
    }

    try {
      const url = '/api/admin/packages'
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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t(lang, 'Name (English)', 'الاسم (إنجليزي)')} required>
          <input name="name_en" type="text" className="input-field" defaultValue={pkg?.name_en || ''} required />
        </Field>
        <Field label={t(lang, 'Name (Arabic)', 'الاسم (عربي)')}>
          <input name="name_ar" type="text" className="input-field" defaultValue={pkg?.name_ar || ''} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={t(lang, 'Category', 'التصنيف')} required>
          <select name="category_id" className="input-field" defaultValue={pkg?.category_id || ''} required>
            <option value="">{t(lang, 'Select category', 'اختر تصنيف')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_en} / {c.name_ar}</option>
            ))}
          </select>
        </Field>
        <Field label={t(lang, 'Duration (minutes)', 'المدة (دقائق)')} required>
          <input name="duration" type="number" className="input-field" defaultValue={pkg?.duration_minutes || 60} min={15} required />
        </Field>
        <Field label={t(lang, 'Price (EGP)', 'السعر (جنيه)')} required>
          <input name="price" type="number" className="input-field" defaultValue={pkg?.price || ''} min={0} step={0.01} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t(lang, 'Description (English)', 'الوصف (إنجليزي)')}>
          <textarea name="description_en" className="input-field min-h-[80px]" defaultValue={pkg?.description_en || ''} rows={3} />
        </Field>
        <Field label={t(lang, 'Description (Arabic)', 'الوصف (عربي)')}>
          <textarea name="description_ar" className="input-field min-h-[80px]" defaultValue={pkg?.description_ar || ''} rows={3} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t(lang, 'Image', 'الصورة')}>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
              {uploading ? t(lang, 'Uploading...', 'جاري الرفع...') : t(lang, 'Choose Image', 'اختر صورة')}
            </button>
            {imageUrl && (
              <div className="size-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
            {imageUrl && <button type="button" onClick={() => setImageUrl('')} className="text-xs text-red-500 hover:underline">{t(lang, 'Remove', 'إزالة')}</button>}
          </div>
          <input name="image_url" type="hidden" value={imageUrl} />
        </Field>
        <Field label={t(lang, 'Video URL (optional)', 'رابط فيديو (اختياري)')}>
          <input type="text" className="input-field" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t(lang, 'Active', 'نشط')}>
          <select name="is_active" className="input-field" defaultValue={pkg?.is_active !== undefined ? String(pkg.is_active) : 'true'}>
            <option value="true">{t(lang, 'Active', 'نشط')}</option>
            <option value="false">{t(lang, 'Inactive', 'غير نشط')}</option>
          </select>
        </Field>
      </div>

      <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-teal-800 mb-3">{t(lang, 'Perfect For (Highlights)', 'مناسب لـ (أبرز النقاط)')}</h3>
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <input key={i} type="text" className="input-field text-sm" value={h} onChange={e => { const c = [...highlights]; c[i] = e.target.value; setHighlights(c) }} placeholder={`${t(lang, 'Point', 'نقطة')} ${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-3">{t(lang, 'Good to Know', 'معلومات مفيدة')}</h3>
        <div className="space-y-2">
          {goodToKnow.map((g, i) => (
            <input key={i} type="text" className="input-field text-sm" value={g} onChange={e => { const c = [...goodToKnow]; c[i] = e.target.value; setGoodToKnow(c) }} placeholder={`${t(lang, 'Point', 'نقطة')} ${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-emerald-800 mb-3">{t(lang, 'What&apos;s Included', 'ما يشمل')}</h3>
        <div className="space-y-2">
          {whatsIncluded.map((w, i) => (
            <input key={i} type="text" className="input-field text-sm" value={w} onChange={e => { const c = [...whatsIncluded]; c[i] = e.target.value; setWhatsIncluded(c) }} placeholder={`${t(lang, 'Item', 'عنصر')} ${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-blue-800">{t(lang, 'FAQs', 'الأسئلة الشائعة')}</h3>
          <button type="button" onClick={addFaq} className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg hover:bg-blue-200 transition">{t(lang, '+ Add FAQ', '+ إضافة سؤال')}</button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-blue-100 relative">
              {faqs.length > 1 && (
                <button type="button" onClick={() => removeFaq(i)} className="absolute -top-2 -right-2 size-5 bg-red-400 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500">✕</button>
              )}
              <input type="text" className="input-field text-sm mb-2" value={faq.q} onChange={e => updateFaq(i, 'q', e.target.value)} placeholder={t(lang, 'Question', 'السؤال')} />
              <textarea className="input-field text-sm min-h-[60px]" value={faq.a} onChange={e => updateFaq(i, 'a', e.target.value)} placeholder={t(lang, 'Answer', 'الإجابة')} rows={2} />
            </div>
          ))}
        </div>
      </div>

      <input name="video_url" type="hidden" value={videoUrl} />

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? t(lang, 'Saving...', 'جارٍ الحفظ...') : isEdit ? t(lang, 'Update Package', 'تحديث الباقة') : t(lang, 'Create Package', 'إنشاء باقة')}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/packages')} className="btn-secondary">
          {t(lang, 'Cancel', 'إلغاء')}
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
