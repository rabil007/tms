<?php

use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PushDebugController;
use App\Http\Controllers\PushSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::post('internal/push-debug', PushDebugController::class)
    ->name('push-debug.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('schedules', ScheduleController::class);

    Route::post('notifications/test', [NotificationController::class, 'sendTest'])
        ->name('notifications.test');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');

    Route::post('push-subscriptions', [PushSubscriptionController::class, 'store'])
        ->name('push-subscriptions.store');
    Route::delete('push-subscriptions', [PushSubscriptionController::class, 'destroy'])
        ->name('push-subscriptions.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::resource('countries', CountryController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
