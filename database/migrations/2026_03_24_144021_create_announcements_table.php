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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->enum('scope', ['global', 'store'])->default('store');
            $table->foreignId('store_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('target_user_ids')->nullable(); // Array of user_ids for targeted messages
            $table->unsignedBigInteger('created_by');
            $table->boolean('is_active')->default(true);
            $table->string('priority')->default('normal'); // normal, important, critical
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
