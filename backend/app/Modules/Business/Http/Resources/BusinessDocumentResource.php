<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'type' => $this->type,
            'file_name' => $this->file_name,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'expires_at' => $this->expires_at?->format('Y-m-d'),
            'notes' => $this->notes,
            'uploaded_by' => $this->uploaded_by,
            'uploader_name' => $this->uploader?->name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
