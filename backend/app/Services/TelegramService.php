<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $botToken;
    protected string $apiUrl = 'https://api.telegram.org/bot';

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
    }

    /**
     * Send message to a specific chat
     */
    public function sendMessage(string $chatId, string $message, ?array $keyboard = null): bool
    {
        if (empty($this->botToken) || empty($chatId)) {
            Log::warning('Telegram bot token or chat ID not configured');
            return false;
        }

        try {
            $url = "{$this->apiUrl}{$this->botToken}/sendMessage";
            
            $data = [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ];

            if ($keyboard) {
                $data['reply_markup'] = json_encode(['inline_keyboard' => $keyboard]);
            }

            $response = Http::post($url, $data);

            if (!$response->successful()) {
                Log::error('Telegram API error: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram message: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send notification to admin group
     */
    public function sendAdminNotification(string $message): bool
    {
        $adminChatId = config('services.telegram.admin_chat_id');
        
        if (empty($adminChatId)) {
            return false;
        }

        return $this->sendMessage($adminChatId, "🔔 <b>Admin Alert</b>\n\n{$message}");
    }

    /**
     * Set webhook for bot
     */
    public function setWebhook(string $url): bool
    {
        if (empty($this->botToken)) {
            return false;
        }

        try {
            $apiUrl = "{$this->apiUrl}{$this->botToken}/setWebhook";
            
            $response = Http::post($apiUrl, [
                'url' => $url,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to set Telegram webhook: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete webhook
     */
    public function deleteWebhook(): bool
    {
        if (empty($this->botToken)) {
            return false;
        }

        try {
            $apiUrl = "{$this->apiUrl}{$this->botToken}/deleteWebhook";
            
            $response = Http::post($apiUrl);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to delete Telegram webhook: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get bot info
     */
    public function getMe(): ?array
    {
        if (empty($this->botToken)) {
            return null;
        }

        try {
            $apiUrl = "{$this->apiUrl}{$this->botToken}/getMe";
            
            $response = Http::get($apiUrl);

            if ($response->successful()) {
                return $response->json()['result'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to get Telegram bot info: ' . $e->getMessage());
            return null;
        }
    }
}
