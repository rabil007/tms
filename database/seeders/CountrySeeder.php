<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    /**
     * @var list<array{name: string, iso2: string, dial_code: string}>
     */
    private const COUNTRIES = [
        ['name' => 'United States', 'iso2' => 'US', 'dial_code' => '+1'],
        ['name' => 'United Kingdom', 'iso2' => 'GB', 'dial_code' => '+44'],
        ['name' => 'Canada', 'iso2' => 'CA', 'dial_code' => '+1'],
        ['name' => 'Australia', 'iso2' => 'AU', 'dial_code' => '+61'],
        ['name' => 'India', 'iso2' => 'IN', 'dial_code' => '+91'],
        ['name' => 'Germany', 'iso2' => 'DE', 'dial_code' => '+49'],
        ['name' => 'France', 'iso2' => 'FR', 'dial_code' => '+33'],
        ['name' => 'Japan', 'iso2' => 'JP', 'dial_code' => '+81'],
        ['name' => 'China', 'iso2' => 'CN', 'dial_code' => '+86'],
        ['name' => 'Brazil', 'iso2' => 'BR', 'dial_code' => '+55'],
        ['name' => 'United Arab Emirates', 'iso2' => 'AE', 'dial_code' => '+971'],
        ['name' => 'Saudi Arabia', 'iso2' => 'SA', 'dial_code' => '+966'],
        ['name' => 'Singapore', 'iso2' => 'SG', 'dial_code' => '+65'],
        ['name' => 'Malaysia', 'iso2' => 'MY', 'dial_code' => '+60'],
        ['name' => 'Philippines', 'iso2' => 'PH', 'dial_code' => '+63'],
        ['name' => 'Indonesia', 'iso2' => 'ID', 'dial_code' => '+62'],
        ['name' => 'South Korea', 'iso2' => 'KR', 'dial_code' => '+82'],
        ['name' => 'Netherlands', 'iso2' => 'NL', 'dial_code' => '+31'],
        ['name' => 'Norway', 'iso2' => 'NO', 'dial_code' => '+47'],
        ['name' => 'Greece', 'iso2' => 'GR', 'dial_code' => '+30'],
        ['name' => 'Italy', 'iso2' => 'IT', 'dial_code' => '+39'],
        ['name' => 'Spain', 'iso2' => 'ES', 'dial_code' => '+34'],
        ['name' => 'Turkey', 'iso2' => 'TR', 'dial_code' => '+90'],
        ['name' => 'Egypt', 'iso2' => 'EG', 'dial_code' => '+20'],
        ['name' => 'South Africa', 'iso2' => 'ZA', 'dial_code' => '+27'],
        ['name' => 'Mexico', 'iso2' => 'MX', 'dial_code' => '+52'],
        ['name' => 'Panama', 'iso2' => 'PA', 'dial_code' => '+507'],
        ['name' => 'Hong Kong', 'iso2' => 'HK', 'dial_code' => '+852'],
        ['name' => 'Qatar', 'iso2' => 'QA', 'dial_code' => '+974'],
        ['name' => 'Kuwait', 'iso2' => 'KW', 'dial_code' => '+965'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::COUNTRIES as $country) {
            Country::query()->updateOrCreate(
                ['iso2' => $country['iso2']],
                $country,
            );
        }
    }
}
