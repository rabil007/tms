<?php

use App\Notifications\SystemNotification;

test('guests do not receive shared notifications', function () {
    $response = $this->get(route('login'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page->where('notifications', null));
});

test('authenticated users receive shared notifications', function () {
    $user = adminUser();

    $user->notify(new SystemNotification(
        title: 'Test alert',
        message: 'Something happened.',
        actionUrl: route('dashboard'),
    ));

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('notifications.unread_count', 1)
        ->has('notifications.items', 1)
        ->where('notifications.items.0.title', 'Test alert')
        ->where('notifications.items.0.message', 'Something happened.'));
});

test('users can mark a notification as read', function () {
    $user = adminUser();

    $user->notify(new SystemNotification(
        title: 'Unread',
        message: 'Please review.',
    ));

    $notificationId = $user->fresh()->notifications->first()->id;

    $response = $this->actingAs($user)->post(route('notifications.read', $notificationId));

    $response->assertRedirect();

    expect($user->fresh()->unreadNotifications)->toHaveCount(0);
});

test('users can mark all notifications as read', function () {
    $user = adminUser();

    $user->notify(new SystemNotification('One', 'First'));
    $user->notify(new SystemNotification('Two', 'Second'));

    $response = $this->actingAs($user)->post(route('notifications.read-all'));

    $response->assertRedirect();

    expect($user->fresh()->unreadNotifications)->toHaveCount(0);
});

test('users cannot mark another users notification as read', function () {
    $owner = adminUser();
    $other = regularUser();

    $owner->notify(new SystemNotification('Private', 'Only for owner'));
    $notificationId = $owner->fresh()->notifications->first()->id;

    $response = $this->actingAs($other)->post(route('notifications.read', $notificationId));

    $response->assertNotFound();
});
