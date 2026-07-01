<?php

namespace App\Notifications;

use App\Concerns\BuildsWebPushMessage;
use App\Concerns\ResolvesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class TestNotification extends Notification
{
    use BuildsWebPushMessage, Queueable, ResolvesNotificationChannels;

    public function __construct(public bool $withEmail = true) {}

    /**
     * @return array<int, string|class-string>
     */
    public function via(object $notifiable): array
    {
        $channels = $this->resolveNotificationChannels($notifiable);

        if (! $this->withEmail) {
            $channels = array_values(array_filter($channels, fn (string $channel): bool => $channel !== 'mail'));
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload();
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }

    public function toMail(object $notifiable): MailMessage
    {
        $payload = $this->payload();

        return (new MailMessage)
            ->subject($payload['title'])
            ->line($payload['message'])
            ->action(__('Open notifications'), $payload['action_url']);
    }

    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $payload = $this->payload();

        return $this->buildWebPushMessage(
            title: $payload['title'],
            body: $payload['message'],
            actionUrl: $payload['action_url'],
            tag: 'overseas-test',
        );
    }

    /**
     * @return array{title: string, message: string, action_url: string}
     */
    private function payload(): array
    {
        $appName = (string) config('app.name');

        return [
            'title' => __('Push notifications enabled'),
            'message' => __('You will receive :app alerts when schedules are created or updated.', [
                'app' => $appName,
            ]),
            'action_url' => route('notifications.edit'),
        ];
    }
}
