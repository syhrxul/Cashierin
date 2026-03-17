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
            $table->index(['role', 'approval_status']);
            $table->index('username');
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->index('status');
            $table->index('license_type');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('name');
            $table->index('is_active');
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('shift_schedules', function (Blueprint $table) {
            $table->index(['start_time', 'end_time']);
            $table->index('status');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('status');
            $table->index('receipt_number');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'approval_status']);
            $table->dropIndex(['username']);
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['license_type']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('shift_schedules', function (Blueprint $table) {
            $table->dropIndex(['start_time', 'end_time']);
            $table->dropIndex(['status']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['receipt_number']);
            $table->dropIndex(['created_at']);
        });
    }
};
