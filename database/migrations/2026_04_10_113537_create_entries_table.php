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
    Schema::create('entries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('car_id')->constrained()->cascadeOnDelete();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->date('date');
        $table->unsignedInteger('mileage')->nullable();  // Пробег км
        $table->string('type')->default('note');         // note, service, trip, fuel
        $table->string('title')->nullable();             // Заголовок записи
        $table->text('body')->nullable();                // Текст заметки
        $table->decimal('amount', 10, 2)->nullable();    // Стоимость
        $table->string('currency', 3)->default('RUB');
        $table->json('location')->nullable();            // {lat, lng, name} для геометки
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entries');
    }
};
