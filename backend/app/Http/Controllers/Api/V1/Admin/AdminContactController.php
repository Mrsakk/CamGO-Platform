<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ContactMessageResource;
use App\Models\AuditLog;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query();

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => ContactMessageResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'unread_count' => ContactMessage::unread()->count(),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return $this->errorResponse('Message not found', 404);
        }

        if (!$message->is_read) {
            $message->update(['is_read' => true]);
        }

        return $this->successResponse([
            'message' => new ContactMessageResource($message),
        ]);
    }

    public function markRead(string $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return $this->errorResponse('Message not found', 404);
        }

        $message->update(['is_read' => true]);
        return $this->successResponse(null, 'Marked as read');
    }

    public function reply(Request $request, string $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return $this->errorResponse('Message not found', 404);
        }

        $request->validate(['reply_message' => 'required|string|min:5']);

        $message->update([
            'is_read' => true,
            'replied_at' => now(),
        ]);

        AuditLog::record('contact_replied', $message);

        return $this->successResponse(null, 'Reply sent successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return $this->errorResponse('Message not found', 404);
        }

        $message->delete();
        AuditLog::record('contact_message_deleted', $message);

        return $this->successResponse(null, 'Message deleted');
    }
}
