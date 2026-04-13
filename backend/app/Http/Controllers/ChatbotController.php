<?php

namespace App\Http\Controllers;

use App\Services\Chatbot\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(
        private readonly ChatbotService $chatbotService,
    ) {
    }

    public function welcome(Request $request): JsonResponse
    {
        return response()->json($this->chatbotService->welcome($request->user()));
    }

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
