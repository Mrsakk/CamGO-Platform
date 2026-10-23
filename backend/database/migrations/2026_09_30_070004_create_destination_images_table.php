<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained('destinations')->cascadeOnDelete();
            $table->string('image_path');
            $table->string('caption_km')->nullable();
            $table->string('caption_en')->nullable();
            $table->boolean('is_cover')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['destination_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_images');
    }
};
