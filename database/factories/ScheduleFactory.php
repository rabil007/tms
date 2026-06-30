<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'crew_name' => fake()->name(),
            'scheduled_date' => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'crew_contact' => '+'.fake()->numberBetween(1000000000, 9999999999),
            'project_id' => Project::factory(),
            'pick_up_location' => fake()->streetAddress(),
            'drop_off_location' => fake()->streetAddress(),
            'pick_up_time' => fake()->dateTime()->format('H:i'),
            'remarks' => fake()->optional()->sentence(),
        ];
    }
}
