<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('car_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_brand_id')->constrained('car_brands')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['car_brand_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_models');
    }
};
