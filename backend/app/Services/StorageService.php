<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    /**
     * Upload a file to Supabase Storage (public bucket) or local disk.
     *
     * @param UploadedFile $file
     * @param string $bucket Name of bucket or directory (e.g. 'avatars', 'settings')
     * @param string|null $prefix Optional subfolder or filename prefix
     * @return string The public URL or storage URL
     */
    public static function upload(UploadedFile $file, string $bucket = 'avatars', ?string $prefix = null): string
    {
        $supabaseUrl = rtrim(config('services.supabase.url') ?: env('SUPABASE_URL', ''), '/');
        $supabaseKey = config('services.supabase.service_key')
            ?: config('services.supabase.anon_key')
            ?: env('SUPABASE_SERVICE_ROLE_KEY')
            ?: env('SUPABASE_ANON_KEY');

        if (!empty($supabaseUrl) && !empty($supabaseKey)) {
            try {
                $ext = strtolower($file->getClientOriginalExtension() ?: 'png');
                $filename = ($prefix ? trim($prefix, '/').'_' : '') . Str::uuid() . '.' . $ext;
                $mimeType = $file->getMimeType() ?: 'image/png';
                $binaryContent = file_get_contents($file->getRealPath());

                $response = Http::withoutVerifying()->withHeaders([
                    'apikey' => $supabaseKey,
                    'Authorization' => 'Bearer ' . $supabaseKey,
                    'Content-Type' => $mimeType,
                    'x-upsert' => 'true',
                ])->withBody(
                    $binaryContent,
                    $mimeType
                )->post("{$supabaseUrl}/storage/v1/object/{$bucket}/{$filename}");

                if ($response->successful()) {
                    return "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$filename}";
                }

                Log::warning('Supabase storage upload failed: HTTP ' . $response->status() . ' - ' . $response->body());
            } catch (\Throwable $e) {
                Log::warning('Supabase storage upload exception: ' . $e->getMessage());
            }
        }

        // Fallback to local storage disk
        try {
            $path = $file->store($bucket, 'public');
            return Storage::url($path);
        } catch (\Throwable $e) {
            Log::error('Local disk store exception: ' . $e->getMessage());

            // Emergency fallback: base64 data URI so user is not blocked
            try {
                return 'data:' . ($file->getMimeType() ?: 'image/png') . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
            } catch (\Throwable $e2) {
                throw $e;
            }
        }
    }
}
