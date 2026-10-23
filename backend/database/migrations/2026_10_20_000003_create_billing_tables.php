<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biz_plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_km');
            $table->string('name_en');
            $table->text('description_km')->nullable();
            $table->text('description_en')->nullable();
            $table->decimal('price_usd', 8, 2)->default(0);
            $table->enum('billing_cycle', ['none', 'monthly', 'yearly'])->default('monthly');
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('biz_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('biz_plans')->nullOnDelete();
            $table->enum('status', ['active', 'expired', 'canceled', 'pending'])->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->decimal('price_usd', 8, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->boolean('auto_renew')->default(false);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index('ends_at');
        });

        Schema::create('biz_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('biz_subscriptions')->cascadeOnDelete();
            $table->decimal('amount_usd', 8, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('method', ['khqr', 'cash', 'bank_transfer', 'other'])->default('khqr');
            $table->string('reference_no')->nullable();
            $table->string('receipt_no')->nullable()->unique();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('verified');
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['subscription_id', 'status']);
            $table->index('paid_at');
        });

        Schema::create('biz_subscription_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('requested_plan_id')->nullable()->constrained('biz_plans')->nullOnDelete();
            $table->string('contact_phone')->nullable();
            $table->text('note')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'canceled'])->default('pending');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biz_subscription_requests');
        Schema::dropIfExists('biz_payments');
        Schema::dropIfExists('biz_subscriptions');
        Schema::dropIfExists('biz_plans');
    }
};
