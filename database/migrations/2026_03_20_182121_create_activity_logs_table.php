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
        Schema::create('activity_logs', function (Blueprint $row) {
            $row->id();
            $row->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $row->foreignId('store_id')->nullable()->constrained()->onDelete('set null');
            $row->string('event'); // login, register, store_created, etc
            $row->string('description');
            $row->json('properties')->nullable();
            $row->string('ip_address', 45)->nullable();
            $row->string('user_agent', 500)->nullable();
            $row->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
