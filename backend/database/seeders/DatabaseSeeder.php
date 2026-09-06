<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Demo Admin User
        User::updateOrCreate(
            ['email' => 'admin@ecart.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // 2. Seed Demo Customer User
        User::updateOrCreate(
            ['email' => 'customer@ecart.test'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );

        // 3. Seed Catalog (Categories & Products)
        $this->call(CatalogSeeder::class);
    }
}
