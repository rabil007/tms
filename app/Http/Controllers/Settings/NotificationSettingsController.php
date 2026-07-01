<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\PushSubscriptionPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/notifications', [
            'vapidPublicKey' => config('webpush.vapid.public_key'),
            'pushEnabled' => $user->pushSubscriptions()->exists(),
            'pushSubscriptions' => $user->pushSubscriptions()
                ->latest()
                ->get()
                ->map(fn ($subscription) => PushSubscriptionPresenter::toArray($subscription))
                ->values()
                ->all(),
        ]);
    }
}
