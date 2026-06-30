<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/notifications', [
            'vapidPublicKey' => config('webpush.vapid.public_key'),
            'pushEnabled' => $request->user()->pushSubscriptions()->exists(),
        ]);
    }
}
