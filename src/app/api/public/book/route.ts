import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        id: body.id,
        booking_ref: body.booking_ref,
        package_id: body.package_id,
        branch_id: body.branch_id,
        guest_name: body.guest_name,
        guest_phone: body.guest_phone,
        guest_email: body.guest_email || null,
        booking_date: body.booking_date,
        booking_time: body.booking_time,
        total_price: body.total_price,
        special_requests: body.special_requests || null,
        hash: body.hash,
        status: body.status || 'confirmed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
