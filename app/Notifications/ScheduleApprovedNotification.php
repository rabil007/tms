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

class ScheduleApprovedNotification extends Notification
{
    use BuildsWebPushMessage, Queueable, ResolvesNotificationChannels;

    public function __construct(
        public Schedule $schedule,
        public User $approver,
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
            tag: 'overseas-schedule-approved-'.$this->schedule->id,
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

        return [
            'title' => __('Schedule approved · :project', ['project' => $projectTitle]),
            'message' => __(':crew on :date — approved by :admin.', [
                'crew' => $this->schedule->crew_name,
                'date' => $formattedDate,
                'admin' => $this->approver->name,
            ]),
            'action_url' => route('schedules.show', $this->schedule),
        ];
    }
}
