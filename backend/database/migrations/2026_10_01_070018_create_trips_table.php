<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('title_en')->nullable();
            $table->string('province')->default('Siem Reap');
            $table->unsignedSmallInteger('days_count')->default(1);
            $table->text('notes')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('trip_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('destination_id')->nullable()->constrained('destinations')->nullOnDelete();
            $table->unsignedSmallInteger('day_number')->default(1);
            $table->unsignedSmallInteger('order_index')->default(0);
            $table->string('name_km');
            $table->string('name_en')->nullable();
            $table->string('slug')->nullable();
            $table->string('category')->nullable();
            $table->string('image')->nullable();
            $table->string('time')->nullable()->default('09:00 AM');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['trip_id', 'day_number']);
            $table->index('destination_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_items');
        Schema::dropIfExists('trips');
    }
};
