<?php

namespace App\Concerns;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

trait UserValidationRules
{
    /**
     * @return array<string, array<int, mixed>>
     */
    protected function userRules(?int $ignoreId = null, bool $requirePassword = true): array
    {
        $emailUnique = Rule::unique('users', 'email');

        if ($ignoreId !== null) {
            $emailUnique = $emailUnique->ignore($ignoreId);
        }

        $passwordRules = $requirePassword
            ? ['required', 'string', Password::defaults(), 'confirmed']
            : ['nullable', 'string', Password::defaults(), 'confirmed'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', $emailUnique],
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id')],
            'password' => $passwordRules,
        ];
    }
}
