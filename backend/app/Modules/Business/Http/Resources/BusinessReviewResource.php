<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessReviewResource extends JsonResource
{
    protected bool $isAdmin;

    public function __construct($resource, bool $isAdmin = false)
    {
        parent::__construct($resource);
        $this->isAdmin = $isAdmin;
    }

    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'business_name_en' => $this->business?->name_en,
            'business_name_km' => $this->business?->name_km,
            'business_slug' => $this->business?->slug,
            'display_name' => $this->display_name,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
            ] : null),
            'title' => $this->title,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'locale' => $this->locale,
            'owner_reply' => $this->owner_reply,
            'owner_replied_at' => $this->owner_replied_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_human' => $this->created_at?->diffForHumans(),
        ];

        if ($this->isAdmin || $request->user()?->isAdmin()) {
            $data['status'] = $this->status;
            $data['moderated_at'] = $this->moderated_at?->toIso8601String();
            $data['moderator_name'] = $this->moderator?->name;
            $data['rejection_reason'] = $this->rejection_reason;
        }

        return $data;
    }
}
