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
        Schema::table('shift_requests', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_requests', function (Blueprint $table) {
            // Note: Difficult to revert back to specific ENUM if data contains other strings
            // But we can try reversing to a wider ENUM if needed for rollback
            $table->enum('status', ['pending','approved','rejected','waiting_target'])->default('pending')->change();
        });
    }
};
