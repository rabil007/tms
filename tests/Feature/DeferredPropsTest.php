<?php

use App\Notifications\SystemNotification;

test('overview exposes deferred props on initial visit', function () {
    $user = regularUser();

    $response = $this->actingAs($user)->get(route('overview'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('overview')
        ->loadDeferredProps(fn ($reload) => $reload
            ->has('stats')
            ->has('analytics')
            ->has('recentSchedules')
            ->has('recentActivity')));
});

test('schedules index exposes deferred stat and filter props', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('schedules.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules')
        ->loadDeferredProps(fn ($reload) => $reload
            ->has('totalCount')
            ->has('todayCount')
            ->has('projects')));
});

test('users index exposes deferred counts prop', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('users.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users')
        ->loadDeferredProps(fn ($reload) => $reload->has('counts')));
});

test('authenticated users receive immediate unread notification count', function () {
    $user = adminUser();

    $user->notify(new SystemNotification(
        title: 'Test alert',
        message: 'Something happened.',
        actionUrl: route('dashboard'),
    ));

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('notificationsUnreadCount', 1)
        ->loadDeferredProps(fn ($reload) => $reload
            ->has('notifications.items', 1)
            ->where('notifications.items.0.title', 'Test alert')));
});
