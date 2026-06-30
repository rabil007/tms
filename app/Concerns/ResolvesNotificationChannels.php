<?php

namespace App\Concerns;

use App\Models\MailSetting;
use App\Models\User;
use NotificationChannels\WebPush\WebPushChannel;

trait ResolvesNotificationChannels
{
    /**
     * @return array<int, string|class-string>
     */
    protected function resolveNotificationChannels(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if (! $notifiable instanceof User) {
            return $channels;
        }

        if ($notifiable->pushSubscriptions()->exists()) {
            $channels[] = WebPushChannel::class;
        }

        if (($notifiable->email_notifications_enabled ?? true) && MailSetting::current()->isConfigured()) {
            $channels[] = 'mail';
        }

        return $channels;
    }
}
