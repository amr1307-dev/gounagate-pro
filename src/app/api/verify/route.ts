import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { generateTimeBasedHash } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { bookingId, hash, dynamicHash } = await req.json()

  if (!bookingId || !hash) {
    return NextResponse.json({ valid: false, message: 'Missing booking ID or hash' }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  if (dynamicHash) {
    const expectedHash = generateTimeBasedHash(bookingId, hash)
    const currentWindow = Math.floor(Date.now() / 30000) * 30000
    const previousWindow = currentWindow - 30000
    const expectedPrevious = generateTimeBasedHash(bookingId, hash, previousWindow)

    if (dynamicHash !== expectedHash && dynamicHash !== expectedPrevious) {
      return NextResponse.json({ valid: false, message: 'QR code has expired — please ask the guest to refresh their QR' })
    }
  }

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
