-- Seed data for GounaGate Demo

insert into businesses (name, slug, primary_color, whatsapp_owner, max_capacity, working_hours)
values
  ('GounaGate Demo', 'demo', '#0A6E74', '201028803080', 100,
   '{"mon":{"open":"09:00","close":"23:00"},"tue":{"open":"09:00","close":"23:00"},"wed":{"open":"09:00","close":"23:00"},"thu":{"open":"09:00","close":"00:00"},"fri":{"open":"09:00","close":"00:00"},"sat":{"open":"10:00","close":"23:00"},"sun":{"open":"10:00","close":"22:00"}}'::jsonb),
  ('Marina Cafe', 'marina-cafe', '#0D9488', '201234567890', 60,
   '{"mon":{"open":"08:00","close":"22:00"},"tue":{"open":"08:00","close":"22:00"},"wed":{"open":"08:00","close":"22:00"},"thu":{"open":"08:00","close":"23:00"},"fri":{"open":"08:00","close":"23:00"},"sat":{"open":"09:00","close":"22:00"},"sun":{"open":"09:00","close":"22:00"}}'::jsonb),
  ('Beach Club', 'beach-club', '#2563EB', '201098765432', 200,
   '{"mon":{"open":"10:00","close":"20:00"},"tue":{"open":"10:00","close":"20:00"},"wed":{"open":"10:00","close":"20:00"},"thu":{"open":"10:00","close":"22:00"},"fri":{"open":"10:00","close":"22:00"},"sat":{"open":"09:00","close":"22:00"},"sun":{"open":"09:00","close":"20:00"}}'::jsonb);

-- Generate sample bookings (some today, some future)
do $$
declare
  demo_id uuid;
  i int;
  names text[] := array['Omar Hassan', 'Nour Ali', 'Karim Salah', 'Lina Youssef', 'Ahmed Reda', 'Mariam Khaled', 'Youssef Samir', 'Farah Mostafa'];
  phones text[] := array['01234567890', '01123456789', '01098765432', '01567890123', '01298765432', '01012345678', '01198765432', '01512345678'];
  statuses text[] := array['confirmed', 'confirmed', 'checked-in', 'checked-in', 'cancelled', 'confirmed', 'pending', 'confirmed'];
  today date := current_date;
begin
  select id into demo_id from businesses where slug = 'demo';

  for i in 1..8 loop
    insert into bookings (business_id, booking_ref, guest_name, guest_phone, guest_email,
      booking_date, booking_time, guests, special_requests, hash, status)
    values (
      demo_id,
      'GG-DEMO-' || lpad(i::text, 3, '0'),
      names[i],
      phones[i],
      lower(replace(names[i], ' ', '.')) || '@email.com',
      case when i <= 4 then today else today + (i - 3) end,
      ((9 + i)::text || ':00')::time,
      1 + (i % 4),
      case when i % 3 = 0 then 'Allergic to nuts' else '' end,
      'H' || upper(encode(gen_random_bytes(4), 'hex')),
      statuses[i]
    );
  end loop;
end;
$$;

-- Update checked-in bookings with timestamps
update bookings
set checked_in_at = now() - interval '2 hours'
where status = 'checked-in'
  and booking_date = current_date;
