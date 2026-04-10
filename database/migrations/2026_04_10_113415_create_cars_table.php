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
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('brand');           // Марка: Toyota
            $table->string('model');           // Модель: Camry
            $table->year('year');              // Год выпуска
            $table->string('vin', 17)->nullable()->unique(); // VIN опционально
            $table->string('plate')->nullable();             // Гос. номер
            $table->string('color')->nullable();
            $table->string('cover_photo')->nullable();       // Фото машины
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
