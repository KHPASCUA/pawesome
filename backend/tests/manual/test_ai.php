<?php
/**
 * AI Chatbot Test Script
 * Run: php test_ai.php
 */

require __DIR__ . '/vendor/autoload.php';

// Load Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\Chatbot\AiChatbotService;
use Illuminate\Support\Facades\Config;

echo "========================================\n";
echo "   AI CHATBOT TEST SCRIPT\n";
echo "========================================\n\n";

// Check if AI is enabled
$enabled = Config::get('chatbot.ai_enabled');
echo "✓ AI Enabled: " . ($enabled ? "YES" : "NO") . "\n";

if (!$enabled) {
    echo "\n❌ ERROR: AI is disabled!\n";
    echo "   Add to .env: CHATBOT_AI_ENABLED=true\n";
    exit(1);
}

// Check API key
$apiKey = Config::get('chatbot.ai_api_key');
echo "✓ API Key: " . (strlen($apiKey) > 10 ? substr($apiKey, 0, 15) . "..." : "NOT SET") . "\n";

if (empty($apiKey) || strlen($apiKey) < 10) {
    echo "\n❌ ERROR: API key not configured!\n";
    exit(1);
}

echo "✓ Model: " . Config::get('chatbot.ai_model') . "\n";
echo "✓ Base URL: " . Config::get('chatbot.ai_base_url') . "\n\n";

// Test AI Service
$aiService = new AiChatbotService();

echo "🧪 Testing AI Response...\n";
echo "----------------------------------------\n";

$testMessage = "Hello! What services do you offer?";
echo "User: $testMessage\n\n";

$response = $aiService->generateResponse(
    $testMessage,
    'customer',
    [
        'hotel' => ['rooms_available_count' => 5, 'occupancy_rate' => '65%'],
        'today_appointments' => ['count' => 8],
    ]
);

if ($response) {
    echo "✅ AI RESPONDED!\n";
    echo "----------------------------------------\n";
    echo "Reply: " . $response['message'] . "\n";
    echo "Source: " . ($response['source'] ?? 'unknown') . "\n";
    echo "Confidence: " . ($response['confidence'] ?? 'N/A') . "\n";
    
    if (isset($response['suggestions'])) {
        echo "Suggestions: " . implode(', ', $response['suggestions']) . "\n";
    }
} else {
    echo "❌ AI returned NULL (API error or empty response)\n";
    echo "   Check your API key and internet connection.\n";
}

echo "\n========================================\n";
echo "Test Complete!\n";
echo "========================================\n";
