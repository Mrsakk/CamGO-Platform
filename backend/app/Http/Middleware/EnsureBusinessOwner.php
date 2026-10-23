<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessOwner
{
    /**
     * Restrict owner endpoints to active users with a linked business.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isBusinessOwner() || !$user->business) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. An active business owner account is required.',
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        return $next($request);
    }
}
