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
        Schema::create('invoice_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('delivery_invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // null se non matchato
            $table->foreignId('lot_id')->nullable()->constrained()->nullOnDelete(); // valorizzato dopo la conferma
            $table->string('raw_product_name'); // nome cosi' come letto dall'AI, prima del matching
            $table->decimal('quantity', 10, 3);
            $table->string('unit', 10)->default('pz'); // kg, g, l, pz
            $table->string('batch_number')->nullable();
            $table->date('expires_at')->nullable();
            $table->decimal('confidence_score', 4, 3)->default(0); // 0.000 - 1.000
            $table->string('status', 20)->default('pending')->index(); // pending, confirmed, rejected
            $table->timestamps();

            $table->index(['delivery_invoice_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_line_items');
    }
};
