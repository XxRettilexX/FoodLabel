<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
            $table->string('status', 20)->default('active')->after('role')->index();
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('labels', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('alerts', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('recipe_items', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('productions', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });

        Schema::table('production_inputs', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('production_inputs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('productions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('recipe_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('alerts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('labels', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('lots', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
            $table->dropConstrainedForeignId('account_id');
        });
    }
};

