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
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Audit
            $table->string('batch_number')->unique();
            $table->timestamp('produced_at')->nullable();
            $table->timestamp('expires_at')->index();
            $table->decimal('initial_quantity', 10, 2);
            $table->decimal('current_quantity', 10, 2);
            $table->string('unit', 10)->default('pz'); // kg, g, l, pz
            $table->string('status', 20)->default('active')->index(); // active, consumed, expired, quarantined
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};
