<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title_km');
            $table->string('title_en');
            $table->longText('description_km');
            $table->longText('description_en');
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->string('location_name_km')->nullable();
            $table->string('location_name_en')->nullable();
            $table->string('cover_image')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('start_date');
            $table->index('is_published');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
