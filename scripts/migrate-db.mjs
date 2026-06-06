const SUPABASE_URL = 'https://andnjljpdfagluqjfroo.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZG5qbGpwZGZhZ2x1cWpmcm9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ5MTU0MCwiZXhwIjoyMDk2MDY3NTQwfQ.58WOGMWF6Q2cbigjqVJI-4C8_PDUezE6rSjL85Z-EXE'

const headers = { 'Authorization': 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json', 'apikey': SERVICE_KEY }

async function sql(query) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  })
  return { status: res.status, data: await res.text() }
}

async function main() {
  console.log('1. Adding discount_percent column...')
  const r1 = await sql("SELECT 1")
  console.log('   RPC check:', r1.status, r1.data.substring(0,100))

  console.log('2. Trying via /pg/...')
  const res = await fetch(SUPABASE_URL + '/pg/', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', 'Authorization': 'Bearer ' + SERVICE_KEY },
    body: 'ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0;'
  })
  console.log('   Status:', res.status, await res.text().catch(() => 'no body'))

  console.log('3. Checking if discount_percent exists...')
  const check = await fetch(SUPABASE_URL + '/rest/v1/packages?id=eq.3f466fc6-a3ee-4900-9df8-4df8b4095d82&select=discount_percent', {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY }
  })
  const checkData = await check.text()
  console.log('   Status:', check.status, 'Data:', checkData)
}

main()
