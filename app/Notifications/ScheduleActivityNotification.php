<?php

namespace App\Notifications;

use App\Concerns\BuildsWebPushMessage;
use App\Concerns\ResolvesNotificationChannels;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class ScheduleActivityNotification extends Notification
{
    use BuildsWebPushMessage, Queueable, ResolvesNotificationChannels;

    public function __construct(
        public Schedule $schedule,
        public User $actor,
        public string $action,
    ) {}

    /**
     * @return array<int, string|class-string>
     */
    public function via(object $notifiable): array
    {
        return $this->resolveNotificationChannels($notifiable);
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
            ->action(__('View schedule'), $payload['action_url']);
    }

    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $payload = $this->payload();

        return $this->buildWebPushMessage(
            title: $payload['title'],
            body: $payload['message'],
            actionUrl: $payload['action_url'],
            tag: 'overseas-schedule-'.$this->schedule->id,
        );
    }

    /**
     * @return array{title: string, message: string, action_url: string}
     */
    private function payload(): array
    {
        $this->schedule->loadMissing('project');

        $projectTitle = $this->schedule->project->title;
        $formattedDate = $this->schedule->scheduled_date->format('M j, Y');
        $appName = (string) config('app.name');

        if ($this->action === 'created') {
            $title = __('New schedule · :project', ['project' => $projectTitle]);
            $message = __(':crew on :date — submitted by :actor via :app.', [
                'crew' => $this->schedule->crew_name,
                'date' => $formattedDate,
                'actor' => $this->actor->name,
                'app' => $appName,
            ]);
        } else {
            $title = __('Schedule updated · :project', ['project' => $projectTitle]);
            $message = __(':crew on :date — updated by :actor via :app.', [
                'crew' => $this->schedule->crew_name,
                'date' => $formattedDate,
                'actor' => $this->actor->name,
                'app' => $appName,
            ]);
        }

        return [
            'title' => $title,
            'message' => $message,
            'action_url' => route('schedules.show', $this->schedule),
        ];
    }
}
