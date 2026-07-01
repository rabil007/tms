<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateApplicationSettingsRequest;
use App\Models\ApplicationSetting;
use App\Services\ApplicationConfigService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationSettingsController extends Controller
{
    public function edit(): Response
    {
        $settings = ApplicationSetting::current();

        return Inertia::render('settings/application', [
            'applicationName' => $settings->name,
        ]);
    }

    public function update(
        UpdateApplicationSettingsRequest $request,
        ApplicationConfigService $applicationConfig,
    ): RedirectResponse {
        $settings = ApplicationSetting::current();
        $settings->fill($request->validated());
        $settings->save();

        $applicationConfig->apply();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Application name updated.'),
        ]);

        return to_route('application.edit');
    }
}
