import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase
        .from('packages')
        .select('*, categories(name_en, name_ar)')
        .eq('id', id)
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('packages')
      .select('*, categories(name_en, name_ar)')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    if (!body.name_en || !body.price) {
      return NextResponse.json({ error: 'name_en and price are required' }, { status: 400 })
    }

    const insertData: Record<string, any> = {
      category_id: body.category_id || null,
      name_en: body.name_en,
      name_ar: body.name_ar || body.name_en,
      description_en: body.description_en || '',
      description_ar: body.description_ar || '',
      price: body.price,
      duration_minutes: body.duration_minutes || 60,
      image_url: body.image_url || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
    }
    const jsonFields = ['highlights', 'good_to_know', 'whats_included', 'faqs']
    for (const f of jsonFields) {
      if (body[f]) insertData[f] = body[f]
    }
    if (body.video_url !== undefined) insertData.video_url = body.video_url

    const { data, error } = await supabase
      .from('packages')
      .insert(insertData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, package: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = createAdminClient()
    const updateData: Record<string, any> = {}

    const allowed = ['category_id', 'name_en', 'name_ar', 'description_en', 'description_ar', 'price', 'duration_minutes', 'image_url', 'is_active', 'highlights', 'good_to_know', 'whats_included', 'faqs', 'video_url']
    for (const key of allowed) {
      if (fields[key] !== undefined) updateData[key] = fields[key]
    }

    const { data, error } = await supabase
      .from('packages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    return NextResponse.json({ success: true, package: data })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('packages').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
