<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            if (!$setting) {
                return $default;
            }
            $value = $setting->value;
            $json = json_decode($value, true);
            return (json_last_error() === JSON_ERROR_NONE) ? $json : $value;
        });
    }

    public static function set(string $key, $value, string $group = 'general'): self
    {
        $storedValue = is_array($value) ? json_encode($value) : (string) $value;

        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue, 'group' => $group]
        );

        Cache::forget("setting_{$key}");
        Cache::forget("all_settings");
        Cache::forget("all_public_settings");

        return $setting;
    }
}
