<?php

namespace App\Modules\Business\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StatusBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('business.publish') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:draft,pending,pending_review,published,approved,suspended',
            'reason' => 'nullable|string|max:1000',
        ];
    }
}
