<?php

namespace App\Modules\Business\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Anonymous visitors can submit reviews
    }

    public function rules(): array
    {
        return [
            'display_name' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:255',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'required|string|min:10|max:2000',
            'locale' => 'nullable|string|in:km,en',
            'website' => 'nullable|max:0', // Honeypot field: must be empty
            'hp_website' => 'nullable|max:0', // Alternative honeypot
        ];
    }

    public function messages(): array
    {
        return [
            'comment.min' => 'Review comment must be at least 10 characters long.',
            'website.max' => 'Spam detection triggered.',
            'hp_website.max' => 'Spam detection triggered.',
        ];
    }
}
