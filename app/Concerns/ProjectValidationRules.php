<?php

namespace App\Concerns;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

trait ProjectValidationRules
{
    /**
     * @return array<string, array<int, string|Unique>>
     */
    protected function projectRules(?int $ignoreId = null): array
    {
        $titleUnique = Rule::unique('projects', 'title');

        if ($ignoreId !== null) {
            $titleUnique = $titleUnique->ignore($ignoreId);
        }

        return [
            'title' => ['required', 'string', 'max:255', $titleUnique],
        ];
    }
}
