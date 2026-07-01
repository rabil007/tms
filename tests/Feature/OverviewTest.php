<?php

use App\Models\Project;
use App\Models\Schedule;
use App\Notifications\SystemNotification;
use Illuminate\Support\Carbon;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('overview'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the overview page', function () {
    $user = regularUser();

    $response = $this->actingAs($user)->get(route('overview'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('overview')
        ->has('stats')
        ->has('recentSchedules')
        ->has('recentActivity'));
});

test('overview includes schedule stats and recent data', function () {
    $user = regularUser();
    $project = Project::factory()->create();

    Schedule::factory()->create([
        'project_id' => $project->id,
        'scheduled_date' => today(),
    ]);

    Schedule::factory()->create([
        'project_id' => $project->id,
        'scheduled_date' => today()->addDays(3),
    ]);

    $user->notify(new SystemNotification(
        title: 'Schedule alert',
        message: 'A schedule was updated.',
        actionUrl: route('schedules.index'),
    ));

    $response = $this->actingAs($user)->get(route('overview'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('stats.schedules_today', 1)
        ->where('stats.schedules_upcoming', 2)
        ->where('stats.schedules_total', 2)
        ->has('recentSchedules', 2)
        ->has('recentActivity', 1)
        ->where('recentActivity.0.title', 'Schedule alert'));
});

test('admin users receive admin-only stats', function () {
    $admin = adminUser();
    $otherUser = regularUser();

    Project::factory()->count(2)->create();

    $response = $this->actingAs($admin)->get(route('overview'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('stats.users_count', 1)
        ->where('stats.projects_count', 2));
});

test('non-admin users do not receive admin-only stats', function () {
    $user = regularUser();

    Project::factory()->count(2)->create();

    $response = $this->actingAs($user)->get(route('overview'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->missing('stats.users_count')
        ->missing('stats.projects_count'));
});

test('recent schedules are ordered by scheduled date descending', function () {
    $user = regularUser();
    $project = Project::factory()->create();

    $older = Schedule::factory()->create([
        'project_id' => $project->id,
        'scheduled_date' => Carbon::parse('2026-01-10'),
        'pick_up_time' => '09:00',
    ]);

    $newer = Schedule::factory()->create([
        'project_id' => $project->id,
        'scheduled_date' => Carbon::parse('2026-06-15'),
        'pick_up_time' => '14:30',
    ]);

    $response = $this->actingAs($user)->get(route('overview'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('recentSchedules.0.id', $newer->id)
        ->where('recentSchedules.1.id', $older->id));
});
