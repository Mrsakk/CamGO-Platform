<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\FaqResource;
use App\Models\AuditLog;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminFaqController extends ApiController
{
    public function index(): JsonResponse
    {
        $faqs = Faq::query()->ordered()->get();
        return $this->successResponse(['items' => FaqResource::collection($faqs)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_km' => 'required|string|max:500',
            'question_en' => 'required|string|max:500',
            'answer_km' => 'required|string',
            'answer_en' => 'required|string',
            'category' => 'nullable|string|max:50',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $faq = Faq::create($validated);
        Cache::flush();
        AuditLog::record('faq_created', $faq);

        return $this->successResponse(['faq' => new FaqResource($faq)], 'FAQ created successfully', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $faq = Faq::find($id);
        if (!$faq) {
            return $this->errorResponse('FAQ not found', 404);
        }

        $validated = $request->validate([
            'question_km' => 'sometimes|required|string|max:500',
            'question_en' => 'sometimes|required|string|max:500',
            'answer_km' => 'sometimes|required|string',
            'answer_en' => 'sometimes|required|string',
            'category' => 'nullable|string|max:50',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $faq->update($validated);
        Cache::flush();
        AuditLog::record('faq_updated', $faq);

        return $this->successResponse(['faq' => new FaqResource($faq)], 'FAQ updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $faq = Faq::find($id);
        if (!$faq) {
            return $this->errorResponse('FAQ not found', 404);
        }

        $faq->delete();
        Cache::flush();
        AuditLog::record('faq_deleted', $faq);

        return $this->successResponse(null, 'FAQ deleted');
    }
}
