<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biz_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('session_hash', 64);
            $table->enum('status', ['new', 'contacted', 'qualified', 'won', 'lost'])->default('new');
            $table->string('primary_channel');
            $table->string('source')->default('profile');
            $table->string('locale', 10)->default('km');
            $table->unsignedInteger('contact_count')->default(1);
            $table->timestamp('first_contact_at');
            $table->timestamp('last_contact_at');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'session_hash']);
            $table->index(['business_id', 'status']);
            $table->index(['business_id', 'last_contact_at']);
        });

        Schema::create('biz_owner_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->string('dedupe_key')->nullable();
            $table->string('title_km');
            $table->string('title_en');
            $table->text('body_km');
            $table->text('body_en');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'read_at']);
            $table->index(['user_id', 'read_at']);
            $table->index(['business_id', 'dedupe_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biz_owner_notifications');
        Schema::dropIfExists('biz_leads');
    }
};
