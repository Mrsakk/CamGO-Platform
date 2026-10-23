<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name_km');
            $table->string('name_en');
            $table->string('code', 10)->unique()->nullable();
            $table->text('description_km')->nullable();
            $table->text('description_en')->nullable();
            $table->string('image')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('area_km2', 10, 2)->nullable();
            $table->unsignedInteger('population')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_featured');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provinces');
    }
};
