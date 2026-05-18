$ErrorActionPreference = 'Stop'

$base = 'http://127.0.0.1:8000/api'
$accounts = @{
  customer = 'customer@example.com'
  receptionist = 'receptionist@example.com'
  cashier = 'cashier@example.com'
  inventory = 'inventory@example.com'
  veterinary = 'vet@example.com'
  manager = 'manager@example.com'
  admin = 'admin@example.com'
}
$tokens = @{}
$results = New-Object System.Collections.Generic.List[object]
$candidatePasswords = @('Password123!', 'password123', 'password')

function Convert-ToJsonBody($obj) {
  return $obj | ConvertTo-Json -Depth 12
}

function Invoke-AuditRequest($name, $method, $url, $token = $null, $body = $null, $form = $null) {
  try {
    $headers = @{}
    if ($token) {
      $headers.Authorization = "Bearer $token"
    }

    $params = @{
      Method = $method
      Uri = $url
      Headers = $headers
      TimeoutSec = 30
    }

    if ($body) {
      $params.ContentType = 'application/json'
      $params.Body = Convert-ToJsonBody $body
    }

    if ($form) {
      $params.Form = $form
    }

    $response = Invoke-RestMethod @params

    return [pscustomobject]@{
      Name = $name
      Ok = $true
      Status = 200
      Message = if ($response.message) { $response.message } else { 'OK' }
      Data = $response
    }
  } catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    return [pscustomobject]@{
      Name = $name
      Ok = $false
      Status = $status
      Message = $_.Exception.Message
      Data = $null
    }
  }
}

foreach ($role in $accounts.Keys) {
  $login = $null
  foreach ($candidatePassword in $candidatePasswords) {
    $attempt = Invoke-AuditRequest "login:${role}" 'POST' "$base/auth/login" $null @{
      login = $accounts[$role]
      password = $candidatePassword
    }

    if ($attempt.Ok) {
      $login = $attempt
      break
    }

    $login = $attempt
  }

  $results.Add($login)

  if ($login.Ok) {
    $tokens[$role] = $login.Data.token
    $results.Add((Invoke-AuditRequest "me:${role}" 'GET' "$base/auth/me" $tokens[$role]))
  }
}

$endpointByRole = @{
  customer = @('/customer/my-requests', '/customer/payments/history', '/customer/pets')
  receptionist = @('/receptionist/requests/pending', '/receptionist/dashboard')
  cashier = @('/cashier/payment-requests', '/cashier/pos/products')
  inventory = @('/inventory/items', '/inventory/low-stock')
  veterinary = @('/veterinary/appointments', '/veterinary/dashboard')
  manager = @('/manager/reports/summary', '/manager/reports/live')
  admin = @('/admin/users', '/admin/chatbot/logs')
}

foreach ($role in $endpointByRole.Keys) {
  foreach ($path in $endpointByRole[$role]) {
    $results.Add((Invoke-AuditRequest "endpoint:${role}:${path}" 'GET' "$base$path" $tokens[$role]))
  }
}

foreach ($role in @('customer', 'cashier', 'inventory', 'veterinary', 'receptionist')) {
  $results.Add((Invoke-AuditRequest "blocked:${role}:admin-users" 'GET' "$base/admin/users" $tokens[$role]))
}

$chatPrompts = @{
  customer = 'status ng request ko'
  receptionist = 'pending approvals'
  cashier = 'may pending payments ba'
  inventory = 'low stock'
  veterinary = 'scheduled appointments'
  manager = 'system summary'
  admin = 'reports'
}

foreach ($role in $chatPrompts.Keys) {
  $results.Add((Invoke-AuditRequest "chatbot:${role}" 'POST' "$base/chatbot/message" $tokens[$role] @{
    message = $chatPrompts[$role]
    context = @{}
  }))
}

$customerPets = Invoke-AuditRequest 'workflow:customer-pets' 'GET' "$base/customer/pets" $tokens.customer
$pet = $null
if ($customerPets.Ok) {
  $raw = $customerPets.Data
  $list = if ($raw -is [array]) { $raw } elseif ($raw.data) { $raw.data } elseif ($raw.pets) { $raw.pets } else { @() }
  if ($list.Count -gt 0) {
    $pet = $list[0]
  }
}

$futureDate = (Get-Date).AddDays(3).ToString('yyyy-MM-dd')
$stamp = Get-Date -Format 'HHmmss'
$payload = @{
  customer_name = 'Customer'
  customer_email = 'customer@example.com'
  pet_name = if ($pet -and $pet.name) { $pet.name } else { 'Buddy' }
  request_type = 'grooming'
  service_name = "E2E Grooming $stamp"
  requested_date = $futureDate
  requested_time = '10:30'
  notes = 'Runtime E2E audit request'
}
$newRequest = Invoke-AuditRequest 'workflow:create-customer-request' 'POST' "$base/customer/requests" $tokens.customer $payload
$results.Add($newRequest)

if ($newRequest.Ok) {
  $requestId = $newRequest.Data.request.id
  $results.Add((Invoke-AuditRequest 'workflow:receptionist-approve-request' 'POST' "$base/receptionist/requests/$requestId/approve" $tokens.receptionist @{
    receptionist_remarks = 'Approved during runtime E2E audit'
  }))

  $proofPath = 'C:\Users\ACER\Pawesome_frontend\backend\public\storage\payment_proofs\4tsNHTXpOyScZVyEijd0387JRgwPtr4qnB5UhnsT.jpg'
  if (Test-Path $proofPath) {
    $upload = Invoke-AuditRequest 'workflow:customer-upload-payment-proof' 'POST' "$base/customer/requests/$requestId/payment-proof" $tokens.customer $null @{
      payment_method = 'gcash'
      payment_reference = "E2E-$stamp"
      payment_proof = Get-Item $proofPath
    }
    $results.Add($upload)

    if ($upload.Ok) {
      $results.Add((Invoke-AuditRequest 'workflow:cashier-verify-payment-proof' 'POST' "$base/cashier/payment-requests/$requestId/verify" $tokens.cashier @{
        type = 'service_request'
        cashier_remarks = 'Verified during runtime E2E audit'
      }))
    }
  }
}

$products = Invoke-AuditRequest 'workflow:cashier-products-for-pos' 'GET' "$base/cashier/pos/products" $tokens.cashier
if ($products.Ok) {
  $raw = $products.Data
  $list = if ($raw -is [array]) { $raw } elseif ($raw.products) { $raw.products } elseif ($raw.data) { $raw.data } else { @() }
  if ($list.Count -gt 0) {
    $product = $list[0]
    $results.Add((Invoke-AuditRequest 'workflow:cashier-pos-checkout' 'POST' "$base/cashier/pos/transaction" $tokens.cashier @{
      customer_name = 'Walk-in E2E'
      payment_method = 'cash'
      cash_received = 100000
      items = @(@{
        item_type = 'product'
        item_id = $product.id
        item_name = $product.name
        quantity = 1
        unit_price = [double]$product.price
      })
    }))
  }
}

$results | ForEach-Object {
  $extra = ''
  if ($_.Name -like 'blocked:*') {
    $extra = if ($_.Status -eq 403) { ' expected-block' } else { ' unexpected-block-result' }
  }
  if ($_.Name -eq 'workflow:cashier-pos-checkout' -and $_.Ok) {
    $extra = if ($_.Data.receipt) { ' receipt=yes' } else { ' receipt=no' }
  }
  if ($_.Name -eq 'workflow:customer-upload-payment-proof' -and $_.Ok) {
    $extra = ' payment_status=' + $_.Data.payment_status
  }
  if ($_.Name -eq 'workflow:cashier-verify-payment-proof' -and $_.Ok) {
    $extra = ' receipt=' + ($_.Data.receipt_number ?? 'generated')
  }

  '{0} | ok={1} | status={2} | {3}{4}' -f $_.Name, $_.Ok, $_.Status, $_.Message, $extra
}
