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
        Schema::create('productions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->timestamp('produced_at')->index();
            $table->decimal('output_quantity', 10, 3)->nullable();
            $table->string('output_unit', 10)->nullable(); // kg, g, l, ml, pcs
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
