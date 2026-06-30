<?php

test('insecure requests redirect to https when app url uses https', function () {
    config(['app.url' => 'https://tms.test']);

    $response = $this->get('http://tms.test/dashboard');

    $response->assertRedirect('https://tms.test/dashboard');
});

test('secure requests are not redirected', function () {
    config(['app.url' => 'https://tms.test']);

    $user = adminUser();

    $response = $this->actingAs($user)->get('https://tms.test/dashboard');

    $response->assertOk();
});
