<?php

namespace Database\Seeders;

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
        $admin = User::firstOrCreate(['email' => 'admin@foodlabel.local'], [
            'name' => 'Admin User',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $manager = User::firstOrCreate(['email' => 'manager@foodlabel.local'], [
            'name' => 'Manager User',
            'role' => 'manager',
            'password' => Hash::make('password'),
        ]);

        $operator = User::firstOrCreate(['email' => 'operator@foodlabel.local'], [
            'name' => 'Operator User',
            'role' => 'operator',
            'password' => Hash::make('password'),
        ]);

        $supplier = Supplier::create([
            'name' => 'Fattorie Rossi SPA',
            'contact_email' => 'ordini@fattorierossi.it',
            'vat_number' => 'IT12345678901'
        ]);

        $product1 = Product::create([
            'name' => 'Farina Tipo 00',
            'supplier_id' => $supplier->id,
            'description' => 'Sacco da 25Kg',
            'default_shelf_life_days' => 180
        ]);

        $product2 = Product::create([
            'name' => 'Passata di Pomodoro Mutti',
            'supplier_id' => $supplier->id,
            'description' => 'Latta da 5kg',
            'default_shelf_life_days' => 365
        ]);

        $lot1 = Lot::create([
            'product_id' => $product1->id,
            'user_id' => $operator->id,
            'batch_number' => 'LOT-FAR-001',
            'produced_at' => Carbon::now()->subDays(10),
            'expires_at' => Carbon::now()->addDays(170),
            'initial_quantity' => 10,
            'current_quantity' => 8,
            'unit' => 'pz',
            'status' => 'active'
        ]);

        InventoryMovement::create([
            'lot_id' => $lot1->id,
            'user_id' => $operator->id,
            'type' => 'IN',
            'quantity' => 10,
            'notes' => 'Carico Iniziale',
            'created_at' => Carbon::now()->subDays(2)
        ]);

        InventoryMovement::create([
            'lot_id' => $lot1->id,
            'user_id' => $operator->id,
            'type' => 'OUT',
            'quantity' => 2,
            'notes' => 'Utilizzo per impasto pizza',
            'created_at' => Carbon::now()
        ]);
    }
}
