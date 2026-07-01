<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Notifications\DeviceTestPushNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:500'],
            'keys.auth' => ['required', 'string'],
            'keys.p256dh' => ['required', 'string'],
            'contentEncoding' => ['nullable', 'string', 'in:aesgcm,aes128gcm'],
            'user_agent' => ['nullable', 'string', 'max:500'],
        ]);

        $subscription = $request->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth'],
            $validated['contentEncoding'] ?? 'aes128gcm',
        );

        if (filled($validated['user_agent'] ?? null)) {
            $subscription->forceFill([
                'user_agent' => $validated['user_agent'],
            ])->save();
        }

        return back();
    }

    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:500'],
        ]);

        $request->user()->deletePushSubscription($validated['endpoint']);

        return back();
    }

    public function sendTest(Request $request, PushSubscription $pushSubscription): RedirectResponse
    {
        abort_unless(
            $request->user()->ownsPushSubscription($pushSubscription),
            404,
        );

        $request->user()->notify(new DeviceTestPushNotification($pushSubscription->id));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Test push sent to this device.'),
        ]);

        return back();
    }
}
