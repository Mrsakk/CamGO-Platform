<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessHourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'weekday' => $this->weekday,
            'opens_at' => $this->opens_at ? substr($this->opens_at, 0, 5) : null,
            'closes_at' => $this->closes_at ? substr($this->closes_at, 0, 5) : null,
            'is_closed' => (bool) $this->is_closed,
        ];
    }
}
