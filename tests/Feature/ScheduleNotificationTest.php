<?php

use App\Models\Country;
use App\Models\Project;
use App\Models\Schedule;
use App\Models\User;
use App\Notifications\ScheduleActivityNotification;
use App\Services\ScheduleAdminNotifier;
use Illuminate\Support\Facades\Notification;
use NotificationChannels\WebPush\WebPushChannel;

test('regular user creating a schedule notifies all admin users', function () {
    $admin = adminUser();
    $user = regularUser();
    $project = Project::factory()->create(['title' => 'NMDC']);

    $response = $this->actingAs($user)->post(route('schedules.store'), validSchedulePayload($project));

    $response->assertRedirect(route('schedules.index'));

    $schedule = Schedule::query()->where('crew_name', 'John Smith')->firstOrFail();

    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => $admin->getMorphClass(),
        'notifiable_id' => $admin->id,
    ]);

    $notification = $admin->fresh()->notifications->first();

    expect($notification)->not->toBeNull();
    expect($notification->data['title'])->toBe('New schedule · '.$project->title);
    expect($notification->data['action_url'])->toBe(route('schedules.show', $schedule));
});

test('regular user updating a schedule notifies all admin users', function () {
    $admin = adminUser();
    $user = regularUser();
    $schedule = Schedule::factory()->create(['crew_name' => 'Jane Crew']);
    $payload = validSchedulePayload($schedule->project);
    $payload['crew_name'] = 'Jane Crew';

    $response = $this->actingAs($user)->put(route('schedules.update', $schedule), $payload);

    $response->assertRedirect(route('schedules.index'));

    $notification = $admin->fresh()->notifications->first();

    expect($notification)->not->toBeNull();
    expect($notification->data['title'])->toBe('Schedule updated · '.$schedule->project->title);
    expect($notification->data['message'])->toContain('Jane Crew');
});

test('admin users creating or updating schedules do not notify other admins', function () {
    Notification::fake();

    $admin = adminUser();
    $otherAdmin = User::factory()->admin()->create();
    $country = Country::factory()->create(['iso2' => 'AE', 'dial_code' => '+971']);
    $project = Project::factory()->create();
    $payload = validSchedulePayload($project, $country);

    $this->actingAs($admin)->post(route('schedules.store'), $payload);

    $schedule = Schedule::query()->firstOrFail();

    $this->actingAs($admin)->put(route('schedules.update', $schedule), $payload);

    Notification::assertNothingSentTo($otherAdmin);
    Notification::assertNothingSentTo($admin);
});

test('schedule activity notification uses database and broadcast channels', function () {
    $admin = adminUser();
    $user = regularUser();
    $schedule = Schedule::factory()->create();

    $notification = new ScheduleActivityNotification($schedule, $user, 'created');

    expect($notification->via($admin))->toContain('database', 'broadcast');
});

test('schedule activity notification uses web push when admin has a subscription', function () {
    $admin = adminUser();
    $user = regularUser();
    $schedule = Schedule::factory()->create();

    $admin->updatePushSubscription(
        'https://example.com/push/endpoint',
        'test-public-key',
        'test-auth-token',
        'aesgcm',
    );

    $notification = new ScheduleActivityNotification($schedule, $user, 'created');

    expect($notification->via($admin->fresh()))->toContain(WebPushChannel::class);
});

test('schedule admin notifier skips admin actors', function () {
    Notification::fake();

    $admin = adminUser();
    $schedule = Schedule::factory()->create();

    app(ScheduleAdminNotifier::class)->notify($schedule, $admin, 'created');

    Notification::assertNothingSent();
});
