<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends ApiController
{
    /**
     * Store new contact message inquiry.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'phone' => 'nullable|string|max:50',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|min:10|max:3000',
        ]);

        $message = ContactMessage::create($validated);

        AuditLog::record('contact_inquiry_sent', $message);

        return $this->successResponse([
            'message_id' => $message->id,
        ], 'Thank you for reaching out! Your message has been received and our team will get back to you shortly.', 201);
    }
}
