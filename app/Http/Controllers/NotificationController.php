<?php

namespace App\Http\Controllers;

use App\Notifications\TestNotification;
use App\Support\PushDebugLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use NotificationChannels\WebPush\WebPushChannel;

class NotificationController extends Controller
{
    public function sendTest(Request $request): RedirectResponse
    {
        $user = $request->user();
        $notification = new TestNotification(withEmail: false);
        $channels = $notification->via($user);
        $subscriptions = $user->pushSubscriptions()->get(['endpoint', 'content_encoding']);

        // #region agent log
        PushDebugLog::write(
            'B',
            'NotificationController:sendTest',
            'Sending test notification',
            [
                'user_id' => $user->id,
                'channels' => $channels,
                'web_push_included' => in_array(WebPushChannel::class, $channels, true),
                'subscription_count' => $subscriptions->count(),
                'subscriptions' => $subscriptions->map(fn ($sub) => [
                    'encoding' => $sub->content_encoding,
                    'endpoint_prefix' => substr($sub->endpoint, 0, 80),
                ])->all(),
                'vapid_configured' => filled(config('webpush.vapid.public_key')) && filled(config('webpush.vapid.private_key')),
                'user_agent' => substr($request->userAgent() ?? '', 0, 160),
            ],
        );
        // #endregion

        $user->notify($notification);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Test notification sent. Check the bell icon and browser alerts.'),
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
