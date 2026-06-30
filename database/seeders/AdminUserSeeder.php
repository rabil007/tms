<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the initial admin account for first login.
     */
    public function run(): void
    {
        $name = (string) config('seed.admin.name');
        $email = (string) config('seed.admin.email');
        $password = (string) config('seed.admin.password');

        if ($email === '') {
            throw new RuntimeException('ADMIN_EMAIL must be set before seeding the admin user.');
        }

        if ($password === '') {
            throw new RuntimeException('ADMIN_PASSWORD must be set before seeding the admin user.');
        }

        if (app()->isProduction() && $password === 'password') {
            throw new RuntimeException('Set a strong ADMIN_PASSWORD in production before seeding.');
        }

        $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'role_id' => $adminRole->id,
                'password' => $password,
                'email_verified_at' => now(),
            ],
        );
    }
}
