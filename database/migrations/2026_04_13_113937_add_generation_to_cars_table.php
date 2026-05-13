<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('cars', 'car_generation_id')) {
            Schema::table('cars', function (Blueprint $table) {
                $table->unsignedBigInteger('car_generation_id')->nullable();
            });
        }

        Schema::table('cars', function (Blueprint $table) {
            $table
                ->foreign('car_generation_id')
                ->references('id')
                ->on('car_generations')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('cars', 'car_generation_id')) {
            return;
        }

        Schema::table('cars', function (Blueprint $table) {
            $table->dropForeign(['car_generation_id']);
        });

        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn('car_generation_id');
        });
    }
};
