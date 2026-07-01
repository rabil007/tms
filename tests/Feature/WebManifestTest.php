<?php

test('web manifest returns standalone pwa configuration', function () {
    $response = $this->get(route('manifest'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/manifest+json');
    $response->assertHeader('Cache-Control', 'max-age=3600, public');

    $manifest = $response->json();

    expect($manifest)
        ->toHaveKeys(['name', 'short_name', 'description', 'start_url', 'scope', 'display', 'background_color', 'theme_color', 'icons'])
        ->and($manifest['display'])->toBe('standalone')
        ->and($manifest['start_url'])->toBe('/')
        ->and($manifest['scope'])->toBe('/')
        ->and($manifest['background_color'])->toBe('#ffffff')
        ->and($manifest['theme_color'])->toBe('#0f172a');

    expect($manifest['icons'])->toHaveCount(3);

    expect($manifest['icons'][0])->toMatchArray([
        'src' => '/icons/icon-192.png',
        'sizes' => '192x192',
        'type' => 'image/png',
        'purpose' => 'any',
    ]);

    expect($manifest['icons'][1])->toMatchArray([
        'src' => '/icons/icon-512.png',
        'sizes' => '512x512',
        'type' => 'image/png',
        'purpose' => 'any',
    ]);

    expect($manifest['icons'][2])->toMatchArray([
        'src' => '/icons/icon-maskable-512.png',
        'sizes' => '512x512',
        'type' => 'image/png',
        'purpose' => 'maskable',
    ]);
});
