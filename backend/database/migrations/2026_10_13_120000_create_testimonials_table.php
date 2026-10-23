<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('name');
            $table->string('role')->nullable(); // e.g. "Heritage Explorer" / "អ្នករុករកបេតិកភណ្ឌ"
            $table->string('location')->nullable(); // e.g. "Phnom Penh, Cambodia"
            $table->string('trip')->nullable(); // e.g. "Angkor Wat & Bayon"
            $table->unsignedTinyInteger('rating')->default(5); // 1-5
            $table->string('avatar')->nullable(); // Initials or URL
            $table->string('avatar_bg')->nullable()->default('bg-laterite-600');
            $table->text('quote_km')->nullable();
            $table->text('quote_en');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
