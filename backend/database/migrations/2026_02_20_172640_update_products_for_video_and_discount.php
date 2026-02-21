<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('video')->nullable()->after('description');
            $table->integer('discount_percentage')->nullable()->after('discount_price');
            // Remove old video_url if exists
            if (Schema::hasColumn('products', 'video_url')) {
                $table->dropColumn('video_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['video', 'discount_percentage']);
            $table->string('video_url')->nullable()->after('description');
        });
    }
};
