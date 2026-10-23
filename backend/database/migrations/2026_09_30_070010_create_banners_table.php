<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title_km');
            $table->string('title_en');
            $table->string('subtitle_km')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('image_url');
            $table->string('button_text_km')->nullable();
            $table->string('button_text_en')->nullable();
            $table->string('link_url')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
