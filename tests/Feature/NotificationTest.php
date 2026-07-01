<?php

use App\Models\MailSetting;
use App\Notifications\DeviceTestPushNotification;
use App\Notifications\SystemNotification;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Notification;
use NotificationChannels\WebPush\WebPushChannel;

test('guests do not receive shared notifications', function () {
    $response = $this->get(route('login'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page->where('notificationsUnreadCount', 0));
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
        ->where('notificationsUnreadCount', 1)
        ->loadDeferredProps(fn ($reload) => $reload
            ->has('notifications.items', 1)
            ->where('notifications.items.0.title', 'Test alert')
            ->where('notifications.items.0.message', 'Something happened.')));
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

test('authenticated users can send a test notification', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->post(route('notifications.test'));

    $response->assertRedirect();

    expect($user->fresh()->unreadNotifications)->toHaveCount(1);

    $notification = $user->fresh()->notifications->first();

    expect($notification->data['title'])->toBe('Push notifications enabled');
});

test('test notification uses web push channel when user has a subscription', function () {
    $user = adminUser();

    $user->updatePushSubscription(
        'https://example.com/push/test-endpoint',
        'test-public-key',
        'test-auth-token',
        'aesgcm',
    );

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $notification = new TestNotification;

    expect($notification->via($user->fresh()))->toContain(WebPushChannel::class);
});

test('notification settings page lists push subscriptions', function () {
    $user = adminUser();

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-1',
        'test-public-key',
        'test-auth-token',
        'aes128gcm',
    );

    $subscription = $user->fresh()->pushSubscriptions->first();
    $subscription->forceFill([
        'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ])->save();

    $response = $this->actingAs($user)->get(route('notifications.edit'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->has('pushSubscriptions', 1)
        ->where('pushSubscriptions.0.id', $subscription->id)
        ->where('pushSubscriptions.0.label', 'Chrome on macOS')
        ->where('pushSubscriptions.0.provider', 'Chrome')
        ->where('pushSubscriptions.0.content_encoding', 'aes128gcm'));
});

test('push subscription store saves user agent', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->post(route('push-subscriptions.store'), [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-2',
        'keys' => [
            'p256dh' => 'test-public-key',
            'auth' => 'test-auth-token',
        ],
        'contentEncoding' => 'aes128gcm',
        'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ]);

    $response->assertRedirect();

    $subscription = $user->fresh()->pushSubscriptions->first();

    expect($subscription)->not->toBeNull();
    expect($subscription->user_agent)->toContain('iPhone');
});

test('users cannot send device test push for another users subscription', function () {
    $owner = adminUser();
    $other = regularUser();

    $owner->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-3',
        'test-public-key',
        'test-auth-token',
        'aes128gcm',
    );

    $subscriptionId = $owner->fresh()->pushSubscriptions->first()->id;

    $response = $this->actingAs($other)->post(route('push-subscriptions.test', $subscriptionId));

    $response->assertNotFound();
});

test('device test push notification only uses web push channel', function () {
    $user = adminUser();

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-4',
        'test-public-key',
        'test-auth-token',
        'aes128gcm',
    );

    $subscriptionId = $user->fresh()->pushSubscriptions->first()->id;
    $notification = new DeviceTestPushNotification($subscriptionId);

    expect($notification->via($user->fresh()))->toBe([WebPushChannel::class]);
});

test('device test push targets only the selected subscription', function () {
    $user = adminUser();

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-5',
        'test-public-key-one',
        'test-auth-token-one',
        'aes128gcm',
    );

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-6',
        'test-public-key-two',
        'test-auth-token-two',
        'aes128gcm',
    );

    $subscriptions = $user->fresh()->pushSubscriptions;
    $target = $subscriptions->last();
    $notification = new DeviceTestPushNotification($target->id);

    $routed = $user->routeNotificationFor(WebPushChannel::class, $notification);

    expect($routed)->toHaveCount(1);
    expect($routed->first()->id)->toBe($target->id);
});

test('device test push does not create in app notification', function () {
    Notification::fake();

    $user = adminUser();

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-7',
        'test-public-key',
        'test-auth-token',
        'aes128gcm',
    );

    $subscriptionId = $user->fresh()->pushSubscriptions->first()->id;

    $response = $this->actingAs($user)->post(route('push-subscriptions.test', $subscriptionId));

    $response->assertRedirect();

    Notification::assertSentTo(
        $user,
        DeviceTestPushNotification::class,
        fn (DeviceTestPushNotification $notification): bool => $notification->pushSubscriptionId === $subscriptionId,
    );

    expect($user->fresh()->notifications)->toHaveCount(0);
});

test('users can remove their own push subscription', function () {
    $user = adminUser();

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-8',
        'test-public-key',
        'test-auth-token',
        'aes128gcm',
    );

    $endpoint = 'https://fcm.googleapis.com/fcm/send/device-8';

    $response = $this->actingAs($user)->delete(route('push-subscriptions.destroy'), [
        'endpoint' => $endpoint,
    ]);

    $response->assertRedirect();

    expect($user->fresh()->pushSubscriptions)->toHaveCount(0);
});

test('removing push subscription updates notification settings list', function () {
    $user = adminUser();

    $user->updatePushSubscription(
        'https://fcm.googleapis.com/fcm/send/device-9',
        'test-public-key',
        'test-auth-token',
        'aes128gcm',
    );

    $this->actingAs($user)->delete(route('push-subscriptions.destroy'), [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-9',
    ]);

    $response = $this->actingAs($user)->get(route('notifications.edit'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page->has('pushSubscriptions', 0));
});
