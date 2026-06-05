-- Drop ALL existing policies on bookings
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'bookings' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on bookings', pol.policyname);
  end loop;
end $$;

-- Temporarily disable RLS to verify the root cause
alter table bookings disable row level security;

-- Re-enable RLS after clean slate
alter table bookings enable row level security;

-- Create ONLY the policies we need
create policy "Public can insert bookings"
  on bookings for insert with check (true);

-- Verify the policy was created
select count(*) as policy_count from pg_policies where tablename = 'bookings' and schemaname = 'public' and policyname = 'Public can insert bookings';

create policy "Admin can read all bookings"
  on bookings for select
  using (auth.role() = 'authenticated');

create policy "Admin can update bookings"
  on bookings for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete bookings"
  on bookings for delete
  using (auth.role() = 'authenticated');