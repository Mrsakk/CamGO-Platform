<?php

namespace App\Http\Middleware;

use App\Modules\Business\Models\Business;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveBusinessContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && empty($user->business_id)) {
            $membership = $user->businessUsers()
                ->where('status', 'active')
                ->latest('id')
                ->first();

            if ($membership) {
                $business = Business::find($membership->business_id);

                if ($business) {
                    $user->setAttribute('business_id', $business->id);
                    $user->setRelation('business', $business);
                }
            }
        }

        return $next($request);
    }
}
