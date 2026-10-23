<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\TeamMemberResource;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;

class TeamMemberController extends ApiController
{
    /**
     * List all published team members ordered by display order.
     */
    public function index(): JsonResponse
    {
        $members = TeamMember::query()
            ->published()
            ->orderBy('order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse([
            'items' => TeamMemberResource::collection($members),
        ]);
    }
}
