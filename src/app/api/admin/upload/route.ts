import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, AVIF allowed' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `packages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const buffer = await file.arrayBuffer()

    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from('package-images')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/package-images/${filename}`
    return NextResponse.json({ success: true, url, path: filename }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
