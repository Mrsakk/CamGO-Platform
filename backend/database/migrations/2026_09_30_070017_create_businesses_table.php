<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Business owner
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('destination_id')->nullable()->constrained('destinations')->nullOnDelete();

            $table->string('name_km');
            $table->string('name_en');
            $table->enum('type', ['hotel', 'restaurant', 'tour_operator', 'transport', 'activity', 'other'])->default('hotel');
            $table->text('description_km')->nullable();
            $table->text('description_en')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('address_km')->nullable();
            $table->string('address_en')->nullable();
            $table->decimal('price_range_min', 8, 2)->nullable();
            $table->decimal('price_range_max', 8, 2)->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->decimal('avg_rating', 3, 2)->default(0.00);
            $table->unsignedInteger('reviews_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('province_id');
            $table->index('category_id');
            $table->index('destination_id');
            $table->index('type');
            $table->index('is_active');
            $table->index('is_verified');
            $table->fullText(['name_km', 'name_en']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
