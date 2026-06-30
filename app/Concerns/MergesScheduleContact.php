<?php

namespace App\Concerns;

use App\Models\Country;

trait MergesScheduleContact
{
    protected function prepareForValidation(): void
    {
        if ($this->filled('country_id') && $this->filled('crew_phone')) {
            $country = Country::query()->whereKey($this->integer('country_id'))->first();

            if ($country !== null) {
                $this->merge([
                    'crew_contact' => $country->dial_code.$this->input('crew_phone'),
                ]);
            }
        }
    }
}
