$ErrorActionPreference = 'Stop'

# Login to get token
$loginBody = @{ login = 'customer'; password = 'customer123' }
$loginResp = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auth/login' -Method Post -Body ($loginBody | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Accept = 'application/json' }
$token = $loginResp.token
Write-Output "Token: $($token.Substring(0,20))..."

# Prepare request body
$reqBody = @{ request_type='grooming'; customer_name='Automated Tester'; pet_name='Testy'; service_name='Full Grooming'; request_date=(Get-Date).ToString('yyyy-MM-dd'); request_time='10:00'; notes='Created by smoke test' }

try {
    $created = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/customer/requests' -Method Post -Body ($reqBody | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token"; Accept = 'application/json' }
    Write-Output "SUCCESS RESPONSE:"
    $created | ConvertTo-Json -Depth 5
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $resp = $_.Exception.Response
        try {
            $stream = $resp.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            Write-Output "RESPONSE BODY:"
            Write-Output $body
        } catch {
            Write-Output "Failed to read response body: $($_.Exception.Message)"
        }
    }
}
