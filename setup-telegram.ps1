# Telegram Bot Setup Script for Windows PowerShell
# Run this script to configure and test your Telegram bot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Pawsitive Telegram Bot Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from correct directory
if (-not (Test-Path "backend\artisan")) {
    Write-Host "Error: Please run this script from the Pawsitive_frontend root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check PHP
Write-Host "Step 1: Checking PHP..." -ForegroundColor Yellow
try {
    $phpVersion = php -v | Select-String "PHP" | Select-Object -First 1
    Write-Host "  $phpVersion" -ForegroundColor Green
} catch {
    Write-Host "  PHP not found! Please install PHP first." -ForegroundColor Red
    exit 1
}

# Step 2: Prompt for Bot Token
Write-Host ""
Write-Host "Step 2: Telegram Bot Configuration" -ForegroundColor Yellow
Write-Host "  Get your bot token from @BotFather on Telegram" -ForegroundColor Gray
Write-Host "  1. Open Telegram, search for @BotFather" -ForegroundColor Gray
Write-Host "  2. Send /newbot and follow instructions" -ForegroundColor Gray
Write-Host "  3. Copy the token (looks like: 123456789:ABCdef...)" -ForegroundColor Gray
Write-Host ""

$botToken = Read-Host "Enter your bot token"
if ([string]::IsNullOrWhiteSpace($botToken)) {
    Write-Host "  Token is required!" -ForegroundColor Red
    exit 1
}

# Step 3: Generate Webhook Secret
Write-Host ""
Write-Host "Step 3: Generating webhook secret..." -ForegroundColor Yellow
$webhookSecret = php -r "echo bin2hex(random_bytes(16));"
Write-Host "  Secret generated: $webhookSecret" -ForegroundColor Green

# Step 4: Update .env file
Write-Host ""
Write-Host "Step 4: Updating backend/.env file..." -ForegroundColor Yellow

$envPath = "backend\.env"
$envExamplePath = "backend\.env.example"

# Create .env from example if it doesn't exist
if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "  Created .env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "  .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Read current .env content
$envContent = Get-Content $envPath -Raw

# Update or add Telegram configuration
$telegramConfig = @"

# Telegram Bot Configuration (Auto-configured)
TELEGRAM_BOT_TOKEN=$botToken
TELEGRAM_WEBHOOK_SECRET=$webhookSecret
FRONTEND_URL=http://localhost:3000
"@

# Remove old Telegram config if exists
$envContent = $envContent -replace "(?s)# Telegram Bot Configuration.*?(?=\n#|\n[A-Z_]+=|$)", ""
$envContent = $envContent -replace "TELEGRAM_BOT_TOKEN=.*\n", ""
$envContent = $envContent -replace "TELEGRAM_WEBHOOK_URL=.*\n", ""
$envContent = $envContent -replace "TELEGRAM_WEBHOOK_SECRET=.*\n", ""
$envContent = $envContent -replace "TELEGRAM_ADMIN_CHAT_ID=.*\n", ""

# Add new config
$envContent += $telegramConfig

# Save .env
$envContent | Set-Content $envPath -NoNewline
Write-Host "  .env file updated!" -ForegroundColor Green

# Step 5: Clear config cache
Write-Host ""
Write-Host "Step 5: Clearing config cache..." -ForegroundColor Yellow
cd backend
php artisan config:clear
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Config cache cleared!" -ForegroundColor Green
} else {
    Write-Host "  Warning: Could not clear cache" -ForegroundColor Yellow
}
cd ..

# Step 6: Test connectivity
Write-Host ""
Write-Host "Step 6: Testing bot connectivity..." -ForegroundColor Yellow
cd backend
php artisan telegram:test 2>&1 | Tee-Object -Variable testResult
cd ..

if ($testResult -match "BOT CONNECTED SUCCESSFULLY") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   BOT CONNECTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "   Bot test completed with warnings" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

# Step 7: Instructions for next steps
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start ngrok to expose your local server:" -ForegroundColor White
Write-Host "   ngrok http 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)" -ForegroundColor White
Write-Host ""
Write-Host "3. Open backend/.env and add:" -ForegroundColor White
Write-Host "   TELEGRAM_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/telegram/webhook" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Message your bot on Telegram (@YourBotUsername)" -ForegroundColor White
Write-Host "   Send /start to activate" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Run webhook setup:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   php artisan config:clear" -ForegroundColor Gray
Write-Host "   # Then use admin panel or API to set webhook" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Get your chat ID from logs:" -ForegroundColor White
Write-Host "   Get-Content backend/storage/logs/laravel.log -Wait | Select-String chat_id" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Test with:" -ForegroundColor White
Write-Host "   php artisan telegram:test --chat-id=YOUR_CHAT_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "For full setup guide, see: QUICK_START.md" -ForegroundColor Cyan
