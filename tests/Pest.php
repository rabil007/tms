<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

use App\Models\Country;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\RoleSeeder;

function seedRoles(): void
{
    (new RoleSeeder)->run();
}

function adminUser(): User
{
    seedRoles();

    return User::factory()->admin()->create();
}

function regularUser(): User
{
    seedRoles();

    return User::factory()->user()->create();
}

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
