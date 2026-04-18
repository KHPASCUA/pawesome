<?php
/**
 * Chatbot Debug Script - Shows why AI isn't working
 * Run: php test_chatbot_debug.php
 */

require __DIR__ . '/vendor/autoload.php';

// Load Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Config;
use App\Services\Chatbot\AiChatbotService;
use App\Services\Chatbot\ChatbotService;

echo "========================================\n";
echo "   CHATBOT DEBUG - Why AI Not Working\n";
echo "========================================\n\n";

// Check raw .env values
echo "1. RAW ENV VALUES FROM .env FILE:\n";
echo "   CHATBOT_AI_ENABLED=" . env('CHATBOT_AI_ENABLED', 'NOT SET') . "\n";
echo "   CHATBOT_AI_API_KEY=" . (env('CHATBOT_AI_API_KEY') ? substr(env('CHATBOT_AI_API_KEY'), 0, 10) . '...' : 'NOT SET') . "\n";
echo "   CHATBOT_AI_MODEL=" . env('CHATBOT_AI_MODEL', 'NOT SET') . "\n";
echo "   CHATBOT_HYBRID_MODE=" . env('CHATBOT_HYBRID_MODE', 'NOT SET') . "\n\n";

// Check config values
echo "2. CONFIG VALUES (after Laravel loads):\n";
echo "   chatbot.ai_enabled=" . (Config::get('chatbot.ai_enabled') ? 'true' : 'false') . "\n";
echo "   chatbot.ai_api_key=" . (Config::get('chatbot.ai_api_key') ? 'SET (' . strlen(Config::get('chatbot.ai_api_key')) . ' chars)' : 'NOT SET') . "\n";
echo "   chatbot.ai_model=" . Config::get('chatbot.ai_model') . "\n";
echo "   chatbot.hybrid_mode=" . Config::get('chatbot.hybrid_mode') . "\n\n";

// Check AI service
echo "3. AI SERVICE STATUS:\n";
$aiService = new AiChatbotService();
echo "   aiService->isEnabled()=" . ($aiService->isEnabled() ? 'true' : 'false') . "\n\n";

// Check chatbot service intent routing
echo "4. INTENT ROUTING CHECK (for 'hello'):\n";
$chatbotService = new ChatbotService();
$intent = 'greeting'; // 'hello' usually maps to 'greeting'
$aiEligible = Config::get('chatbot.ai_eligible_intents');
$ruleBased = Config::get('chatbot.rule_based_intents');
echo "   Intent detected: $intent\n";
echo "   In ai_eligible_intents? " . (in_array($intent, $aiEligible) ? 'YES' : 'NO') . "\n";
echo "   In rule_based_intents? " . (in_array($intent, $ruleBased) ? 'YES (would block AI)' : 'NO') . "\n";
echo "   AI should be used? " . ($aiService->isEnabled() && in_array($intent, $aiEligible) ? 'YES' : 'NO') . "\n\n";

// Test actual chatbot response
echo "5. TEST ACTUAL CHATBOT RESPONSE:\n";
echo "   Sending: 'Hello'\n";
try {
    $response = $chatbotService->respond('Hello', ['role' => 'manager']);
    echo "   Response received!\n";
    echo "   Reply: " . substr($response['message'], 0, 100) . "...\n";
    echo "   Source: " . ($response['source'] ?? 'unknown') . "\n";
    
    if (isset($response['source']) && $response['source'] === 'gemini') {
        echo "   ✅ AI IS WORKING!\n";
    } else {
        echo "   ❌ AI NOT USED (source is not 'gemini')\n";
        echo "   Debug: intent=" . ($response['intent'] ?? 'unknown') . "\n";
    }
} catch (Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
echo "FIX: Add these lines to your .env file:\n";
echo "========================================\n";
echo "CHATBOT_AI_ENABLED=true\n";
echo "CHATBOT_AI_API_KEY=YOUR_API_KEY_HERE\n";
echo "CHATBOT_AI_MODEL=gemini-1.5-flash\n";
echo "CHATBOT_HYBRID_MODE=ai_first\n";
echo "\nThen run: php artisan config:clear\n";
echo "========================================\n";
