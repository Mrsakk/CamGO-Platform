<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class EventController extends ApiController
{
    /**
     * List all published upcoming festivals and events.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()
            ->published()
            ->with('province')
            ->orderBy('start_date', 'asc');

        if ($request->boolean('upcoming_only')) {
            $query->upcoming();
        }

        $perPage = min((int) $request->input('per_page', 12), 30);
        $paginated = $query->paginate($perPage);

        return $this->successResponse([
            'items' => EventResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Show single event details.
     */
    public function show(string $slug): JsonResponse
    {
        $event = Event::query()
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->published()
            ->with('province')
            ->first();

        if (!$event) {
            return $this->errorResponse('Event not found', 404);
        }

        return $this->successResponse([
            'event' => new EventResource($event),
        ]);
    }

    /**
     * Upcoming featured events for homepage.
     */
    public function upcoming(): JsonResponse
    {
        $items = Cache::remember('events_upcoming_home', 600, function () {
            $events = Event::query()
                ->published()
                ->with('province')
                ->upcoming()
                ->take(3)
                ->get();

            return EventResource::collection($events)->resolve();
        });

        return $this->successResponse([
            'items' => $items,
        ]);
    }
}
