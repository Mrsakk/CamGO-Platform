<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_km' => $this->title_km,
            'title_en' => $this->title_en,
            'excerpt_km' => $this->excerpt_km,
            'excerpt_en' => $this->excerpt_en,
            'content_km' => $this->content_km,
            'content_en' => $this->content_en,
            'cover_image' => $this->cover_image,
            'image_url' => $this->cover_image,
            'tags' => $this->tags ?? [],
            'view_count' => (int) $this->view_count,
            'is_published' => (bool) $this->is_published,
            'published_at' => $this->published_at?->format('M d, Y'),
            'published_at_raw' => $this->published_at?->toISOString(),
            'author' => $this->author ? [
                'id' => $this->author->id,
                'name' => $this->author->name,
                'avatar' => $this->author->avatar,
            ] : null,
        ];
    }
}
