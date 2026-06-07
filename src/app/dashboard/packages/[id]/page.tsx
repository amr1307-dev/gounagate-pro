'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PackageForm } from '@/components/package-form'
import Link from 'next/link'
import { useDashboardLang, t } from '@/lib/dashboard-lang'

type Pkg = {
  id: string
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

export default function EditPackage() {
  const lang = useDashboardLang()
  const params = useParams()
  const [pkg, setPkg] = useState<Pkg | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/packages?id=${params.id}`)
      .then(r => r.json())
      .then(data => setPkg(data))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-slate-400">{t(lang, 'Loading...', 'جارٍ التحميل...')}</div>
  if (!pkg) return (
    <div className="text-center py-20 text-slate-400">
      <p>{t(lang, 'Package not found', 'الباقة غير موجودة')}</p>
      <Link href="/dashboard/packages" className="text-[#0A6E74] text-sm mt-2 inline-block hover:underline">
        ← {t(lang, 'Back to packages', 'رجوع إلى الباقات')}
      </Link>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/packages" className="text-slate-400 hover:text-slate-600 transition text-sm">← {t(lang, 'Back', 'رجوع')}</Link>
        <h1 className="text-2xl font-bold text-slate-900">{t(lang, 'Edit:', 'تعديل:')} {lang === 'ar' && pkg.name_ar ? pkg.name_ar : pkg.name_en}</h1>
      </div>
      <PackageForm pkg={pkg} />
    </div>
  )
}
