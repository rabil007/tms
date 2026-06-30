<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's roles.
     */
    public function run(): void
    {
        Role::query()->updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin'],
        );

        Role::query()->updateOrCreate(
            ['slug' => 'user'],
            ['name' => 'User'],
        );
    }
}
