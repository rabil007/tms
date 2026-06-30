<?php

namespace App\Http\Controllers;

use App\Support\PushDebugLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:500'],
            'keys.auth' => ['required', 'string'],
            'keys.p256dh' => ['required', 'string'],
            'contentEncoding' => ['nullable', 'string', 'in:aesgcm,aes128gcm'],
        ]);

        $encoding = $validated['contentEncoding'] ?? 'aesgcm';

        $request->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth'],
            $encoding,
        );

        // #region agent log
        PushDebugLog::write(
            'A',
            'PushSubscriptionController:store',
            'Push subscription saved',
            [
                'user_id' => $request->user()->id,
                'content_encoding' => $encoding,
                'endpoint_prefix' => substr($validated['endpoint'], 0, 80),
                'subscription_count' => $request->user()->pushSubscriptions()->count(),
            ],
        );
        // #endregion

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
}
