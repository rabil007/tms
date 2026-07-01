<?php

namespace App\Services;

use App\Models\ApplicationSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Throwable;

class ApplicationConfigService
{
    public function apply(): void
    {
        try {
            if (! Schema::hasTable('application_settings')) {
                return;
            }

            $settings = ApplicationSetting::query()->first();

            if ($settings === null || blank($settings->name)) {
                return;
            }

            Config::set('app.name', $settings->name);
        } catch (Throwable) {
            return;
        }
    }
}
