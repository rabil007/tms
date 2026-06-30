<?php

namespace Database\Seeders;

use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Seed sample in-app notifications.
     */
    public function run(): void
    {
        $user = User::query()->where('email', config('seed.admin.email'))->first();

        if ($user === null) {
            return;
        }

        $user->notify(new SystemNotification(
            title: 'Welcome to Overseas',
            message: 'Your admin account is ready. Explore schedules and manage projects from the dashboard.',
            actionUrl: route('dashboard'),
        ));

        $user->notify(new SystemNotification(
            title: 'Schedules module',
            message: 'Create and track crew pick-ups, drop-offs, and project assignments.',
            actionUrl: route('schedules.index'),
        ));

        $user->notifications()->latest()->first()?->markAsRead();
    }
}
