<?php

namespace App\Modules\Business\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('business.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:biz_categories,id',
            'province_id' => 'required|exists:provinces,id',
            'name_km' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:biz_businesses,slug',
            'tagline_km' => 'nullable|string|max:255',
            'tagline_en' => 'nullable|string|max:255',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'address_km' => 'nullable|string|max:255',
            'address_en' => 'nullable|string|max:255',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'price_level' => 'nullable|integer|between:1,4',
            'owner_name' => 'nullable|string|max:255',
            'owner_phone' => 'nullable|string|max:100',
            'internal_notes' => 'nullable|string',
        ];
    }
}
