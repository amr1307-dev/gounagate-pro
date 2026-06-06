'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Package = {
  id: string
  name_en: string
  name_ar: string
  price: number
  duration_minutes: number
  image_url: string | null
  is_active: boolean
  categories: { name_en: string; name_ar: string } | null
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/packages')
      .then(r => r.json())
      .then(data => setPackages(data || []))
      .finally(() => setLoading(false))
  }, [])

  async function deletePkg(id: string) {
    if (!confirm('Delete this package?')) return
    setDeleting(id)
    const r = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE' })
    if (r.ok) setPackages(packages.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Packages</h1>
          <p className="text-sm text-slate-400 mt-0.5">{packages.length} total</p>
        </div>
        <Link
          href="/dashboard/packages/new"
          className="bg-[#0A6E74] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#065256] transition flex items-center gap-1.5"
        >
          + New Package
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse flex gap-4">
              <div className="size-20 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium">No packages yet</p>
          <Link href="/dashboard/packages/new" className="text-[#0A6E74] text-sm mt-1 inline-block hover:underline">
            Create your first package
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-100 hover:shadow-sm transition">
              <div className="size-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                {pkg.image_url ? (
                  <img src={pkg.image_url} alt={pkg.name_en} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-slate-300">📷</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{pkg.name_en}</h3>
                  {!pkg.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{pkg.categories?.name_en} · {pkg.duration_minutes} min</p>
                <p className="text-sm font-bold text-[#D4A843] mt-1">{pkg.price.toLocaleString('en-EG')} EGP</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/dashboard/packages/${pkg.id}`}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deletePkg(pkg.id)}
                  disabled={deleting === pkg.id}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                >
                  {deleting === pkg.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
