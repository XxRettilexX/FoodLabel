<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use App\Models\Modules\Suppliers\Models\Supplier;
use App\Models\Modules\Products\Models\Product;
use App\Models\Modules\Lots\Models\Lot;
use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            return;
        }

        $account = Account::firstOrCreate(['slug' => 'demo'], [
            'name' => 'Demo Locale',
            'status' => 'active',
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@foodlabel.local'],
            ['name' => 'Admin User', 'password' => Hash::make('password')]
        );
        $admin->forceFill(['account_id' => $account->id, 'role' => 'owner', 'status' => 'active'])->save();

        $manager = User::firstOrCreate(
            ['email' => 'manager@foodlabel.local'],
            ['name' => 'Manager User', 'password' => Hash::make('password')]
        );
        $manager->forceFill(['account_id' => $account->id, 'role' => 'manager', 'status' => 'active'])->save();

        $operator = User::firstOrCreate(
            ['email' => 'operator@foodlabel.local'],
            ['name' => 'Operator User', 'password' => Hash::make('password')]
        );
        $operator->forceFill(['account_id' => $account->id, 'role' => 'warehouse', 'status' => 'active'])->save();

        $supplier = Supplier::firstOrCreate(
            ['account_id' => $account->id, 'name' => 'Fattorie Rossi SPA'],
            [
                'contact_email' => 'ordini@fattorierossi.it',
                'vat_number' => 'IT12345678901',
            ]
        );

        $product1 = Product::firstOrCreate(
            ['account_id' => $account->id, 'name' => 'Farina Tipo 00'],
            [
                'supplier_id' => $supplier->id,
                'description' => 'Sacco da 25Kg',
                'default_shelf_life_days' => 180,
            ]
        );

        $product2 = Product::firstOrCreate(
            ['account_id' => $account->id, 'name' => 'Passata di Pomodoro Mutti'],
            [
                'supplier_id' => $supplier->id,
                'description' => 'Latta da 5kg',
                'default_shelf_life_days' => 365,
            ]
        );

        $lot1 = Lot::firstOrCreate(
            ['account_id' => $account->id, 'batch_number' => 'LOT-FAR-001'],
            [
                'product_id' => $product1->id,
                'user_id' => $operator->id,
                'produced_at' => Carbon::now()->subDays(10),
                'expires_at' => Carbon::now()->addDays(170),
                'initial_quantity' => 10,
                'current_quantity' => 8,
                'unit' => 'pz',
                'status' => 'active',
            ]
        );

        InventoryMovement::firstOrCreate(
            [
                'account_id' => $account->id,
                'lot_id' => $lot1->id,
                'type' => 'IN',
                'quantity' => 10,
            ],
            [
                'user_id' => $operator->id,
                'notes' => 'Carico Iniziale',
                'created_at' => Carbon::now()->subDays(2),
            ]
        );

        InventoryMovement::firstOrCreate(
            [
                'account_id' => $account->id,
                'lot_id' => $lot1->id,
                'type' => 'OUT',
                'quantity' => 2,
            ],
            [
                'user_id' => $operator->id,
                'notes' => 'Utilizzo per impasto pizza',
                'created_at' => Carbon::now(),
            ]
        );
    }
}
