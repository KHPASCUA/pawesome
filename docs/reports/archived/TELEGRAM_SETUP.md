# Telegram Bot & Chatbot Integration Setup Guide

## Overview

This guide covers the setup, configuration, and testing of the Pawsitive Telegram Bot and Chatbot integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Telegram Bot](#creating-a-telegram-bot)
3. [Environment Configuration](#environment-configuration)
4. [Webhook Setup](#webhook-setup)
5. [Testing the Bot](#testing-the-bot)
6. [FAQ Management](#faq-management)
7. [Notification Templates](#notification-templates)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Telegram account
- Your Laravel backend publicly accessible (for webhooks)
- For local development: [ngrok](https://ngrok.com/) or similar tunneling service

---

## Creating a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** and send `/newbot`
3. **Follow the prompts:**
   - Enter your bot's name (display name)
   - Enter your bot's username (must end in `bot`, e.g., `PawsitiveBot`)
4. **Save the bot token** - This is your `TELEGRAM_BOT_TOKEN`

**Example BotFather response:**
```
Done! Congratulations on your new bot.
You will find it at t.me/PawsitiveBot
Use this token to access the HTTP API:
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

## Environment Configuration

Add these to your `backend/.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Webhook URL (must be HTTPS)
# For local testing with ngrok:
TELEGRAM_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/telegram/webhook
# For production:
# TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook

# Webhook Secret (optional but recommended for security)
# Generate with: php -r "echo bin2hex(random_bytes(16));"
TELEGRAM_WEBHOOK_SECRET=your_random_secret_here

# Admin Chat ID (optional - for admin notifications)
# Get this after testing the bot
TELEGRAM_ADMIN_CHAT_ID=123456789

# Frontend URL for deep links
FRONTEND_URL=http://localhost:3000
```

**Important:** After updating `.env`, clear the config cache:
```bash
cd backend
php artisan config:clear
```

---

## Webhook Setup

### Local Development with ngrok

1. **Start your Laravel server:**
   ```bash
   cd backend
   php artisan serve --port=8000
   ```

2. **In another terminal, start ngrok:**
   ```bash
   ngrok http 8000
   ```

3. **Copy the HTTPS URL** from ngrok (e.g., `https://abc123.ngrok.io`)

4. **Update your `.env`:**
   ```env
   TELEGRAM_WEBHOOK_URL=https://abc123.ngrok.io/api/telegram/webhook
   ```

5. **Clear config cache** and **set the webhook** (see below)

### Setting the Webhook

#### Option 1: Using Artisan Command (if implemented)
```bash
php artisan telegram:setup
```

#### Option 2: Using Admin API
```bash
# Get admin token first, then:
curl -X POST https://yourdomain.com/api/admin/telegram/set-webhook \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Option 3: Manual API Call
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://yourdomain.com/api/telegram/webhook" \
  -d "secret_token=your_webhook_secret"
```

### Verify Webhook Setup

```bash
# Check webhook status
php artisan telegram:test --test=webhook

# Or via API
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

---

## Testing the Bot

### 1. Connectivity Test

```bash
cd backend
php artisan telegram:test
```

Expected output:
```
✅ BOT TOKEN: Configured
✅ WEBHOOK URL: https://...
✅ BOT CONNECTED SUCCESSFULLY
```

### 2. Send a Test Message

Get your chat ID by:
1. Messaging your bot on Telegram
2. Checking the webhook logs: `storage/logs/laravel.log`
3. Look for: `Telegram webhook received` with your chat ID

Then test:
```bash
php artisan telegram:test --chat-id=YOUR_CHAT_ID
```

### 3. Test Templates

```bash
php artisan telegram:test --test=templates --chat-id=YOUR_CHAT_ID
```

This sends sample booking and appointment notifications.

### 4. Test Chatbot Integration

```bash
php artisan telegram:test --test=chatbot
```

This tests the chatbot intents and responses.

### 5. Real Bot Interaction Test

1. **Message your bot on Telegram:**
   - Send `/start` - Should get welcome message
   - Send `What are your hours?` - Should get FAQ response
   - Send `/book` - Should get booking flow

2. **Check the logs:**
   ```bash
   tail -f backend/storage/logs/laravel.log | grep Telegram
   ```

---

## FAQ Management

### Predefined FAQs

The system comes with pre-seeded FAQs. Run:
```bash
cd backend
php artisan db:seed --class=ChatbotFaqSeeder
```

### FAQ Categories

| Scope | Description |
|-------|-------------|
| `general` | Available to all users |
| `customer` | Customer-specific questions |
| `receptionist` | Staff help questions |
| `admin` | Admin configuration help |

### Managing FAQs via API

```bash
# List all FAQs
curl https://yourdomain.com/api/admin/chatbot/faqs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create new FAQ
curl -X POST https://yourdomain.com/api/admin/chatbot/faqs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your refund policy?",
    "answer": "Refunds available within 24 hours...",
    "keywords": ["refund", "money back", "cancel"],
    "scope": "general",
    "is_active": true
  }'
```

---

## Notification Templates

### Available Template Types

| Type | Description |
|------|-------------|
| `booking_created` | New reservation pending |
| `booking_confirmed` | Reservation confirmed |
| `booking_checked_in` | Pet checked in |
| `booking_checked_out` | Pet checked out |
| `booking_cancelled` | Reservation cancelled |
| `appointment_created` | Appointment scheduled |
| `appointment_confirmed` | Appointment confirmed |
| `appointment_completed` | Service completed |
| `appointment_cancelled` | Appointment cancelled |

### Using Templates in Code

```php
use App\Services\NotificationTemplateService;

// Generate notification message
$data = [
    'pet_name' => 'Max',
    'check_in' => 'Apr 25, 2026',
    'room_type' => 'Deluxe',
];

$message = NotificationTemplateService::generate(
    NotificationTemplateService::TYPE_BOOKING_CONFIRMED,
    $data,
    'telegram'  // or 'app', 'email'
);
```

---

## Role-Based Chatbot Features

### Who Can Use What

| Role | Telegram Features | Chatbot Features |
|------|-------------------|------------------|
| **Customer** | Booking notifications, appointment reminders, general chat | Hotel booking, appointments, pets, services |
| **Receptionist** | Admin alerts (optional) | All customer features + check-in/out, booking management |
| **Veterinary** | Appointment alerts | Appointments, medical records, current boarders |
| **Manager** | Admin notifications | Summary stats, staff management, reports |
| **Admin** | All admin alerts | Full chatbot logs, FAQ management, all features |

---

## Troubleshooting

### Bot Not Responding

1. **Check configuration:**
   ```bash
   php artisan telegram:test
   ```

2. **Verify webhook is set:**
   ```bash
   php artisan telegram:test --test=webhook
   ```

3. **Check webhook logs:**
   ```bash
   tail -f storage/logs/laravel.log | grep -i telegram
   ```

4. **Common issues:**
   - Webhook URL not HTTPS
   - Bot token incorrect
   - Webhook secret mismatch
   - Server not publicly accessible

### Webhook Not Receiving Updates

1. **Check webhook info:**
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```

2. **Look for errors:**
   - `pending_update_count` > 0 means Telegram is trying to deliver
   - `last_error_message` shows any errors

3. **Reset webhook:**
   ```bash
   # Delete webhook
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   
   # Re-set webhook
   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
     -d "url=<YOUR_WEBHOOK_URL>"
   ```

### Chatbot Not Using AI

1. **Run diagnostic:**
   ```bash
   php artisan chatbot:test
   ```

2. **Check AI configuration:**
   ```env
   CHATBOT_AI_ENABLED=true
   CHATBOT_AI_API_KEY=your_gemini_key
   ```

3. **Verify FAQ mode:**
   ```env
   CHATBOT_HYBRID_MODE=faq_first  # or 'ai_first'
   ```

### Getting Chat ID

1. Message your bot on Telegram
2. Check logs immediately:
   ```bash
   tail -20 storage/logs/laravel.log | grep chat_id
   ```
3. Or use the webhook info endpoint as admin

---

## Security Best Practices

1. **Use Webhook Secret:** Always set `TELEGRAM_WEBHOOK_SECRET` to verify requests
2. **HTTPS Only:** Telegram requires HTTPS webhooks
3. **Protect Bot Token:** Never commit `.env` files
4. **Rate Limiting:** The webhook endpoint is public - consider rate limiting
5. **Validate Input:** The bot validates all incoming messages

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/telegram/webhook` | POST | None | Receives Telegram updates |
| `/api/admin/telegram/set-webhook` | POST | Admin | Sets webhook URL |
| `/api/admin/telegram/remove-webhook` | POST | Admin | Removes webhook |
| `/api/admin/telegram/webhook-info` | GET | Admin | Gets webhook status |
| `/api/admin/chatbot/faqs` | GET | Admin | List FAQs |
| `/api/admin/chatbot/faqs` | POST | Admin | Create FAQ |
| `/api/auth/telegram/unlink` | POST | User | Unlink Telegram |

---

## Support

For issues or questions:
1. Check the logs: `storage/logs/laravel.log`
2. Run diagnostic commands
3. Verify all environment variables
4. Test bot connectivity step by step
