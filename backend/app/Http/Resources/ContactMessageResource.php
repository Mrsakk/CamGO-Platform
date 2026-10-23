<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'message' => $this->message,
            'is_read' => (bool) $this->is_read,
            'replied_at' => $this->replied_at?->toISOString(),
            'created_at' => $this->created_at?->diffForHumans(),
            'created_at_raw' => $this->created_at?->toISOString(),
        ];
    }
}
