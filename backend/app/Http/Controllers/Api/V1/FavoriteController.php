<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\Destination;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends ApiController
{
    /**
     * Toggle favorite status of a destination for the authenticated user.
     */
    public function toggle(Request $request, string $destinationId): JsonResponse
    {
        $user = $request->user();
        $destination = Destination::find($destinationId);

        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $existing = Favorite::where('user_id', $user->id)
            ->where('destination_id', $destination->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFavorited = false;
            $message = 'Destination removed from favorites';
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'destination_id' => $destination->id,
            ]);
            $isFavorited = true;
            $message = 'Destination added to favorites';
        }

        return $this->successResponse([
            'destination_id' => $destination->id,
            'is_favorited' => $isFavorited,
            'total_favorites' => $destination->favorites()->count(),
        ], $message);
    }

    /**
     * Get all destination IDs favorited by the current user.
     */
    public function ids(Request $request): JsonResponse
    {
        $user = $request->user();
        $ids = $user->favorites()->pluck('destination_id');

        return $this->successResponse([
            'favorited_ids' => $ids,
        ]);
    }
}
