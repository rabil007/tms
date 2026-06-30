<?php

use App\Models\Role;
use App\Models\User;

test('guests are redirected from roles index', function () {
    $response = $this->get(route('roles.index'));

    $response->assertRedirect(route('login'));
});

test('non-admin users cannot visit roles index', function () {
    $user = regularUser();

    $response = $this->actingAs($user)->get(route('roles.index'));

    $response->assertForbidden();
});

test('admin users can visit roles index', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('roles.index'));

    $response->assertOk();
});

test('admin users can visit roles create page', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('roles.create'));

    $response->assertOk();
});

test('admin users can visit role show page', function () {
    $user = adminUser();
    $role = Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);

    $response = $this->actingAs($user)->get(route('roles.show', $role));

    $response->assertOk();
});

test('admin users can store a valid role', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->post(route('roles.store'), [
        'name' => 'Manager',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseHas('roles', [
        'name' => 'Manager',
        'slug' => 'manager',
    ]);
});

test('store validation fails for duplicate role name', function () {
    $user = adminUser();
    Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);

    $response = $this->actingAs($user)->from(route('roles.create'))->post(route('roles.store'), [
        'name' => 'Manager',
    ]);

    $response
        ->assertSessionHasErrors('name')
        ->assertRedirect(route('roles.create'));
});

test('admin users can update a role', function () {
    $user = adminUser();
    $role = Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);

    $response = $this->actingAs($user)->put(route('roles.update', $role), [
        'name' => 'Supervisor',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('roles.index'));

    expect($role->fresh())
        ->name->toBe('Supervisor');
});

test('admin users cannot delete system roles', function () {
    $user = adminUser();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();

    $response = $this->actingAs($user)->from(route('roles.index'))->delete(route('roles.destroy', $role));

    $response
        ->assertSessionHasErrors('role')
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseHas('roles', ['id' => $role->id]);
});

test('admin users cannot delete roles assigned to users', function () {
    $user = adminUser();
    $role = Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);
    User::factory()->create(['role_id' => $role->id]);

    $response = $this->actingAs($user)->from(route('roles.index'))->delete(route('roles.destroy', $role));

    $response
        ->assertSessionHasErrors('role')
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseHas('roles', ['id' => $role->id]);
});

test('admin users can delete unused custom roles', function () {
    $user = adminUser();
    $role = Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);

    $response = $this->actingAs($user)->delete(route('roles.destroy', $role));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});

test('roles index search returns matching role', function () {
    $user = adminUser();
    $role = Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);
    Role::factory()->create(['name' => 'Supervisor', 'slug' => 'supervisor']);

    $response = $this->actingAs($user)->get(route('roles.index', ['q' => 'Manager']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/roles/index')
        ->has('roles.data', 1)
        ->where('roles.data.0.id', $role->id)
        ->where('roles.data.0.name', 'Manager'));
});
