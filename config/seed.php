<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Initial Admin User
    |--------------------------------------------------------------------------
    |
    | Used by AdminUserSeeder on deploy. Set ADMIN_PASSWORD in production
    | before running php artisan db:seed.
    |
    */

    'admin' => [
        'name' => env('ADMIN_NAME', 'Test User'),
        'email' => env('ADMIN_EMAIL', 'test@example.com'),
        'password' => env('ADMIN_PASSWORD', 'password'),
    ],

];
