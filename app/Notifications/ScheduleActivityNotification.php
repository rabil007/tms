<?php

namespace App\Notifications;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class ScheduleActivityNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Schedule $schedule,
        public User $actor,
        public string $action,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if ($notifiable instanceof User && $notifiable->pushSubscriptions()->exists()) {
            $channels[] = WebPushChannel::class;
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

    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $payload = $this->payload();

        return (new WebPushMessage)
            ->title($payload['title'])
            ->body($payload['message'])
            ->action('View', $payload['action_url'] ?? route('dashboard'))
            ->data(['url' => $payload['action_url'] ?? route('dashboard')]);
    }

    /**
     * @return array{title: string, message: string, action_url: string}
     */
    private function payload(): array
    {
        $this->schedule->loadMissing('project');

        $projectTitle = $this->schedule->project->title;
        $formattedDate = $this->schedule->scheduled_date->format('M j, Y');

        if ($this->action === 'created') {
            $title = __('New schedule submitted');
            $message = __(':actor scheduled :crew for :date (:project).', [
                'actor' => $this->actor->name,
                'crew' => $this->schedule->crew_name,
                'date' => $formattedDate,
                'project' => $projectTitle,
            ]);
        } else {
            $title = __('Schedule updated');
            $message = __(':actor updated the schedule for :crew on :date (:project).', [
                'actor' => $this->actor->name,
                'crew' => $this->schedule->crew_name,
                'date' => $formattedDate,
                'project' => $projectTitle,
            ]);
        }

        return [
            'title' => $title,
            'message' => $message,
            'action_url' => route('schedules.show', $this->schedule),
        ];
    }
}
