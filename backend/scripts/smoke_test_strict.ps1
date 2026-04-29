$ErrorActionPreference = 'Stop'

Write-Output "== HEALTH =="
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health' -Headers @{ Accept = 'application/json' } | ConvertTo-Json -Depth 5

Write-Output "== LOGIN =="
$loginBody = @{ login = 'customer'; password = 'customer123' }
$loginResp = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auth/login' -Method Post -Body ($loginBody | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Accept = 'application/json' }
$loginResp | ConvertTo-Json -Depth 5

$token = $loginResp.token
Write-Output "== ME =="
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auth/me' -Headers @{ Authorization = "Bearer $token"; Accept = 'application/json' } | ConvertTo-Json -Depth 5

Write-Output "== CREATE REQUEST =="
$reqBody = @{ request_type='grooming'; customer_name='Automated Tester'; pet_name='Testy'; service_name='Full Grooming'; request_date=(Get-Date).ToString('yyyy-MM-dd'); request_time='10:00'; notes='Created by smoke test' }
$created = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/customer/requests' -Method Post -Body ($reqBody | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token"; Accept = 'application/json' }
$created | ConvertTo-Json -Depth 5

Write-Output "== DONE =="