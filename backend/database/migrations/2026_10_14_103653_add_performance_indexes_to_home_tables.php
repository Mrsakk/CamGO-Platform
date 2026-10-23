<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance indexes for the /api/v1/home aggregated endpoint.
 *
 * Run: php artisan migrate
 * All indexes are conditional (checks column existence) so migration is idempotent.
 */
return new class extends Migration
{
    public function up(): void
    {
        // destinations: is_published, is_featured, avg_rating, category_id, province_id
        Schema::table('destinations', function (Blueprint $table) {
            if (!$this->hasIndex('destinations', 'idx_dest_home_pool')) {
                $table->index(['is_published', 'is_featured', 'avg_rating'], 'idx_dest_home_pool');
            }
            if (!$this->hasIndex('destinations', 'idx_dest_category')) {
                $table->index(['category_id', 'is_published'], 'idx_dest_category');
            }
            if (!$this->hasIndex('destinations', 'idx_dest_province')) {
                $table->index(['province_id', 'is_published'], 'idx_dest_province');
            }
        });

        // events: is_published, start_date, end_date
        Schema::table('events', function (Blueprint $table) {
            if (!$this->hasIndex('events', 'idx_events_upcoming')) {
                $table->index(['is_published', 'start_date'], 'idx_events_upcoming');
            }
        });

        // blog_posts: is_published, published_at
        Schema::table('blog_posts', function (Blueprint $table) {
            if (!$this->hasIndex('blog_posts', 'idx_posts_published')) {
                $table->index(['is_published', 'published_at'], 'idx_posts_published');
            }
        });
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            if ($this->hasIndex('destinations', 'idx_dest_home_pool')) {
                $table->dropIndex('idx_dest_home_pool');
            }
            if ($this->hasIndex('destinations', 'idx_dest_category')) {
                $table->dropIndex('idx_dest_category');
            }
            if ($this->hasIndex('destinations', 'idx_dest_province')) {
                $table->dropIndex('idx_dest_province');
            }
        });

        Schema::table('events', function (Blueprint $table) {
            if ($this->hasIndex('events', 'idx_events_upcoming')) {
                $table->dropIndex('idx_events_upcoming');
            }
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            if ($this->hasIndex('blog_posts', 'idx_posts_published')) {
                $table->dropIndex('idx_posts_published');
            }
        });
    }

    /** Helper: check if an index already exists to make migration idempotent. */
    private function hasIndex(string $table, string $indexName): bool
    {
        $driver = \DB::getDriverName();
        if ($driver === 'pgsql') {
            $indexes = \DB::select(
                "SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $indexName]
            );
            return count($indexes) > 0;
        }

        $indexes = \DB::select(
            "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
            [$indexName]
        );
        return count($indexes) > 0;
    }
};
