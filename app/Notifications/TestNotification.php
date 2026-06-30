<?php

namespace App\Notifications;

use App\Concerns\ResolvesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class TestNotification extends Notification
{
    use Queueable, ResolvesNotificationChannels;

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

        return (new WebPushMessage)
            ->title($payload['title'])
            ->body($payload['message'])
            ->action('Open', $payload['action_url'])
            ->data(['url' => $payload['action_url']]);
    }

    /**
     * @return array{title: string, message: string, action_url: string}
     */
    private function payload(): array
    {
        return [
            'title' => __('Test notification'),
            'message' => __('This is a test alert from Overseas. If you see this, notifications are working.'),
            'action_url' => route('notifications.edit'),
        ];
    }
}
