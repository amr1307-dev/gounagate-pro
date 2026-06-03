'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: businessName },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed')

      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { error: bizError } = await supabase.from('businesses').insert({
        name: businessName,
        slug,
        primary_color: '#0A6E74',
        whatsapp_owner: '201028803080',
      })

      if (bizError) throw bizError

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', slug)
        .single()

      await supabase.from('profiles').insert({
        id: authData.user.id,
        business_id: biz?.id,
        role: 'owner',
        full_name: businessName,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="glass p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚀</div>
          <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-slate-500 text-sm mt-1">Set up your business in under 2 minutes</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Business Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Marina Cafe"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500 mb-1.5 block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#0A6E74] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
