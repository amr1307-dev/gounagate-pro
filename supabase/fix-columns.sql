-- Migration: Fix bookings table columns for Paradise World
-- The old table had GounaGate columns (guests, car_plate, business_id)

-- Drop old policies that depend on business_id
drop policy if exists "Business members can read bookings" on bookings;
drop policy if exists "Business members can insert bookings" on bookings;
drop policy if exists "Business members can update bookings" on bookings;

-- Drop old columns that don't belong
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'guests') then
    alter table bookings drop column guests;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'car_plate') then
    alter table bookings drop column car_plate;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'business_id') then
    alter table bookings drop column business_id;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'guest_count') then
    alter table bookings drop column guest_count;
  end if;
end $$;

-- Add new columns if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'package_id') then
    alter table bookings add column package_id uuid references packages;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'branch_id') then
    alter table bookings add column branch_id uuid references branches;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'total_price') then
    alter table bookings add column total_price decimal(10,2) default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'guest_name') then
    alter table bookings add column guest_name text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'guest_phone') then
    alter table bookings add column guest_phone text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'guest_email') then
    alter table bookings add column guest_email text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'booking_date') then
    alter table bookings add column booking_date date not null default current_date;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'booking_time') then
    alter table bookings add column booking_time time not null default current_time;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'hash') then
    alter table bookings add column hash text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'booking_ref') then
    alter table bookings add column booking_ref text unique;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'special_requests') then
    alter table bookings add column special_requests text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'completed_at') then
    alter table bookings add column completed_at timestamptz;
  end if;
end $$;

-- Fix status check constraint
do $$
begin
  alter table bookings drop constraint if exists bookings_status_check;
  alter table bookings add constraint bookings_status_check check (status in ('pending','confirmed','completed','cancelled'));
exception when others then null;
end $$;

-- Drop ALL existing policies on bookings to ensure clean slate
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'bookings' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on bookings', pol.policyname);
  end loop;
end $$;

-- Recreate only the policies we need
create policy "Public can insert bookings"
  on bookings for insert with check (true);

create policy "Admin can read all bookings"
  on bookings for select
  using (auth.role() = 'authenticated');

create policy "Admin can update bookings"
  on bookings for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete bookings"
  on bookings for delete
  using (auth.role() = 'authenticated');
