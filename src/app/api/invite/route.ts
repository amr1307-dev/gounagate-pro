import { createServerSupabase, getUserProfile } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const profile = await getUserProfile()
  if (!profile?.business_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerSupabase()
  const body = await request.json()

  const slug = `inv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`

  const { data, error } = await supabase
    .from('invites')
    .insert({
      business_id: profile.business_id,
      slug,
      description: body.description || '',
      max_uses: body.max_uses || 0,
      expires_at: body.expires_at || null,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data, error } = await supabase.rpc('increment_invite_use', { p_slug: slug })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const profile = await getUserProfile()

  const supabase = await createServerSupabase()

  if (slug) {
    const { data } = await supabase
      .from('invites')
      .select('*, businesses(name, slug)')
      .eq('slug', slug)
      .single()
    return NextResponse.json(data)
  }

  if (!profile?.business_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('invites')
    .select('*')
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}
