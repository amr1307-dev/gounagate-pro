import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { bookingId, hash } = await req.json()

  if (!bookingId || !hash) {
    return NextResponse.json({ valid: false, message: 'Missing booking ID or hash' }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const { data, error } = await supabase.rpc('verify_booking', {
    p_booking_id: bookingId,
    p_hash: hash,
  })

  if (error) {
    return NextResponse.json({ valid: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const { data, error } = await supabase.rpc('check_in_booking', {
    p_booking_id: bookingId,
    p_user_id: user.id,
  })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
