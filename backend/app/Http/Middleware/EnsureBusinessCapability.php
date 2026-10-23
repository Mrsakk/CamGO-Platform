<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessCapability
{
    public function handle(Request $request, Closure $next, string $capability): Response
    {
        $user = $request->user();

        if (!$user || !$user->isBusinessOwner() || !$user->hasBusinessCapability($capability)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
