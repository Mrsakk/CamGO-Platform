<?php

namespace App\Modules\Business\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'channel' => 'required|string|in:phone,telegram,whatsapp,messenger,email,website,directions,profile_view',
            'source' => 'nullable|string|in:list,profile,nearby',
            'locale' => 'nullable|string|max:10',
        ];
    }
}
