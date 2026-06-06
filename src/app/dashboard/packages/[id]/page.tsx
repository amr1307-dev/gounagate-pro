'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PackageForm } from '@/components/package-form'
import Link from 'next/link'

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
  const params = useParams()
  const [pkg, setPkg] = useState<Pkg | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/packages?id=${params.id}`)
      .then(r => r.json())
      .then(data => setPkg(data))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-slate-400">Loading...</div>
  if (!pkg) return (
    <div className="text-center py-20 text-slate-400">
      <p>Package not found</p>
      <Link href="/dashboard/packages" className="text-[#0A6E74] text-sm mt-2 inline-block hover:underline">
        ← Back to packages
      </Link>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/packages" className="text-slate-400 hover:text-slate-600 transition text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit: {pkg.name_en}</h1>
      </div>
      <PackageForm pkg={pkg} />
    </div>
  )
}
