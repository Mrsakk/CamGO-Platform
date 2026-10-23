<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title_km');
            $table->string('title_en');
            $table->text('excerpt_km')->nullable();
            $table->text('excerpt_en')->nullable();
            $table->longText('content_km');
            $table->longText('content_en');
            $table->string('cover_image')->nullable();
            $table->json('tags')->nullable();

            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_published');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
