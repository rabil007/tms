<?php

namespace App\Notifications;

use App\Concerns\BuildsWebPushMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class DeviceTestPushNotification extends Notification
{
    use BuildsWebPushMessage, Queueable;

    public function __construct(public int $pushSubscriptionId) {}

    /**
     * @return array<int, class-string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $appName = (string) config('app.name');

        return $this->buildWebPushMessage(
            title: __('Test push to this device'),
            body: __('This is a test alert from :app.', ['app' => $appName]),
            actionUrl: route('notifications.edit'),
            tag: 'overseas-device-test',
        );
    }
}
