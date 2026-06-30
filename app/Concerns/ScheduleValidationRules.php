<?php

namespace App\Concerns;

trait ScheduleValidationRules
{
    /**
     * @return array<string, array<int, string>>
     */
    protected function scheduleRules(): array
    {
        return [
            'crew_name' => ['required', 'string', 'max:255'],
            'scheduled_date' => ['required', 'date'],
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'crew_phone' => ['required', 'string', 'regex:/^\d{6,12}$/'],
            'crew_contact' => ['required', 'string', 'max:20', 'regex:/^\+?\d{7,15}$/'],
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'pick_up_location' => ['required', 'string', 'max:255'],
            'drop_off_location' => ['required', 'string', 'max:255'],
            'pick_up_time' => ['required', 'date_format:H:i'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
