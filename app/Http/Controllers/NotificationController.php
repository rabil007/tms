<?php

namespace App\Http\Controllers;

use App\Notifications\TestNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function sendTest(Request $request): RedirectResponse
    {
        $request->user()->notify(new TestNotification);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Test notification sent. Check the bell icon and your browser alerts.'),
        ]);

        return back();
    }

    public function markAsRead(Request $request, string $notification): RedirectResponse
    {
        $request->user()
            ->notifications()
            ->whereKey($notification)
            ->firstOrFail()
            ->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
