-- Paradise World Hurghada Database Schema

create extension if not exists "uuid-ossp";

-- Categories (Massage, Spa, Salt Cave, Beauty, Sauna)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null,
  slug text unique not null,
  icon text default '💆',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Packages / Services
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories on delete cascade,
  name_en text not null,
  name_ar text not null,
  description_en text,
  description_ar text,
  price decimal(10,2) not null,
  duration_minutes int not null,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Branches
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null,
  address text default '',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment_en text not null,
  comment_ar text default '',
  client_country text default '',
  avatar_url text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- User profiles (single admin)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Bookings (simplified for spa)
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text unique not null,
  package_id uuid references packages,
  branch_id uuid references branches,
  guest_name text not null,
  guest_phone text not null,
  guest_email text default '',
  booking_date date not null,
  booking_time time not null,
  total_price decimal(10,2) default 0,
  special_requests text default '',
  hash text not null,
  status text not null default 'confirmed' check (status in ('pending','confirmed','completed','cancelled')),
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- QR Scan audit log
create table if not exists qr_scans (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings on delete cascade,
  action text not null check (action in ('verify','check-in','reject')),
  details jsonb default '{}'::jsonb,
  scanned_at timestamptz default now()
);

-- Activity log
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_bookings_date on bookings(booking_date);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_ref on bookings(booking_ref);
create index if not exists idx_bookings_phone on bookings(guest_phone);
create index if not exists idx_packages_category on packages(category_id);
create index if not exists idx_qr_scans_booking on qr_scans(booking_id);

-- Enable RLS
alter table categories enable row level security;
alter table packages enable row level security;
alter table branches enable row level security;
alter table testimonials enable row level security;
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table qr_scans enable row level security;
alter table activity_logs enable row level security;

-- Drop existing policies for clean re-runs
drop policy if exists "Public can read categories" on categories;
drop policy if exists "Public can read active packages" on packages;
drop policy if exists "Public can read branches" on branches;
drop policy if exists "Public can read visible testimonials" on testimonials;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Public can insert bookings" on bookings;
drop policy if exists "Admin can read all bookings" on bookings;
drop policy if exists "Admin can update bookings" on bookings;
drop policy if exists "Admin can delete bookings" on bookings;
drop policy if exists "Admin can read activity logs" on activity_logs;
drop policy if exists "Admin can insert activity logs" on activity_logs;
drop policy if exists "Admin can read qr_scans" on qr_scans;
drop policy if exists "Admin can insert qr_scans" on qr_scans;

-- RLS: Public read for catalog data
create policy "Public can read categories"
  on categories for select using (true);

create policy "Public can read active packages"
  on packages for select using (is_active = true);

create policy "Public can read branches"
  on branches for select using (is_active = true);

create policy "Public can read visible testimonials"
  on testimonials for select using (is_visible = true);

-- RLS: Profiles
create policy "Users can read own profile"
  on profiles for select using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert with check (id = auth.uid());

-- RLS: Bookings
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

-- RLS: Activity logs
create policy "Admin can read activity logs"
  on activity_logs for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert activity logs"
  on activity_logs for insert
  with check (auth.role() = 'authenticated');

-- RLS: QR scans
create policy "Admin can read qr_scans"
  on qr_scans for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert qr_scans"
  on qr_scans for insert
  with check (auth.role() = 'authenticated');

-- Verify booking function
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

  if v_booking.status = 'completed' then
    return jsonb_build_object('valid', true, 'message', 'Already completed');
  end if;

  return jsonb_build_object('valid', true, 'message', 'Booking verified');
end;
$$;

-- Check-in booking function
create or replace function check_in_booking(p_booking_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_booking bookings;
begin
  update bookings
  set status = 'completed',
      completed_at = now()
  where id = p_booking_id
    and status = 'confirmed'
  returning * into v_booking;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Booking not found or already completed');
  end if;

  insert into qr_scans (booking_id, action)
  values (p_booking_id, 'check-in');

  return jsonb_build_object('success', true);
end;
$$;

-- Seed data
insert into branches (name_en, name_ar, address) values
  ('Corniche', 'الكورنيش', 'Corniche Road, Hurghada, Egypt'),
  ('Florenza Khamsin', 'فلورنزا خماسين', 'Florenza Khamsin Resort, Hurghada, Egypt')
on conflict do nothing;

insert into categories (name_en, name_ar, slug, icon, sort_order) values
  ('Spa', 'سبا', 'spa', '💆', 1),
  ('Massage', 'مساج', 'massage', '💪', 2),
  ('Salt Cave', 'كهف الملح', 'salt-cave', '🧂', 3),
  ('Beauty', 'تجميل', 'beauty', '💄', 4),
  ('Sauna', 'ساونا', 'sauna', '🧖', 5)
on conflict do nothing;

insert into packages (category_id, name_en, name_ar, description_en, description_ar, price, duration_minutes) values
  ((select id from categories where slug = 'spa'), 'Royal Spa Package', 'الباقة الملكية للسبا', 'Full body treatment with essential oils, steam room, and relaxation area', 'علاج كامل للجسم بالزيوت العطرية مع غرفة بخار ومنطقة استرخاء', 1500, 120),
  ((select id from categories where slug = 'spa'), 'Couples Spa Retreat', 'سبا للأزواج', 'Side-by-side massage and spa treatment for two', 'مساج وعلاج سبا معاً لشخصين', 2500, 90),
  ((select id from categories where slug = 'massage'), 'Swedish Massage', 'مساج سويدي', 'Classic relaxation massage with long flowing strokes', 'مساج استرخاء كلاسيكي بحركات طويلة', 600, 60),
  ((select id from categories where slug = 'massage'), 'Hot Stone Massage', 'مساج بالأحجار الساخنة', 'Deep tissue massage with heated basalt stones', 'مساج عميق للأنسجة بأحجار البازلت الساخنة', 800, 75),
  ((select id from categories where slug = 'massage'), 'Thai Massage', 'مساج تايلندي', 'Traditional Thai yoga massage with stretching', 'مساج يوجا تايلندي تقليدي مع تمارين شد', 700, 60),
  ((select id from categories where slug = 'salt-cave'), 'Salt Cave Session', 'جلسة كهف الملح', 'Halotherapy session in our natural salt cave', 'جلسة علاج بالملح في كهف الملح الطبيعي', 400, 45),
  ((select id from categories where slug = 'salt-cave'), 'Salt Cave + Massage', 'كهف الملح + مساج', 'Salt cave therapy followed by a full body massage', 'جلسة كهف ملح يتبعها مساج كامل للجسم', 900, 90),
  ((select id from categories where slug = 'beauty'), 'Facial Treatment', 'علاج بشرة', 'Deep cleansing facial with natural masks', 'تنظيف عميق للبشرة بأقنعة طبيعية', 500, 45),
  ((select id from categories where slug = 'beauty'), 'Manicure & Pedicure', 'مانيكير وباديكير', 'Complete nail care and polish', 'عناية كاملة بالأظافر والطلاء', 450, 60),
  ((select id from categories where slug = 'sauna'), 'Sauna Session', 'جلسة ساونا', 'Traditional Finnish sauna experience', 'تجربة ساونا فنلندية تقليدية', 350, 30),
  ((select id from categories where slug = 'sauna'), 'Steam Room', 'غرفة بخار', 'Aromatic steam bath for detoxification', 'حمام بخار عطري لإزالة السموم', 300, 30)
on conflict do nothing;

insert into testimonials (client_name, rating, comment_en, comment_ar, client_country) values
  ('Sarah Johnson', 5, 'The best spa experience in Hurghada! The salt cave is incredible.', 'أفضل تجربة سبا في الغردقة! كهف الملح رائع.', 'UK'),
  ('Ahmed Mahmoud', 5, 'Professional staff, clean facilities, amazing massage. Will definitely come back.', 'طاقم محترف، مرافق نظيفة، مساج رائع. سأعود بالتأكيد.', 'Egypt'),
  ('Elena Petrova', 4, 'Wonderful couple spa treatment. Very romantic and relaxing.', 'علاج سبا رائع للأزواج. رومانسي ومريح جداً.', 'Russia'),
  ('Michael Schmidt', 5, 'The hot stone massage was life-changing. Highly recommended!', 'مساج الأحجار الساخنة غير حياتي. أوصي به بشدة!', 'Germany'),
  ('Nour Hassan', 5, 'Best facial I have ever had. My skin feels amazing!', 'أفضل عناية بشرة حصلت عليها. بشرتي رائعة!', 'Egypt')
on conflict do nothing;
