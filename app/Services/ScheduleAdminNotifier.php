<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\User;
use App\Notifications\ScheduleActivityNotification;
use Illuminate\Support\Collection;

class ScheduleAdminNotifier
{
    /**
     * Notify all admin users when a non-admin user changes a schedule.
     */
    public function notify(Schedule $schedule, User $actor, string $action): void
    {
        if ($actor->isAdmin()) {
            return;
        }

        if (! in_array($action, ['created', 'updated'], true)) {
            return;
        }

        $this->adminUsers($actor)->each(
            fn (User $admin) => $admin->notify(new ScheduleActivityNotification($schedule, $actor, $action)),
        );
    }

    /**
     * @return Collection<int, User>
     */
    private function adminUsers(User $actor): Collection
    {
        return User::query()
            ->with('role')
            ->whereHas('role', fn ($query) => $query->where('slug', 'admin'))
            ->whereKeyNot($actor->id)
            ->get();
    }
}
