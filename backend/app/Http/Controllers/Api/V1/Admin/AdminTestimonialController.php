<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTestimonialController extends ApiController
{
    /**
     * List all testimonials with status filters for moderation.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::query()->with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('quote_en', 'like', "%{$search}%")
                  ->orWhere('quote_km', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('trip', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'counts' => [
                'all' => Testimonial::count(),
                'pending' => Testimonial::where('status', 'pending')->count(),
                'approved' => Testimonial::where('status', 'approved')->count(),
                'rejected' => Testimonial::where('status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Approve website testimonial for public display.
     */
    public function approve(string $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);
        if (!$testimonial) {
            return $this->errorResponse('Testimonial not found', 404);
        }

        $testimonial->update(['status' => 'approved']);

        if (class_exists(AuditLog::class)) {
            AuditLog::record('testimonial_approved', $testimonial);
        }

        return $this->successResponse([
            'item' => $testimonial,
        ], 'Website testimonial approved and published live to homepage.');
    }

    /**
     * Reject website testimonial.
     */
    public function reject(string $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);
        if (!$testimonial) {
            return $this->errorResponse('Testimonial not found', 404);
        }

        $testimonial->update(['status' => 'rejected']);

        if (class_exists(AuditLog::class)) {
            AuditLog::record('testimonial_rejected', $testimonial);
        }

        return $this->successResponse([
            'item' => $testimonial,
        ], 'Website testimonial rejected.');
    }

    /**
     * Delete testimonial permanently.
     */
    public function destroy(string $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);
        if (!$testimonial) {
            return $this->errorResponse('Testimonial not found', 404);
        }

        $testimonial->delete();

        if (class_exists(AuditLog::class)) {
            AuditLog::record('testimonial_deleted', $testimonial);
        }

        return $this->successResponse(null, 'Website testimonial deleted permanently.');
    }
}
