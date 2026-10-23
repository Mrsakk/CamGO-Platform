<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\EventResource;
use App\Models\AuditLog;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminEventController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->with('province');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_km', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->orderBy('start_date', 'asc')->paginate($perPage);

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

    public function store(Request $request): JsonResponse
    {
        $hasCover = $request->hasFile('cover_image') || $request->hasFile('image');
        $coverFileKey = $request->hasFile('cover_image') ? 'cover_image' : 'image';
        $coverRule = $hasCover
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        // Normalize empty strings to null
        if ($request->input('province_id') === '') {
            $request->merge(['province_id' => null]);
        }
        if ($request->input('end_date') === '') {
            $request->merge(['end_date' => null]);
        }

        $validated = $request->validate([
            'title_km' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'description_km' => 'required|string',
            'description_en' => 'required|string',
            'province_id' => 'nullable|exists:provinces,id',
            'location_name_km' => 'nullable|string|max:255',
            'location_name_en' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'cover_image' => $coverRule,
            'image' => 'nullable',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_featured' => 'nullable',
            'is_published' => 'nullable',
            'status' => 'nullable|string',
        ]);

        if ($request->filled('location')) {
            if (empty($validated['location_name_en'])) {
                $validated['location_name_en'] = $request->input('location');
            }
            if (empty($validated['location_name_km'])) {
                $validated['location_name_km'] = $request->input('location');
            }
        }
        unset($validated['location']);

        if ($request->has('status')) {
            $validated['is_published'] = $request->input('status') === 'published';
            unset($validated['status']);
        } elseif ($request->has('is_published')) {
            $validated['is_published'] = $request->boolean('is_published');
        } else {
            $validated['is_published'] = true;
        }

        if ($request->has('is_featured')) {
            $validated['is_featured'] = $request->boolean('is_featured');
        }

        if ($hasCover) {
            $path = $request->file($coverFileKey)->store('events', 'public');
            $validated['cover_image'] = Storage::url($path);
        }
        unset($validated['image']);

        $event = Event::create(array_merge($validated, [
            'slug' => Str::slug($validated['title_en']) . '-' . Str::random(5),
        ]));

        Cache::flush();
        AuditLog::record('event_created', $event);

        return $this->successResponse([
            'event' => new EventResource($event->load('province')),
        ], 'Event created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $event = Event::with('province')->find($id);
        if (!$event) {
            return $this->errorResponse('Event not found', 404);
        }

        return $this->successResponse([
            'event' => new EventResource($event),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $event = Event::find($id);
        if (!$event) {
            return $this->errorResponse('Event not found', 404);
        }

        $hasCover = $request->hasFile('cover_image') || $request->hasFile('image');
        $coverFileKey = $request->hasFile('cover_image') ? 'cover_image' : 'image';
        $coverRule = $hasCover
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        if ($request->input('province_id') === '') {
            $request->merge(['province_id' => null]);
        }
        if ($request->input('end_date') === '') {
            $request->merge(['end_date' => null]);
        }

        $validated = $request->validate([
            'title_km' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|required|string|max:255',
            'description_km' => 'sometimes|required|string',
            'description_en' => 'sometimes|required|string',
            'province_id' => 'nullable|exists:provinces,id',
            'location_name_km' => 'nullable|string|max:255',
            'location_name_en' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'cover_image' => $coverRule,
            'image' => 'nullable',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date',
            'is_featured' => 'nullable',
            'is_published' => 'nullable',
            'status' => 'nullable|string',
        ]);

        if ($request->filled('location')) {
            if (empty($validated['location_name_en'])) {
                $validated['location_name_en'] = $request->input('location');
            }
            if (empty($validated['location_name_km'])) {
                $validated['location_name_km'] = $request->input('location');
            }
        }
        unset($validated['location']);

        if ($request->has('status')) {
            $validated['is_published'] = $request->input('status') === 'published';
            unset($validated['status']);
        } elseif ($request->has('is_published')) {
            $validated['is_published'] = $request->boolean('is_published');
        }

        if ($request->has('is_featured')) {
            $validated['is_featured'] = $request->boolean('is_featured');
        }

        if ($hasCover) {
            $path = $request->file($coverFileKey)->store('events', 'public');
            $validated['cover_image'] = Storage::url($path);
        }
        unset($validated['image']);

        $event->update($validated);
        Cache::flush();
        AuditLog::record('event_updated', $event);

        return $this->successResponse([
            'event' => new EventResource($event->load('province')),
        ], 'Event updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $event = Event::find($id);
        if (!$event) {
            return $this->errorResponse('Event not found', 404);
        }

        $event->delete();
        Cache::flush();
        AuditLog::record('event_deleted', $event);

        return $this->successResponse(null, 'Event deleted');
    }
}
