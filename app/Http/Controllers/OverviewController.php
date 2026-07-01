<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    /**
     * Display the overview dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $today = today();

        $stats = [
            'schedules_today' => Schedule::query()->whereDate('scheduled_date', $today)->count(),
            'schedules_upcoming' => Schedule::query()
                ->whereDate('scheduled_date', '>=', $today)
                ->whereDate('scheduled_date', '<=', $today->copy()->addDays(7))
                ->count(),
            'schedules_total' => Schedule::query()->count(),
        ];

        if ($user->isAdmin()) {
            $stats['users_count'] = User::query()->whereKeyNot($user->id)->count();
            $stats['projects_count'] = Project::query()->count();
        }

        $recentSchedules = Schedule::query()
            ->with('project:id,title')
            ->orderByDesc('scheduled_date')
            ->orderBy('pick_up_time')
            ->limit(10)
            ->get(['id', 'crew_name', 'scheduled_date', 'pick_up_time', 'project_id'])
            ->map(fn (Schedule $schedule): array => [
                'id' => $schedule->id,
                'crew_name' => $schedule->crew_name,
                'scheduled_date' => $schedule->scheduled_date->toDateString(),
                'pick_up_time' => $schedule->pick_up_time,
                'project' => $schedule->project ? ['title' => $schedule->project->title] : null,
            ])
            ->values()
            ->all();

        $recentActivity = $user->notifications()
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($notification): array => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? '',
                'message' => $notification->data['message'] ?? '',
                'action_url' => $notification->data['action_url'] ?? null,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at_diff' => $notification->created_at?->diffForHumans(),
            ])
            ->values()
            ->all();

        return Inertia::render('overview', [
            'stats' => $stats,
            'recentSchedules' => $recentSchedules,
            'recentActivity' => $recentActivity,
        ]);
    }
}
