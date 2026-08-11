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
        Schema::create('delivery_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // chi ha scansionato la fattura
            $table->string('invoice_number')->nullable();
            $table->date('invoice_date')->nullable();
            $table->string('file_path');
            $table->string('file_mime', 100)->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending, reviewing, confirmed, failed
            $table->json('raw_ai_response')->nullable(); // risposta grezza del modello AI, per debug
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_invoices');
    }
};
