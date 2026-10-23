<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for the Business Directory module (Step 2A).
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('biz_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_km');
            $table->string('name_en');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('sort_order');
        });

        // 2. Businesses
        Schema::create('biz_businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('biz_categories')->cascadeOnDelete();
            $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name_km');
            $table->string('name_en');
            $table->string('tagline_km')->nullable();
            $table->string('tagline_en')->nullable();
            $table->text('description_km')->nullable();
            $table->text('description_en')->nullable();
            $table->string('address_km')->nullable();
            $table->string('address_en')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->unsignedTinyInteger('price_level')->nullable(); // 1 to 4
            $table->enum('status', ['draft', 'pending_review', 'approved', 'suspended'])->default('draft');
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('cover_media_id')->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('rating_count')->default(0);

            // Internal admin-only fields
            $table->string('owner_name')->nullable();
            $table->string('owner_phone')->nullable();
            $table->text('internal_notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id');
            $table->index('province_id');
            $table->index('status');
            $table->index('is_verified');
            $table->index(['lat', 'lng']);
            $table->index('rating_avg');
            $table->index('created_at');
        });

        // 3. Contacts
        Schema::create('biz_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('type'); // phone, telegram, whatsapp, messenger, email, website, facebook
            $table->string('value');
            $table->string('label')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['business_id', 'sort_order']);
            $table->index(['business_id', 'is_primary']);
        });

        // 4. Operating Hours
        Schema::create('biz_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday'); // 0 = Sunday, 1 = Monday ... 6 = Saturday
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->index(['business_id', 'weekday']);
        });

        // 5. Temporary Closures
        Schema::create('biz_closures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->date('from_date');
            $table->date('to_date');
            $table->string('note_km')->nullable();
            $table->string('note_en')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'from_date', 'to_date']);
        });

        // 6. Media / Gallery
        Schema::create('biz_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('path');
            $table->string('path_800')->nullable();
            $table->string('path_400')->nullable();
            $table->string('alt_km')->nullable();
            $table->string('alt_en')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_cover')->default(false);
            $table->timestamps();

            $table->index(['business_id', 'sort_order']);
            $table->index(['business_id', 'is_cover']);
        });

        // 7. KYC Documents (Stored in private disk)
        Schema::create('biz_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('type'); // id_card, business_license, other
            $table->string('path');
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'type']);
        });

        // 8. Reviews
        Schema::create('biz_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('display_name');
            $table->unsignedTinyInteger('rating'); // 1 to 5
            $table->text('comment');
            $table->string('locale', 10)->default('km');
            $table->string('email_hash', 64)->index();
            $table->string('ip_hash', 64)->index();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('moderated_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index(['business_id', 'rating']);
            $table->index('created_at');
        });

        // 9. Contact & Interaction Events
        Schema::create('biz_contact_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('channel'); // phone, telegram, whatsapp, messenger, email, website, directions, profile_view
            $table->timestamp('occurred_at');
            $table->string('locale', 10)->default('km');
            $table->string('session_hash', 64)->index();
            $table->string('source')->default('profile'); // list, profile, nearby
            $table->timestamps();

            $table->index(['business_id', 'occurred_at']);
            $table->index(['channel', 'occurred_at']);
        });

        // 10. Daily Stats (Aggregated nightly)
        Schema::create('biz_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('contacts_total')->default(0);
            $table->json('contacts_by_channel')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'date']);
            $table->index(['date', 'contacts_total']);
        });

        // 11. Destination Links (Proximity cache)
        Schema::create('biz_destination_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('destination_id')->constrained('destinations')->cascadeOnDelete();
            $table->decimal('distance_km', 8, 2);
            $table->timestamps();

            $table->unique(['business_id', 'destination_id']);
            $table->index(['destination_id', 'distance_km']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biz_destination_links');
        Schema::dropIfExists('biz_daily_stats');
        Schema::dropIfExists('biz_contact_events');
        Schema::dropIfExists('biz_reviews');
        Schema::dropIfExists('biz_documents');
        Schema::dropIfExists('biz_media');
        Schema::dropIfExists('biz_closures');
        Schema::dropIfExists('biz_hours');
        Schema::dropIfExists('biz_contacts');
        Schema::dropIfExists('biz_businesses');
        Schema::dropIfExists('biz_categories');
    }
};
