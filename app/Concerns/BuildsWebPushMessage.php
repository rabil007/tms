<?php

namespace App\Concerns;

use NotificationChannels\WebPush\WebPushMessage;

trait BuildsWebPushMessage
{
    protected function buildWebPushMessage(
        string $title,
        string $body,
        string $actionUrl,
        ?string $tag = null,
    ): WebPushMessage {
        $appName = (string) config('app.name');

        return (new WebPushMessage)
            ->title($title)
            ->body($body)
            ->icon(url('/logo.png'))
            ->badge(url('/logo.png'))
            ->tag($tag ?? 'overseas-notification')
            ->renotify()
            ->action(__('Open'), $actionUrl)
            ->data([
                'url' => $actionUrl,
                'app_name' => $appName,
            ]);
    }
}
