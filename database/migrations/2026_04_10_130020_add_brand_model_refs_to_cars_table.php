<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->foreignId('car_brand_id')->nullable()->constrained('car_brands')->nullOnDelete();
            $table->foreignId('car_model_id')->nullable()->constrained('car_models')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropConstrainedForeignId('car_model_id');
            $table->dropConstrainedForeignId('car_brand_id');
        });
    }
};
