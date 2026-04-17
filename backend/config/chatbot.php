<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Chatbot Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the AI-powered features of the chatbot. When enabled, the
    | chatbot will use AI for general questions while keeping rule-based
    | responses for critical actions like bookings.
    |
    */

    // Enable/disable AI features
    'ai_enabled' => env('CHATBOT_AI_ENABLED', false),

    // OpenAI API Key (or compatible service like OpenRouter, Azure)
    'ai_api_key' => env('CHATBOT_AI_API_KEY', null),

    // Model to use (gpt-3.5-turbo, gpt-4, gpt-4-turbo, etc.)
    'ai_model' => env('CHATBOT_AI_MODEL', 'gpt-3.5-turbo'),

    // API Base URL (default is OpenAI, can be changed for Azure or other providers)
    'ai_base_url' => env('CHATBOT_AI_BASE_URL', 'https://api.openai.com/v1'),

    // Timeout for AI requests in seconds
    'ai_timeout' => env('CHATBOT_AI_TIMEOUT', 30),

    // Maximum tokens for AI responses
    'ai_max_tokens' => env('CHATBOT_AI_MAX_TOKENS', 500),

    /*
    |--------------------------------------------------------------------------
    | Intent Routing Configuration
    |--------------------------------------------------------------------------
    |
    | Define which intents should use rule-based responses vs AI.
    | Critical actions (bookings) use rules for reliability.
    | General questions use AI for natural conversation.
    |
    */

    // Intents that ALWAYS use rule-based responses (critical actions)
    'rule_based_intents' => [
        'booking_help',
        'hotel_booking',
        'pricing', // Uses live database data
        'navigation',
        'logs',
        'summary',
    ],

    // Intents that can use AI for general knowledge
    'ai_eligible_intents' => [
        'general',
        'support',
        'role_help',
    ],

    // If no intent detected, use AI if enabled (true) or fallback response (false)
    'ai_for_unknown_intents' => true,

    /*
    |--------------------------------------------------------------------------
    | Hybrid Behavior
    |--------------------------------------------------------------------------
    |
    | When both FAQ and AI are available:
    | - 'faq_first': Check database FAQs first, fallback to AI
    * - 'ai_first': Use AI first (faster but costs more)
    | - 'smart': Use FAQ for exact matches, AI for everything else
    |
    */
    'hybrid_mode' => env('CHATBOT_HYBRID_MODE', 'faq_first'),
];
