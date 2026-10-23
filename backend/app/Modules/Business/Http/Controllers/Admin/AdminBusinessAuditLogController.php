<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBusinessAuditLogController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Business::class);

        $query = AuditLog::with('user')
            ->where('action', 'like', 'business_%');

        if ($request->filled('business_id')) {
            $query->where('auditable_id', $request->input('business_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $paginated = $query->latest('id')->paginate($perPage);

        return $this->successResponse([
            'items' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }
}
