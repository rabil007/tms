<?php

use App\Models\Project;
use App\Models\User;

test('guests are redirected from projects index', function () {
    $response = $this->get(route('projects.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit projects index', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('projects.index'));

    $response->assertOk();
});

test('authenticated users can visit projects create page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('projects.create'));

    $response->assertOk();
});

test('authenticated users can visit project show page', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->get(route('projects.show', $project));

    $response->assertOk();
});

test('authenticated users can visit project edit page', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->get(route('projects.edit', $project));

    $response->assertOk();
});

test('authenticated users can store a valid project', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('projects.store'), [
        'title' => 'NMDC',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('projects.index'));

    $this->assertDatabaseHas('projects', [
        'title' => 'NMDC',
    ]);
});

test('store validation fails for missing title', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('projects.create'))->post(route('projects.store'), []);

    $response
        ->assertSessionHasErrors(['title'])
        ->assertRedirect(route('projects.create'));
});

test('store validation fails for duplicate title', function () {
    $user = User::factory()->create();
    Project::factory()->create(['title' => 'NMDC']);

    $response = $this->actingAs($user)->from(route('projects.create'))->post(route('projects.store'), [
        'title' => 'NMDC',
    ]);

    $response
        ->assertSessionHasErrors('title')
        ->assertRedirect(route('projects.create'));
});

test('authenticated users can update a project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['title' => 'CREWING']);

    $response = $this->actingAs($user)->put(route('projects.update', $project), [
        'title' => 'DWML',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('projects.index'));

    expect($project->fresh())
        ->title->toBe('DWML');
});

test('authenticated users can delete a project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->delete(route('projects.destroy', $project));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('projects.index'));

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

test('projects index loads without sort query param', function () {
    $user = User::factory()->create();
    Project::factory()->create(['title' => 'NMDC']);

    $response = $this->actingAs($user)->get(route('projects.index'));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/projects/index')
        ->has('projects.data', 1)
        ->where('projects.data.0.title', 'NMDC'));
});

test('projects index search returns matching project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['title' => 'NMDC']);
    Project::factory()->create(['title' => 'AMC']);

    $response = $this->actingAs($user)->get(route('projects.index', ['q' => 'NMDC']));

    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('admin/projects/index')
        ->has('projects.data', 1)
        ->where('projects.data.0.id', $project->id)
        ->where('projects.data.0.title', 'NMDC'));
});
