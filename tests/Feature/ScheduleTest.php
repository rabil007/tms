<?php

use App\Enums\ScheduleStatus;
use App\Models\Country;
use App\Models\Project;
use App\Models\Schedule;
use App\Models\User;

/**
 * @return array<string, mixed>
 */
function validSchedulePayload(?Project $project = null, ?Country $country = null): array
{
    $project ??= Project::factory()->create();
    $country ??= Country::factory()->create(['iso2' => 'AE', 'dial_code' => '+971']);

    return [
        'crew_name' => 'John Smith',
        'scheduled_date' => '2026-07-15',
        'country_id' => $country->id,
        'crew_phone' => '501234567',
        'project_id' => $project->id,
        'pick_up_location' => 'Dubai Airport Terminal 1',
        'drop_off_location' => 'Marina Hotel',
        'pick_up_time' => '08:30',
        'remarks' => 'VIP pickup',
    ];
}

test('guests are redirected from schedules index', function () {
    $response = $this->get(route('schedules.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit schedules index', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('schedules.index'));

    $response->assertOk();
});

test('authenticated users can visit schedules create page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('schedules.create'));

    $response->assertOk();
});

test('authenticated users can visit schedule show page', function () {
    $user = User::factory()->create();
    $schedule = Schedule::factory()->create();

    $response = $this->actingAs($user)->get(route('schedules.show', $schedule));

    $response
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/schedules/show')
            ->has('schedule.created_at')
        );
});

test('authenticated users can visit schedule edit page', function () {
    $user = User::factory()->create();
    $schedule = Schedule::factory()->pending()->create();

    $response = $this->actingAs($user)->get(route('schedules.edit', $schedule));

    $response->assertOk();
});

test('authenticated users can store a valid schedule', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['title' => 'NMDC']);

    $response = $this->actingAs($user)->post(route('schedules.store'), validSchedulePayload($project));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('schedules.index'));

    $this->assertDatabaseHas('schedules', [
        'crew_name' => 'John Smith',
        'crew_contact' => '+971501234567',
        'project_id' => $project->id,
        'pick_up_location' => 'Dubai Airport Terminal 1',
        'status' => ScheduleStatus::Pending->value,
        'user_id' => $user->id,
        'created_by_id' => $user->id,
    ]);
});

test('admin users store schedules as completed', function () {
    $admin = adminUser();
    $project = Project::factory()->create(['title' => 'NMDC']);

    $response = $this->actingAs($admin)->post(route('schedules.store'), validSchedulePayload($project));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('schedules.index'));

    $this->assertDatabaseHas('schedules', [
        'crew_name' => 'John Smith',
        'status' => ScheduleStatus::Completed->value,
        'user_id' => $admin->id,
        'created_by_id' => $admin->id,
    ]);
});

test('regular user updating a completed schedule is forbidden', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->completed()->create([
        'user_id' => $user->id,
        'crew_name' => 'Jane Doe',
    ]);

    $response = $this->actingAs($user)->put(route('schedules.update', $schedule), [
        ...validSchedulePayload($schedule->project),
        'crew_name' => 'Jane Smith',
    ]);

    $response->assertForbidden();

    expect($schedule->fresh())
        ->crew_name->toBe('Jane Doe')
        ->status->toBe(ScheduleStatus::Completed);
});

test('regular user updating a pending schedule keeps status pending', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->pending()->create([
        'user_id' => $user->id,
        'crew_name' => 'Jane Doe',
    ]);

    $response = $this->actingAs($user)->put(route('schedules.update', $schedule), [
        ...validSchedulePayload($schedule->project),
        'crew_name' => 'Jane Smith',
    ]);

    $response->assertRedirect(route('schedules.index'));

    expect($schedule->fresh()->status)->toBe(ScheduleStatus::Pending);
});

test('admin updating a schedule does not change status', function () {
    $admin = adminUser();
    $schedule = Schedule::factory()->pending()->create(['crew_name' => 'Jane Doe']);

    $response = $this->actingAs($admin)->put(route('schedules.update', $schedule), [
        ...validSchedulePayload($schedule->project),
        'crew_name' => 'Jane Smith',
    ]);

    $response->assertRedirect(route('schedules.index'));

    expect($schedule->fresh())
        ->crew_name->toBe('Jane Smith')
        ->status->toBe(ScheduleStatus::Pending);
});

test('admin can approve a pending schedule', function () {
    $admin = adminUser();
    $schedule = Schedule::factory()->pending()->create();

    $response = $this->actingAs($admin)->post(route('schedules.approve', $schedule));

    $response->assertRedirect();

    expect($schedule->fresh()->status)->toBe(ScheduleStatus::Completed);
});

test('regular users cannot approve schedules', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->pending()->create();

    $response = $this->actingAs($user)->post(route('schedules.approve', $schedule));

    $response->assertForbidden();

    expect($schedule->fresh()->status)->toBe(ScheduleStatus::Pending);
});

test('approving an already completed schedule returns an error', function () {
    $admin = adminUser();
    $schedule = Schedule::factory()->completed()->create();

    $response = $this->actingAs($admin)->post(route('schedules.approve', $schedule));

    $response->assertStatus(422);

    expect($schedule->fresh()->status)->toBe(ScheduleStatus::Completed);
});

test('schedules index includes pending count', function () {
    $user = User::factory()->create();
    Schedule::factory()->pending()->count(2)->create();
    Schedule::factory()->completed()->create();

    $response = $this->actingAs($user)->get(route('schedules.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->loadDeferredProps(fn ($reload) => $reload
            ->where('pendingCount', 2)));
});

test('schedules index can filter by pending status', function () {
    $user = User::factory()->create();
    $pending = Schedule::factory()->pending()->create(['crew_name' => 'Pending Crew']);
    Schedule::factory()->completed()->create(['crew_name' => 'Completed Crew']);

    $response = $this->actingAs($user)->get(route('schedules.index', ['status' => 'pending']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.id', $pending->id));
});

test('store validation fails for missing fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('schedules.create'))->post(route('schedules.store'), []);

    $response
        ->assertSessionHasErrors([
            'crew_name',
            'scheduled_date',
            'country_id',
            'crew_phone',
            'project_id',
            'pick_up_location',
            'drop_off_location',
            'pick_up_time',
        ])
        ->assertRedirect(route('schedules.create'));
});

test('store validation fails for invalid phone', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('schedules.create'))->post(route('schedules.store'), [
        ...validSchedulePayload(),
        'crew_phone' => '12',
    ]);

    $response
        ->assertSessionHasErrors('crew_phone')
        ->assertRedirect(route('schedules.create'));
});

test('store validation fails for invalid project', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('schedules.create'))->post(route('schedules.store'), [
        ...validSchedulePayload(),
        'project_id' => 99999,
    ]);

    $response
        ->assertSessionHasErrors('project_id')
        ->assertRedirect(route('schedules.create'));
});

test('authenticated users can update a schedule', function () {
    $user = User::factory()->create();
    $schedule = Schedule::factory()->pending()->create(['crew_name' => 'Jane Doe']);

    $response = $this->actingAs($user)->put(route('schedules.update', $schedule), [
        ...validSchedulePayload($schedule->project),
        'crew_name' => 'Jane Smith',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('schedules.index'));

    expect($schedule->fresh())
        ->crew_name->toBe('Jane Smith');
});

test('regular users cannot edit completed schedules', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->completed()->create();

    $response = $this->actingAs($user)->get(route('schedules.edit', $schedule));

    $response->assertForbidden();
});

test('regular users cannot update completed schedules', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->completed()->create(['crew_name' => 'Jane Doe']);

    $response = $this->actingAs($user)->put(route('schedules.update', $schedule), [
        ...validSchedulePayload($schedule->project),
        'crew_name' => 'Jane Smith',
    ]);

    $response->assertForbidden();

    expect($schedule->fresh()->crew_name)->toBe('Jane Doe');
});

test('regular users cannot delete completed schedules', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->completed()->create();

    $response = $this->actingAs($user)->delete(route('schedules.destroy', $schedule));

    $response->assertForbidden();

    $this->assertDatabaseHas('schedules', ['id' => $schedule->id]);
});

test('regular users can still edit pending schedules', function () {
    $user = regularUser();
    $schedule = Schedule::factory()->pending()->create();

    $response = $this->actingAs($user)->get(route('schedules.edit', $schedule));

    $response->assertOk();
});

test('admins can edit completed schedules', function () {
    $admin = adminUser();
    $schedule = Schedule::factory()->completed()->create();

    $response = $this->actingAs($admin)->get(route('schedules.edit', $schedule));

    $response->assertOk();
});

test('authenticated users can delete a schedule', function () {
    $user = User::factory()->create();
    $schedule = Schedule::factory()->pending()->create();

    $response = $this->actingAs($user)->delete(route('schedules.destroy', $schedule));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('schedules.index'));

    $this->assertDatabaseMissing('schedules', ['id' => $schedule->id]);
});

test('schedules index loads without sort query param', function () {
    $user = User::factory()->create();
    Schedule::factory()->create(['crew_name' => 'Alpha Crew']);

    $response = $this->actingAs($user)->get(route('schedules.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.crew_name', 'Alpha Crew')
        ->has('schedules.data.0.created_at')
        ->has('schedules.data.0.created_by.name'));
});

test('schedules index defaults to newest created first', function () {
    $user = User::factory()->create();
    $older = Schedule::factory()->create([
        'crew_name' => 'Older Crew',
        'created_at' => now()->subDay(),
    ]);
    $latest = Schedule::factory()->create([
        'crew_name' => 'Latest Crew',
        'created_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('schedules.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 2)
        ->where('schedules.data.0.id', $latest->id)
        ->where('schedules.data.1.id', $older->id));
});

test('schedules index search returns matching crew name', function () {
    $user = User::factory()->create();
    $schedule = Schedule::factory()->create(['crew_name' => 'Alpha Crew']);
    Schedule::factory()->create(['crew_name' => 'Beta Crew']);

    $response = $this->actingAs($user)->get(route('schedules.index', ['q' => 'Alpha']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.id', $schedule->id));
});

test('schedules index search returns matching project title', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['title' => 'CREWING']);
    $schedule = Schedule::factory()->create(['project_id' => $project->id]);
    Schedule::factory()->create();

    $response = $this->actingAs($user)->get(route('schedules.index', ['q' => 'CREWING']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.id', $schedule->id));
});

test('schedules index can filter by project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['title' => 'AMC']);
    $otherProject = Project::factory()->create(['title' => 'NMDC']);
    $schedule = Schedule::factory()->create(['project_id' => $project->id]);
    Schedule::factory()->create(['project_id' => $otherProject->id]);

    $response = $this->actingAs($user)->get(route('schedules.index', ['project_id' => $project->id]));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.id', $schedule->id));
});

test('schedules index includes total and today counts', function () {
    $user = User::factory()->create();
    Schedule::factory()->create(['scheduled_date' => today()->toDateString()]);
    Schedule::factory()->create(['scheduled_date' => today()->addDay()->toDateString()]);

    $response = $this->actingAs($user)->get(route('schedules.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->where('todayDate', today()->toDateString())
        ->loadDeferredProps(fn ($reload) => $reload
            ->where('totalCount', 2)
            ->where('todayCount', 1)));
});

test('schedules index can filter to today only', function () {
    $user = User::factory()->create();
    $today = today()->toDateString();
    $todaySchedule = Schedule::factory()->create(['scheduled_date' => $today]);
    Schedule::factory()->create(['scheduled_date' => today()->addDay()->toDateString()]);

    $response = $this->actingAs($user)->get(route('schedules.index', [
        'date_from' => $today,
        'date_to' => $today,
    ]));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.id', $todaySchedule->id)
        ->loadDeferredProps(fn ($reload) => $reload
            ->where('totalCount', 2)
            ->where('todayCount', 1)));
});

test('schedules index can filter by date range', function () {
    $user = User::factory()->create();
    $inRange = Schedule::factory()->create(['scheduled_date' => '2026-07-10']);
    Schedule::factory()->create(['scheduled_date' => '2026-06-01']);

    $response = $this->actingAs($user)->get(route('schedules.index', [
        'date_from' => '2026-07-01',
        'date_to' => '2026-07-31',
    ]));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/schedules/index')
        ->has('schedules.data', 1)
        ->where('schedules.data.0.id', $inRange->id));
});
