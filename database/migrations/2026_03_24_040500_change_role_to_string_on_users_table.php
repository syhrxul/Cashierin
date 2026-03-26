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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->default('pegawai')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Sanitize data first: revert unknown roles to a known enum value to prevent truncation errors
        \Illuminate\Support\Facades\DB::table('users')
            ->whereNotIn('role', ['superadmin', 'owner', 'manager', 'kasir', 'dapur'])
            ->update(['role' => 'kasir']);

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'owner', 'manager', 'kasir', 'dapur'])->default('owner')->change();
        });
    }
};
