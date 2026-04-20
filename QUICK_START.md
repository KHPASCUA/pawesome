# Quick Start - Telegram Bot Setup (Next Steps)

## Step 1: Create Your Bot (5 minutes)

1. Open Telegram and search for **@BotFather**
2. Start a chat and send: `/newbot`
3. Follow prompts:
   - Name: `Pawsitive Pet Hotel`
   - Username: `YourPawsitiveBot` (must end in 'bot')
4. **Copy the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Configure Environment (2 minutes)

Open `backend/.env` and add:

```env
TELEGRAM_BOT_TOKEN=your_copied_token_here
TELEGRAM_WEBHOOK_SECRET=your_random_secret_32chars
FRONTEND_URL=http://localhost:3000
```

Generate a random secret:
```bash
cd backend
php -r "echo bin2hex(random_bytes(16));"
```

Then clear config:
```bash
php artisan config:clear
```

## Step 3: Expose Your Local Server (for testing)

Install ngrok if not already:
```bash
# Windows (with chocolatey)
choco install ngrok

# Or download from https://ngrok.com/download
```

Start your servers:
```bash
# Terminal 1 - Laravel
cd backend
php artisan serve --port=8000

# Terminal 2 - React
cd frontend
npm start

# Terminal 3 - ngrok
ngrok http 8000
```

Copy the **HTTPS URL** from ngrok (e.g., `https://abc123.ngrok.io`)

## Step 4: Set Webhook URL

Add to `.env`:
```env
TELEGRAM_WEBHOOK_URL=https://abc123.ngrok.io/api/telegram/webhook
```

Then run:
```bash
php artisan config:clear
```

## Step 5: Set the Webhook

Use the admin panel or API:

**Option A: Via API (if you have admin token)**
```bash
curl -X POST http://localhost:8000/api/admin/telegram/set-webhook \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Option B: Direct to Telegram**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://abc123.ngrok.io/api/telegram/webhook" \
  -d "secret_token=your_webhook_secret"
```

## Step 6: Test Connectivity

```bash
php artisan telegram:test
```

Should see:
```
✅ BOT TOKEN: Configured
✅ BOT CONNECTED SUCCESSFULLY
```

## Step 7: Get Your Chat ID

1. Message your bot on Telegram (send `/start`)
2. Check the logs:
   ```bash
   tail -20 backend/storage/logs/laravel.log | grep chat
   ```
3. Look for: `"chat":{"id":123456789` - that's your chat ID!

## Step 8: Send Test Message

```bash
php artisan telegram:test --chat-id=YOUR_CHAT_ID
```

You should receive a message on Telegram!

## Step 9: Seed FAQs

```bash
php artisan db:seed --class=ChatbotFaqSeeder
```

## Step 10: Link Account in Frontend

1. Open your web app (`http://localhost:3000`)
2. Login as a customer
3. Go to Profile
4. Click "Link Telegram Account"
5. Follow instructions to connect

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Bot token not configured" | Run `php artisan config:clear` |
| "Failed to connect" | Check token is correct, no extra spaces |
| Webhook not working | URL must be HTTPS, ngrok must be running |
| Not receiving messages | Check ngrok URL hasn't changed (restart if needed) |

---

## Quick Commands Reference

```bash
# Test bot connectivity
php artisan telegram:test

# Test with actual message
php artisan telegram:test --chat-id=123456789

# Check webhook status
php artisan telegram:test --test=webhook

# Test notification templates
php artisan telegram:test --test=templates --chat-id=123456789

# Seed FAQs
php artisan db:seed --class=ChatbotFaqSeeder

# Check logs
 tail -f backend/storage/logs/laravel.log | grep Telegram
```
