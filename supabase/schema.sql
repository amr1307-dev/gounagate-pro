-- GounaGate Pro Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Businesses (multi-tenant)
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#0A6E74',
  whatsapp_owner text default '201028803080',
  max_capacity int default 100,
  working_hours jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- User profiles (linked to Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  business_id uuid references businesses on delete cascade,
  role text not null default 'owner' check (role in ('owner','receptionist','gatekeeper','viewer')),
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses not null,
  booking_ref text unique not null,
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  booking_date date not null,
  booking_time time not null,
  guests int not null check (guests between 1 and 50),
  special_requests text default '',
  hash text not null,
  status text not null default 'confirmed' check (status in ('pending','confirmed','checked-in','cancelled','no-show')),
  checked_in_at timestamptz,
  checked_in_by uuid references profiles,
  created_at timestamptz default now()
);

-- QR Scan audit log
create table if not exists qr_scans (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings on delete cascade,
  scanned_by uuid references profiles,
  action text not null check (action in ('verify','check-in','reject')),
  details jsonb default '{}'::jsonb,
  scanned_at timestamptz default now()
);

-- Activity log
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses not null,
  user_id uuid references profiles,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_bookings_business_date on bookings(business_id, booking_date);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_ref on bookings(booking_ref);
create index if not exists idx_bookings_phone on bookings(guest_phone);
create index if not exists idx_profiles_business on profiles(business_id);
create index if not exists idx_qr_scans_booking on qr_scans(booking_id);

-- Enable RLS
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table qr_scans enable row level security;
alter table activity_logs enable row level security;

-- RLS Policies

-- Businesses: owners can read their own
create policy "Users can read own business"
  on businesses for select
  using (
    id in (
      select business_id from profiles where id = auth.uid()
    )
  );

-- Businesses: public can read active
create policy "Public can read active businesses"
  on businesses for select
  using (is_active = true);

-- Profiles: users can read own
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

-- Bookings: business members can read
create policy "Business members can read bookings"
  on bookings for select
  using (
    business_id in (
      select business_id from profiles where id = auth.uid()
    )
  );

-- Bookings: business members can insert
create policy "Business members can insert bookings"
  on bookings for insert
  with check (
    business_id in (
      select business_id from profiles where id = auth.uid()
    )
  );

-- Bookings: public can insert (for booking form)
create policy "Public can insert bookings"
  on bookings for insert
  with check (true);

-- Bookings: business members can update
create policy "Business members can update bookings"
  on bookings for update
  using (
    business_id in (
      select business_id from profiles where id = auth.uid()
    )
  );

-- Functions

create or replace function verify_booking(p_booking_id uuid, p_hash text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_booking bookings;
begin
  select * into v_booking
  from bookings
  where id = p_booking_id and hash = p_hash;

  if not found then
    return jsonb_build_object('valid', false, 'message', 'Booking not found or hash mismatch');
  end if;

  if v_booking.status = 'cancelled' then
    return jsonb_build_object('valid', false, 'message', 'Booking was cancelled');
  end if;

  if v_booking.status = 'checked-in' then
    return jsonb_build_object(
      'valid', true,
      'message', 'Already checked in',
      'booking', row_to_json(v_booking)::jsonb
    );
  end if;

  return jsonb_build_object(
    'valid', true,
    'message', 'Booking verified',
    'booking', row_to_json(v_booking)::jsonb
  );
end;
$$;

create or replace function check_in_booking(p_booking_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_booking bookings;
begin
  update bookings
  set status = 'checked-in',
      checked_in_at = now(),
      checked_in_by = p_user_id
  where id = p_booking_id
    and status = 'confirmed'
  returning * into v_booking;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Booking not found or already checked in');
  end if;

  insert into qr_scans (booking_id, scanned_by, action)
  values (p_booking_id, p_user_id, 'check-in');

  return jsonb_build_object('success', true, 'booking', row_to_json(v_booking)::jsonb);
end;
$$;
