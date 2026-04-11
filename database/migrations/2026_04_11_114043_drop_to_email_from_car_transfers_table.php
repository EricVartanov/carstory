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
        if (! Schema::hasTable('car_transfers')) {
            return;
        }

        Schema::table('car_transfers', function (Blueprint $table) {
            if (Schema::hasColumn('car_transfers', 'to_email')) {
                $table->dropColumn('to_email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('car_transfers')) {
            return;
        }

        Schema::table('car_transfers', function (Blueprint $table) {
            if (! Schema::hasColumn('car_transfers', 'to_email')) {
                $table->string('to_email')->nullable()->after('token');
            }
        });
    }
};
