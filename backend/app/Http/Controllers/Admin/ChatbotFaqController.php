<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotFaq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotFaqController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            ChatbotFaq::query()
                ->orderBy('sort_order')
                ->orderBy('question')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'scope' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $faq = ChatbotFaq::create([
            'question' => $data['question'],
            'answer' => $data['answer'],
            'keywords' => $data['keywords'] ?? [],
            'scope' => $data['scope'] ?? 'general',
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($faq, 201);
    }

    public function update(Request $request, ChatbotFaq $faq): JsonResponse
    {
        $data = $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'scope' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $faq->update([
            'question' => $data['question'],
            'answer' => $data['answer'],
            'keywords' => $data['keywords'] ?? [],
            'scope' => $data['scope'] ?? 'general',
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($faq);
    }

    public function destroy(ChatbotFaq $faq): JsonResponse
    {
        $faq->delete();

        return response()->json(['message' => 'FAQ deleted']);
    }
}
