<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('guests are redirected from users index', function () {
    $response = $this->get(route('users.index'));

    $response->assertRedirect(route('login'));
});

test('non-admin users cannot visit users index', function () {
    $user = regularUser();

    $response = $this->actingAs($user)->get(route('users.index'));

    $response->assertForbidden();
});

test('admin users can visit users index', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('users.index'));

    $response->assertOk();
});

test('admin users can visit users create page', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('users.create'));

    $response->assertOk();
});

test('admin users can store a valid user', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'user')->firstOrFail();

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'role_id' => $role->id,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'role_id' => $role->id,
    ]);
});

test('store validation fails for duplicate email', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'user')->firstOrFail();
    User::factory()->create(['email' => 'jane@example.com', 'role_id' => $role->id]);

    $response = $this->actingAs($admin)->from(route('users.create'))->post(route('users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'role_id' => $role->id,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response
        ->assertSessionHasErrors('email')
        ->assertRedirect(route('users.create'));
});

test('admin users can update a user without changing password', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'user')->firstOrFail();
    $user = User::factory()->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'role_id' => $role->id,
    ]);

    $response = $this->actingAs($admin)->put(route('users.update', $user), [
        'name' => 'Jane Smith',
        'email' => 'jane.smith@example.com',
        'role_id' => $role->id,
        'password' => '',
        'password_confirmation' => '',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    $user->refresh();

    expect($user)
        ->name->toBe('Jane Smith')
        ->email->toBe('jane.smith@example.com');

    expect(Hash::check('password', $user->password))->toBeTrue();
});

test('admin users can update a user password', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'user')->firstOrFail();
    $user = User::factory()->create(['role_id' => $role->id]);

    $response = $this->actingAs($admin)->put(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role_id' => $role->id,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeTrue();
});

test('admin users cannot delete themselves', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

    $response->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('users index excludes the authenticated user', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'user')->firstOrFail();
    $otherUser = User::factory()->create([
        'name' => 'Jane Doe',
        'role_id' => $role->id,
    ]);

    $response = $this->actingAs($admin)->get(route('users.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data', 1)
        ->where('users.data.0.id', $otherUser->id));
});

test('admin users cannot view or edit their own account in users module', function () {
    $admin = adminUser();

    $this->actingAs($admin)->get(route('users.show', $admin))->assertForbidden();
    $this->actingAs($admin)->get(route('users.edit', $admin))->assertForbidden();
});

test('admin users can delete other users', function () {
    $admin = adminUser();
    $user = regularUser();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $user));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('regular users can access schedules but not projects', function () {
    $user = regularUser();

    $this->actingAs($user)->get(route('schedules.index'))->assertOk();
    $this->actingAs($user)->get(route('projects.index'))->assertForbidden();
});

test('users index search returns matching user', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'user')->firstOrFail();
    $user = User::factory()->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'role_id' => $role->id,
    ]);
    User::factory()->create(['name' => 'John Smith', 'role_id' => $role->id]);

    $response = $this->actingAs($admin)->get(route('users.index', ['q' => 'Jane']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data', 1)
        ->where('users.data.0.id', $user->id)
        ->where('users.data.0.name', 'Jane Doe'));
});
