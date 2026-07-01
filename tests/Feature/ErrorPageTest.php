<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

function inertiaHeaders(): array
{
    $middleware = app(HandleInertiaRequests::class);
    $version = $middleware->version(Request::create('/'));

    return array_filter([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
    ]);
}

function assertInertiaErrorPage($response, int $status): void
{
    $response->assertStatus($status);
    $response->assertHeader('X-Inertia', 'true');
    $response->assertJsonPath('component', 'error-page');
    $response->assertJsonPath('props.status', $status);
}

test('production inertia requests render custom error page for 404', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['app.debug' => false]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withHeaders(inertiaHeaders())
        ->get('/this-route-does-not-exist');

    assertInertiaErrorPage($response, 404);
});

test('production inertia requests render custom error page for 403', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['app.debug' => false]);

    $user = User::factory()->create();

    Route::get('/test-forbidden', fn () => abort(403))->middleware('web');

    $response = $this->actingAs($user)
        ->withHeaders(inertiaHeaders())
        ->get('/test-forbidden');

    assertInertiaErrorPage($response, 403);
});

test('production inertia requests render custom error page for 500', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['app.debug' => false]);

    $user = User::factory()->create();

    Route::get('/test-server-error', function () {
        throw new RuntimeException('Simulated server error');
    })->middleware('web');

    $response = $this->actingAs($user)
        ->withHeaders(inertiaHeaders())
        ->get('/test-server-error');

    assertInertiaErrorPage($response, 500);
});

test('testing environment keeps default laravel error responses', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withHeaders(inertiaHeaders())
        ->get('/this-route-does-not-exist');

    $response->assertNotFound();
    expect($response->headers->get('X-Inertia'))->not->toBe('true');
});
