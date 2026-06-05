-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify policy exists
select schemaname, tablename, policyname, permissive, cmd, with_check
from pg_policies
where tablename = 'bookings'
order by policyname;