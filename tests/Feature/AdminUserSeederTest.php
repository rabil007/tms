<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Hash;

test('admin user seeder creates an admin account with configured credentials', function () {
    (new RoleSeeder)->run();

    config([
        'seed.admin.name' => 'Production Admin',
        'seed.admin.email' => 'admin@example.com',
        'seed.admin.password' => 'secret-password',
    ]);

    (new AdminUserSeeder)->run();

    $user = User::query()->where('email', 'admin@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->name)->toBe('Production Admin');
    expect($user->isAdmin())->toBeTrue();
    expect(Hash::check('secret-password', $user->password))->toBeTrue();
});

test('admin user seeder updates an existing admin account', function () {
    (new RoleSeeder)->run();

    config([
        'seed.admin.name' => 'Admin',
        'seed.admin.email' => 'admin@example.com',
        'seed.admin.password' => 'old-password',
    ]);

    (new AdminUserSeeder)->run();

    config(['seed.admin.password' => 'new-password']);

    (new AdminUserSeeder)->run();

    $user = User::query()->where('email', 'admin@example.com')->firstOrFail();

    expect(User::query()->count())->toBe(1);
    expect(Hash::check('new-password', $user->password))->toBeTrue();
});

test('admin user seeder requires a password', function () {
    (new RoleSeeder)->run();

    config([
        'seed.admin.name' => 'Admin',
        'seed.admin.email' => 'admin@example.com',
        'seed.admin.password' => '',
    ]);

    expect(fn () => (new AdminUserSeeder)->run())
        ->toThrow(RuntimeException::class, 'ADMIN_PASSWORD must be set');
});

test('admin user seeder rejects the default password in production', function () {
    (new RoleSeeder)->run();

    config([
        'seed.admin.name' => 'Admin',
        'seed.admin.email' => 'admin@example.com',
        'seed.admin.password' => 'password',
    ]);

    app()->detectEnvironment(fn () => 'production');

    expect(fn () => (new AdminUserSeeder)->run())
        ->toThrow(RuntimeException::class, 'Set a strong ADMIN_PASSWORD in production');
});
