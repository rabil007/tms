<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class WebManifestController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $appName = (string) config('app.name');

        return response()->json([
            'name' => $appName,
            'short_name' => $appName,
            'description' => __('Schedule and crew management for :app.', ['app' => $appName]),
            'start_url' => '/',
            'scope' => '/',
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#0f172a',
            'icons' => [
                [
                    'src' => '/logo.png',
                    'sizes' => '512x512',
                    'type' => 'image/png',
                    'purpose' => 'any maskable',
                ],
            ],
        ], 200, [
            'Content-Type' => 'application/manifest+json',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }
}
