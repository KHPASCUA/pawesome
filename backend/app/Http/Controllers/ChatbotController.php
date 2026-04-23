<?php

namespace App\Http\Controllers;

use App\Services\Chatbot\PremiumChatbotService;
use App\Services\Chatbot\RoleScopeService;
use App\Services\Chatbot\KnowledgeBaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    private PremiumChatbotService $chatbotService;

    public function __construct(
        RoleScopeService $roleScopeService,
        KnowledgeBaseService $knowledgeBaseService,
    ) {
        $this->chatbotService = new PremiumChatbotService($roleScopeService, $knowledgeBaseService);
    }

    /**
     * Get personalized welcome message
     */
    public function welcome(Request $request): JsonResponse
    {
        return response()->json($this->chatbotService->welcome($request->user()));
    }

    /**
     * Process chatbot message and return intelligent response
     */
    public function message(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => 'required|string|max:2000',
            'channel' => 'nullable|string|max:50',
        ]);

        return response()->json(
            $this->chatbotService->respond(
                $request->user(),
                $data['message'],
                $data['channel'] ?? 'web',
            )
        );
    }
}
