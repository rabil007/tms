<?php

namespace App\Http\Controllers;

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
            'contentEncoding' => ['nullable', 'string'],
        ]);

        $request->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth'],
            $validated['contentEncoding'] ?? 'aesgcm',
        );

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
