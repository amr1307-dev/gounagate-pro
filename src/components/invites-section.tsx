'use client'

import { useEffect, useState } from 'react'

type Invite = {
  id: string
  slug: string
  description: string
  max_uses: number
  use_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export function InvitesSection({ businessName }: { businessName: string }) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [desc, setDesc] = useState('')
  const [maxUses, setMaxUses] = useState(0)
  const [creating, setCreating] = useState(false)

  const loadInvites = async () => {
    const res = await fetch('/api/invite')
    const data = await res.json()
    setInvites(data || [])
    setLoading(false)
  }

  useEffect(() => { loadInvites() }, [])

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    await fetch('/api/invite', {
      method: 'POST',
      body: JSON.stringify({ description: desc, max_uses: maxUses }),
    })
    setDesc('')
    setMaxUses(0)
    setCreating(false)
    loadInvites()
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`)
  }

  return (
    <div className="glass p-6 space-y-6">
      <h3 className="font-semibold text-slate-900">🔗 Self-Registration Links</h3>
      <p className="text-sm text-slate-500">
        Create invite links for guests to register themselves. Share the link via WhatsApp.
      </p>

      <form onSubmit={createInvite} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="e.g. Friday VIP Dinner"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          type="number"
          className="input-field w-28"
          placeholder="Max uses"
          value={maxUses || ''}
          onChange={(e) => setMaxUses(parseInt(e.target.value) || 0)}
          min={0}
        />
        <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap">
          {creating ? 'Creating...' : '+ Create Link'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-4 text-slate-400 text-sm">Loading invites...</div>
      ) : invites.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No invite links yet. Create your first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-slate-800 truncate">
                  {inv.description || 'No description'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  <span className={inv.is_active ? 'text-emerald-600' : 'text-red-500'}>
                    {inv.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {' · '}{inv.use_count}/{inv.max_uses > 0 ? inv.max_uses : '∞'} uses
                  {inv.expires_at && ` · Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                </div>
              </div>
              <button
                onClick={() => copyLink(inv.slug)}
                className="btn-secondary text-xs py-1.5 px-3"
                title="Copy invite link"
              >
                Copy Link
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
