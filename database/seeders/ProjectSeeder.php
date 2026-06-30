<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    private const TITLES = [
        'NMDC',
        'CREWING',
        'DWML',
        'AMC',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::TITLES as $title) {
            Project::query()->firstOrCreate(['title' => $title]);
        }
    }
}
