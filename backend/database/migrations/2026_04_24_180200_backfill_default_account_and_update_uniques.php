<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $existing = DB::table('accounts')->where('slug', 'default')->first();

        $accountId = $existing?->id ?? DB::table('accounts')->insertGetId([
            'name' => 'Default Account',
            'slug' => 'default',
            'timezone' => null,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Users
        DB::table('users')->whereNull('account_id')->update(['account_id' => $accountId]);
        DB::table('users')->where('role', 'operator')->update(['role' => 'warehouse']);

        // Domain tables
        foreach ([
            'suppliers',
            'products',
            'lots',
            'inventory_movements',
            'labels',
            'alerts',
            'recipes',
            'recipe_items',
            'productions',
            'production_inputs',
        ] as $table) {
            DB::table($table)->whereNull('account_id')->update(['account_id' => $accountId]);
        }

        // Make account_id NOT NULL (PostgreSQL only; SQLite lacks ALTER COLUMN support)
        if (DB::getDriverName() === 'pgsql') {
            foreach ([
                'users',
                'suppliers',
                'products',
                'lots',
                'inventory_movements',
                'labels',
                'alerts',
                'recipes',
                'recipe_items',
                'productions',
                'production_inputs',
            ] as $table) {
                DB::statement("ALTER TABLE {$table} ALTER COLUMN account_id SET NOT NULL");
            }
        }

        // Update unique constraints to be tenant-aware
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['barcode']);
            $table->unique(['account_id', 'barcode']);
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->dropUnique(['batch_number']);
            $table->unique(['account_id', 'batch_number']);
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->unique(['account_id', 'code']);
        });

        Schema::table('labels', function (Blueprint $table) {
            $table->dropUnique(['label_code']);
            $table->unique(['account_id', 'label_code']);
        });
    }

    public function down(): void
    {
        // Note: down migrations for data backfill are best-effort only.
        Schema::table('labels', function (Blueprint $table) {
            $table->dropUnique(['account_id', 'label_code']);
            $table->unique('label_code');
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->dropUnique(['account_id', 'code']);
            $table->unique('code');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->dropUnique(['account_id', 'batch_number']);
            $table->unique('batch_number');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['account_id', 'barcode']);
            $table->unique('barcode');
        });

        // We intentionally do not drop NOT NULL or remove the default account automatically.
    }
};

