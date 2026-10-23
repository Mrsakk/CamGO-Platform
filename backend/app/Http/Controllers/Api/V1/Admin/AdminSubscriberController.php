<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSubscriberController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Subscriber::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $query->where('email', 'like', '%' . trim($request->input('search')) . '%');
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'total_active' => Subscriber::where('is_active', true)->count(),
        ]);
    }

    public function exportCsv(): StreamedResponse
    {
        $subscribers = Subscriber::where('is_active', true)->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="khemara_subscribers_' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($subscribers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Email', 'Active', 'Subscribed At']);

            foreach ($subscribers as $s) {
                fputcsv($handle, [
                    $s->id,
                    $s->email,
                    $s->is_active ? 'Yes' : 'No',
                    $s->created_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function destroy(string $id): JsonResponse
    {
        $subscriber = Subscriber::find($id);
        if (!$subscriber) {
            return $this->errorResponse('Subscriber not found', 404);
        }

        $subscriber->delete();
        AuditLog::record('subscriber_deleted', $subscriber);

        return $this->successResponse(null, 'Subscriber removed');
    }
}
