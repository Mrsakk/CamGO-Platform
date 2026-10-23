<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();

            $table->string('name_km');
            $table->string('name_en');
            $table->text('excerpt_km')->nullable();
            $table->text('excerpt_en')->nullable();
            $table->longText('description_km');
            $table->longText('description_en');
            $table->json('highlights_km')->nullable();
            $table->json('highlights_en')->nullable();

            $table->string('cover_image')->nullable();
            $table->string('opening_hours_km')->nullable();
            $table->string('opening_hours_en')->nullable();
            $table->string('entrance_fee_km')->nullable();
            $table->string('entrance_fee_en')->nullable();
            $table->decimal('entrance_fee_usd', 8, 2)->nullable()->default(0.00);
            $table->boolean('is_free')->default(false);

            $table->string('best_time_km')->nullable();
            $table->string('best_time_en')->nullable();
            $table->text('how_to_get_there_km')->nullable();
            $table->text('how_to_get_there_en')->nullable();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('address_km')->nullable();
            $table->string('address_en')->nullable();

            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('view_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->default(0.00);
            $table->unsignedInteger('reviews_count')->default(0);

            // Phase 2 readiness: nullable polymorphic relation
            $table->nullableMorphs('listable');

            $table->timestamps();
            $table->softDeletes();

            $table->index('province_id');
            $table->index('category_id');
            $table->index('is_published');
            $table->index('is_featured');
            $table->index('is_free');
            $table->index('avg_rating');
            $table->index('view_count');
            $table->index(['latitude', 'longitude']);
            $table->fullText(['name_km', 'name_en']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
