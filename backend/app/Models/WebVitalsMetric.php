<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebVitalsMetric extends Model
{
    public $timestamps = false;

    protected $table = 'web_vitals_metrics';

    protected $fillable = [
        'metric',
        'value',
        'rating',
        'route',
        'device_type',
        'effective_type',
        'app_version',
        'created_at',
    ];
}
