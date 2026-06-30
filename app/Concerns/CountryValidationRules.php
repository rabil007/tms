<?php

namespace App\Concerns;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

trait CountryValidationRules
{
    /**
     * @return array<string, array<int, string|Unique>>
     */
    protected function countryRules(?int $ignoreId = null): array
    {
        $iso2Unique = Rule::unique('countries', 'iso2');

        if ($ignoreId !== null) {
            $iso2Unique = $iso2Unique->ignore($ignoreId);
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'iso2' => ['required', 'string', 'size:2', 'alpha', 'uppercase', $iso2Unique],
            'dial_code' => ['required', 'string', 'max:10', 'regex:/^\+\d{1,4}$/'],
        ];
    }
}
