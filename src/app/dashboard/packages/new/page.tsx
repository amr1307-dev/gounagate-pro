'use client'
import { PackageForm } from '@/components/package-form'
import { useDashboardLang, t } from '@/lib/dashboard-lang'

export default function NewPackage() {
  const lang = useDashboardLang()
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t(lang, 'New Package', 'باقة جديدة')}</h1>
      <PackageForm />
    </div>
  )
}
