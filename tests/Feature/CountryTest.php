<?php

use App\Models\Country;
use App\Models\User;

test('guests are redirected from countries index', function () {
    $response = $this->get(route('countries.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit countries index', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('countries.index'));

    $response->assertOk();
});

test('authenticated users can visit countries create page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('countries.create'));

    $response->assertOk();
});

test('authenticated users can visit country show page', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create();

    $response = $this->actingAs($user)->get(route('countries.show', $country));

    $response->assertOk();
});

test('authenticated users can visit country edit page', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create();

    $response = $this->actingAs($user)->get(route('countries.edit', $country));

    $response->assertOk();
});

test('authenticated users can store a valid country', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('countries.store'), [
        'name' => 'United States',
        'iso2' => 'US',
        'dial_code' => '+1',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('countries.index'));

    $this->assertDatabaseHas('countries', [
        'name' => 'United States',
        'iso2' => 'US',
        'dial_code' => '+1',
    ]);
});

test('store validation fails for missing fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('countries.create'))->post(route('countries.store'), []);

    $response
        ->assertSessionHasErrors(['name', 'iso2', 'dial_code'])
        ->assertRedirect(route('countries.create'));
});

test('store validation fails for invalid iso2', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('countries.create'))->post(route('countries.store'), [
        'name' => 'Invalid',
        'iso2' => 'USA',
        'dial_code' => '+1',
    ]);

    $response
        ->assertSessionHasErrors('iso2')
        ->assertRedirect(route('countries.create'));
});

test('store validation fails for duplicate iso2', function () {
    $user = User::factory()->create();
    Country::factory()->create(['iso2' => 'US']);

    $response = $this->actingAs($user)->from(route('countries.create'))->post(route('countries.store'), [
        'name' => 'Another United States',
        'iso2' => 'US',
        'dial_code' => '+1',
    ]);

    $response
        ->assertSessionHasErrors('iso2')
        ->assertRedirect(route('countries.create'));
});

test('authenticated users can update a country', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create([
        'name' => 'United Kingdom',
        'iso2' => 'GB',
        'dial_code' => '+44',
    ]);

    $response = $this->actingAs($user)->put(route('countries.update', $country), [
        'name' => 'Great Britain',
        'iso2' => 'GB',
        'dial_code' => '+44',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('countries.index'));

    expect($country->fresh())
        ->name->toBe('Great Britain')
        ->iso2->toBe('GB')
        ->dial_code->toBe('+44');
});

test('update validation fails for invalid dial code', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create();

    $response = $this->actingAs($user)->from(route('countries.edit', $country))->put(route('countries.update', $country), [
        'name' => $country->name,
        'iso2' => $country->iso2,
        'dial_code' => 'invalid',
    ]);

    $response
        ->assertSessionHasErrors('dial_code')
        ->assertRedirect(route('countries.edit', $country));
});

test('authenticated users can delete a country', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create();

    $response = $this->actingAs($user)->delete(route('countries.destroy', $country));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('countries.index'));

    $this->assertDatabaseMissing('countries', ['id' => $country->id]);
});

test('countries index search returns matching country', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create(['name' => 'Canada', 'iso2' => 'CA', 'dial_code' => '+1']);
    Country::factory()->create(['name' => 'Mexico', 'iso2' => 'MX', 'dial_code' => '+52']);

    $response = $this->actingAs($user)->get(route('countries.index', ['q' => 'Canada']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/countries/index')
        ->has('countries.data', 1)
        ->where('countries.data.0.id', $country->id)
        ->where('countries.data.0.name', 'Canada'));
});
