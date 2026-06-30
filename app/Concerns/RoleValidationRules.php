<?php

namespace App\Concerns;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

trait RoleValidationRules
{
    /**
     * @return array<string, array<int, string|Unique>>
     */
    protected function roleRules(?int $ignoreId = null): array
    {
        $nameUnique = Rule::unique('roles', 'name');

        if ($ignoreId !== null) {
            $nameUnique = $nameUnique->ignore($ignoreId);
        }

        return [
            'name' => ['required', 'string', 'max:255', $nameUnique],
        ];
    }
}
