<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\User;
use App\Notifications\ScheduleApprovedNotification;

class ScheduleUserNotifier
{
    public function notifyApproved(Schedule $schedule, User $approver): void
    {
        $schedule->loadMissing('user', 'project');

        if ($schedule->user === null) {
            return;
        }

        $schedule->user->notify(new ScheduleApprovedNotification($schedule, $approver));
    }
}
