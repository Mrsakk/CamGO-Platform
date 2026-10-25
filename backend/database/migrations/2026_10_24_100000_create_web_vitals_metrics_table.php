<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_vitals_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric', 16); // LCP, INP, CLS, TTFB, FCP
            $table->decimal('value', 10, 4);
            $table->string('rating', 24)->nullable(); // good, needs-improvement, poor
            $table->string('route', 255);
            $table->string('device_type', 24)->nullable(); // mobile, tablet, desktop
            $table->string('effective_type', 24)->nullable(); // 4g, 3g, 2g, slow-2g
            $table->string('app_version', 32)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['metric', 'route']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_vitals_metrics');
    }
};
