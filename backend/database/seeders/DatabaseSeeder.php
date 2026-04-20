<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@foodlabel.local',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@foodlabel.local',
            'role' => 'manager',
        ]);

        User::factory()->create([
            'name' => 'Operator User',
            'email' => 'operator@foodlabel.local',
            'role' => 'operator',
        ]);
    }
}
