'use client'
import { PackageForm } from '@/components/package-form'

export default function NewPackage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Package</h1>
      <PackageForm />
    </div>
  )
}
