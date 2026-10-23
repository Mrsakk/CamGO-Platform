<?php

namespace App\Modules\Business\Actions;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessMediaAction
{
    /**
     * Process an uploaded image:
     * - Re-encode to WebP format with EXIF stripped
     * - Generate 800px and 400px versions
     * - Save to public disk under business/media/{businessId}/
     */
    public function execute(UploadedFile $file, int $businessId): array
    {
        $disk = Storage::disk('public');
        $baseDir = "business/media/{$businessId}";
        if (!$disk->exists($baseDir)) {
            $disk->makeDirectory($baseDir);
        }

        $uuid = Str::uuid()->toString();
        $sourcePath = $file->getRealPath();

        // Detect image type
        $imageInfo = @getimagesize($sourcePath);
        if (!$imageInfo) {
            // Fallback: store as is
            $storedPath = $file->store($baseDir, 'public');
            return [
                'path' => $storedPath,
                'path_800' => $storedPath,
                'path_400' => $storedPath,
            ];
        }

        $sourceType = $imageInfo[2];
        $srcImage = match ($sourceType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => @imagecreatefromwebp($sourcePath),
            default => null,
        };

        if (!$srcImage) {
            $storedPath = $file->store($baseDir, 'public');
            return [
                'path' => $storedPath,
                'path_800' => $storedPath,
                'path_400' => $storedPath,
            ];
        }

        // Fix EXIF orientation if JPEG and exif extension available
        if ($sourceType === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
            $exif = @exif_read_data($sourcePath);
            if (!empty($exif['Orientation'])) {
                $srcImage = match ($exif['Orientation']) {
                    3 => imagerotate($srcImage, 180, 0),
                    6 => imagerotate($srcImage, -90, 0),
                    8 => imagerotate($srcImage, 90, 0),
                    default => $srcImage,
                };
            }
        }

        $origWidth = imagesx($srcImage);
        $origHeight = imagesy($srcImage);

        // 1. Full-size WebP
        $origRelativePath = "{$baseDir}/{$uuid}.webp";
        $origAbsPath = storage_path("app/public/{$origRelativePath}");
        @imagepalettetotruecolor($srcImage);
        imagealphablending($srcImage, true);
        imagesavealpha($srcImage, true);
        imagewebp($srcImage, $origAbsPath, 85);

        // 2. 800px WebP
        $path800Relative = "{$baseDir}/{$uuid}_800.webp";
        $this->resizeAndSaveWebp($srcImage, $origWidth, $origHeight, 800, storage_path("app/public/{$path800Relative}"));

        // 3. 400px WebP
        $path400Relative = "{$baseDir}/{$uuid}_400.webp";
        $this->resizeAndSaveWebp($srcImage, $origWidth, $origHeight, 400, storage_path("app/public/{$path400Relative}"));

        imagedestroy($srcImage);

        return [
            'path' => $origRelativePath,
            'path_800' => $path800Relative,
            'path_400' => $path400Relative,
        ];
    }

    private function resizeAndSaveWebp($srcImage, int $origWidth, int $origHeight, int $targetWidth, string $destPath): void
    {
        if ($origWidth <= $targetWidth) {
            imagewebp($srcImage, $destPath, 80);
            return;
        }

        $targetHeight = (int) round(($origHeight / $origWidth) * $targetWidth);
        $resized = imagecreatetruecolor($targetWidth, $targetHeight);

        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
        imagefilledrectangle($resized, 0, 0, $targetWidth, $targetHeight, $transparent);

        imagecopyresampled($resized, $srcImage, 0, 0, 0, 0, $targetWidth, $targetHeight, $origWidth, $origHeight);
        imagewebp($resized, $destPath, 80);
        imagedestroy($resized);
    }
}
