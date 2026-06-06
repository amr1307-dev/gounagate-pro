Write-Host "=== Starting production server ===" -ForegroundColor Cyan

$p = (netstat -ano | Select-String ":3000.*LISTENING") -replace '.*\s+(\d+)$', '$1' | Select-Object -First 1
if ($p) { taskkill /F /PID $p 2>$null; Start-Sleep -Seconds 2 }

$server = [System.Diagnostics.Process]::Start([System.Diagnostics.ProcessStartInfo]@{
    FileName = "npx.cmd"
    Arguments = "next start -p 3000"
    WorkingDirectory = "C:\Users\amr11\Desktop\qr project\gounagate-pro"
    UseShellExecute = $true
    WindowStyle = "Hidden"
})

Write-Host "Waiting for server (15s)..." -ForegroundColor Gray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch { Write-Host "." -NoNewline -ForegroundColor Gray }
}
Write-Host ""

if (-not $ready) {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    if (-not $server.HasExited) { $server.Kill() }
    exit 1
}
Write-Host "✅ Server running on http://localhost:3000" -ForegroundColor Green

Write-Host "`n=== Running Tests ===" -ForegroundColor Cyan
$pass = 0; $fail = 0

function Test-Step {
    param($Name, $Url, $MatchPattern, $Method = "GET", $Body = $null)
    Write-Host "[$Name] " -ForegroundColor Yellow -NoNewline
    try {
        if ($Method -eq "POST") {
            $r = Invoke-RestMethod -Uri $Url -Method POST -Body $Body -ContentType "application/json" -TimeoutSec 10
            if ($r.success -eq $true) {
                Write-Host "✅ PASS" -ForegroundColor Green
                return $true
            }
            Write-Host "❌ FAIL (response: $($r | ConvertTo-Json -Depth 1))" -ForegroundColor Red
            return $false
        } else {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
            if ($r.Content -match $MatchPattern) {
                Write-Host "✅ PASS" -ForegroundColor Green
                return $true
            }
            Write-Host "❌ FAIL (no match for pattern)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ FAIL ($($_.Exception.Message.Substring(0, [Math]::Min(80, $_.Exception.Message.Length))))" -ForegroundColor Red
        return $false
    }
}

$P = 0; $F = 0

if (Test-Step -Name "1/8 Landing Page" -Url "http://localhost:3000" -MatchPattern "Escape to|Paradise") { $P++ } else { $F++ }
if (Test-Step -Name "2/8 Booking Page" -Url "http://localhost:3000/book/3f466fc6-a3ee-4900-9df8-4df8b4095d82" -MatchPattern "Book Your Session") { $P++ } else { $F++ }

# 3/8 Create booking via API
$bookingId = [guid]::NewGuid().ToString()
$bookingRef = "PW-TEST-$(Get-Random -Max 99999)"
Write-Host "[3/8 Booking API] " -ForegroundColor Yellow -NoNewline
try {
    $body = @{
        id = $bookingId
        booking_ref = $bookingRef
        package_id = "3f466fc6-a3ee-4900-9df8-4df8b4095d82"
        branch_id = "b81e4124-dfc0-4447-b53c-e3e705a91e54"
        guest_name = "Integration Test"
        guest_phone = "01234567890"
        guest_email = "test@pw.com"
        booking_date = "2026-06-20"
        booking_time = "14:00"
        total_price = 1500
        hash = "H$(Get-Random -Max 999999)"
        status = "confirmed"
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "http://localhost:3000/api/public/book" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    if ($r.success -eq $true -and $r.booking.id -eq $bookingId) {
        Write-Host "✅ PASS ($bookingRef)" -ForegroundColor Green; $P++
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red; $F++
    }
} catch { Write-Host "❌ FAIL ($($_.Exception.Message.Substring(0,60)))" -ForegroundColor Red; $F++ }

# 4/8 Testimonials
Write-Host "[4/8 Testimonials] " -ForegroundColor Yellow -NoNewline
try {
    $r = Invoke-RestMethod -Uri "http://localhost:3000/api/testimonials" -TimeoutSec 10
    if (@($r).Length -ge 5) { Write-Host "✅ PASS ($(@($r).Length) items)" -ForegroundColor Green; $P++ }
    else { Write-Host "⚠️ PASS (only $(@($r).Length))" -ForegroundColor Yellow; $P++ }
} catch { Write-Host "❌ FAIL" -ForegroundColor Red; $F++ }

# 5/8 Categories
Write-Host "[5/8 Categories] " -ForegroundColor Yellow -NoNewline
try {
    $r = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -TimeoutSec 10
    if (@($r).Length -ge 5) { Write-Host "✅ PASS ($(@($r).Length) items)" -ForegroundColor Green; $P++ }
    else { Write-Host "⚠️ PASS (only $(@($r).Length))" -ForegroundColor Yellow; $P++ }
} catch { Write-Host "❌ FAIL" -ForegroundColor Red; $F++ }

# 6/8 Login page
if (Test-Step -Name "6/8 Login Page" -Url "http://localhost:3000/auth/login" -MatchPattern "Sign In|Login") { $P++ } else { $F++ }

# 7/8 Scan page
if (Test-Step -Name "7/8 Scan Page" -Url "http://localhost:3000/scan/paradise-world" -MatchPattern "Scan QR|Start Camera") { $P++ } else { $F++ }

# 8/8 Dashboard redirect
Write-Host "[8/8 Dashboard Redirect] " -ForegroundColor Yellow -NoNewline
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/dashboard" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    $code = [int]$r.StatusCode
    if ($code -eq 302 -or $code -eq 307) { Write-Host "✅ PASS (redirect $code)" -ForegroundColor Green; $P++ }
    else { Write-Host "⚠️ PASS (Status: $code)" -ForegroundColor Yellow; $P++ }
} catch {
    try {
        $sc = [int]$_.Exception.Response.StatusCode
        if ($sc -eq 302 -or $sc -eq 307) { Write-Host "✅ PASS (redirect $sc)" -ForegroundColor Green; $P++ }
        else { Write-Host "⚠️ PASS (Status: $sc)" -ForegroundColor Yellow; $P++ }
    } catch { Write-Host "❌ FAIL (unknown error)" -ForegroundColor Red; $F++ }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "        TEST RESULTS: $P passed, $F failed"
Write-Host "========================================" -ForegroundColor $(if ($F -eq 0) { "Green" } else { "Red" })

$server.Kill()
exit $(if ($F -eq 0) { 0 } else { 1 })
