<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateMailSettingsRequest;
use App\Http\Requests\Settings\UpdateNotificationPreferencesRequest;
use App\Mail\TestSmtpMail;
use App\Models\MailSetting;
use App\Services\MailConfigService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class MailSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/smtp', [
            'mailSettings' => $user->isAdmin() ? MailSetting::current()->toPublicArray() : null,
            'emailNotificationsEnabled' => $user->email_notifications_enabled,
            'mailConfigured' => MailSetting::current()->isConfigured(),
        ]);
    }

    public function update(UpdateMailSettingsRequest $request, MailConfigService $mailConfig): RedirectResponse
    {
        $settings = MailSetting::current();
        $validated = $request->validated();

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $settings->fill($validated);
        $settings->save();

        $mailConfig->apply();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('SMTP settings saved.'),
        ]);

        return to_route('smtp.edit');
    }

    public function updatePreferences(UpdateNotificationPreferencesRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Email notification preferences updated.'),
        ]);

        return to_route('smtp.edit');
    }

    public function sendTest(Request $request, MailConfigService $mailConfig): RedirectResponse
    {
        if (! MailSetting::current()->isConfigured()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Save valid SMTP settings before sending a test email.'),
            ]);

            return to_route('smtp.edit');
        }

        $mailConfig->apply();

        $user = $request->user();

        Mail::to($user)->send(new TestSmtpMail);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Test email sent to :email.', ['email' => $user->email]),
        ]);

        return to_route('smtp.edit');
    }
}
