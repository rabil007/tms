<?php

use App\Models\ApplicationSetting;
use App\Services\ApplicationConfigService;

test('guests cannot access application settings', function () {
    $response = $this->get(route('application.edit'));

    $response->assertRedirect(route('login'));
});

test('regular users cannot access application settings', function () {
    $response = $this->actingAs(regularUser())->get(route('application.edit'));

    $response->assertForbidden();
});

test('regular users cannot update application settings', function () {
    $response = $this->actingAs(regularUser())->patch(route('application.update'), [
        'name' => 'New App Name',
    ]);

    $response->assertForbidden();
});

test('admins can view application settings', function () {
    ApplicationSetting::query()->create([
        'name' => 'Overseas',
    ]);

    $response = $this->actingAs(adminUser())->get(route('application.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/application')
        ->where('applicationName', 'Overseas'));
});

test('admins can update application name', function () {
    ApplicationSetting::query()->create([
        'name' => 'Laravel',
    ]);

    $response = $this->actingAs(adminUser())->patch(route('application.update'), [
        'name' => 'Overseas TMS',
    ]);

    $response->assertRedirect(route('application.edit'));

    expect(ApplicationSetting::current()->name)->toBe('Overseas TMS');
    expect(config('app.name'))->toBe('Overseas TMS');
});

test('updated application name is shared with inertia', function () {
    ApplicationSetting::query()->create([
        'name' => 'Overseas TMS',
    ]);

    app(ApplicationConfigService::class)->apply();

    $response = $this->actingAs(adminUser())->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('name', 'Overseas TMS'));
});

test('application settings require a name', function () {
    ApplicationSetting::query()->create([
        'name' => 'Overseas',
    ]);

    $response = $this->actingAs(adminUser())->patch(route('application.update'), [
        'name' => '',
    ]);

    $response->assertSessionHasErrors('name');
});
