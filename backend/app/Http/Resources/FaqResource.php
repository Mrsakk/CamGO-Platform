<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaqResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'question_km' => $this->question_km,
            'question_en' => $this->question_en,
            'answer_km' => $this->answer_km,
            'answer_en' => $this->answer_en,
            'order' => $this->order,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
