<?php

use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\Admin\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('countries', CountryController::class);
    Route::resource('projects', ProjectController::class);
});

require __DIR__.'/settings.php';
