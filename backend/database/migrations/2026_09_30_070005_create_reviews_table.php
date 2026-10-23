<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Polymorphic so both destinations and future businesses can be reviewed
            $table->morphs('reviewable');

            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('comment');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved'); // Default approved for responsive demo, moderatable by admin
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
