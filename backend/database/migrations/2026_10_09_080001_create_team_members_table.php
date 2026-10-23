<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_km')->nullable();
            $table->string('role_en');
            $table->string('role_km')->nullable();
            $table->string('image')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index('is_published');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
