<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Schedule;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('overview', [
            'stats' => Inertia::defer(fn (): array => $this->stats($user, $today)),
            'analytics' => Inertia::defer(fn (): array => [
                'scheduleTrend' => $this->scheduleTrend($today),
                'monthlyTrend' => $this->monthlyTrend($today),
                'topProjects' => $this->topProjects(),
                'topPickUpLocations' => $this->topPickUpLocations(),
            ]),
            'recentSchedules' => Inertia::defer(fn (): array => $this->recentSchedules()),
            'recentActivity' => Inertia::defer(fn (): array => $this->recentActivity($user)),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function stats(User $user, CarbonInterface $today): array
    {
        $stats = [
            'schedules_today' => Schedule::query()->whereDate('scheduled_date', $today)->count(),
            'schedules_upcoming' => Schedule::query()
                ->whereDate('scheduled_date', '>=', $today)
                ->whereDate('scheduled_date', '<=', $today->copy()->addDays(7))
                ->count(),
            'schedules_this_month' => Schedule::query()
                ->whereYear('scheduled_date', $today->year)
                ->whereMonth('scheduled_date', $today->month)
                ->count(),
            'schedules_past' => Schedule::query()->whereDate('scheduled_date', '<', $today)->count(),
            'schedules_total' => Schedule::query()->count(),
            'schedules_created_this_week' => Schedule::query()
                ->where('created_at', '>=', $today->copy()->startOfWeek())
                ->count(),
            'unread_notifications' => $user->unreadNotifications()->count(),
        ];

        if ($user->isAdmin()) {
            $stats['users_count'] = User::query()->whereKeyNot($user->id)->count();
            $stats['projects_count'] = Project::query()->count();
        }

        return $stats;
    }

    /**
     * @return list<array{date: string, label: string, count: int}>
     */
    private function scheduleTrend(CarbonInterface $today): array
    {
        $end = $today->copy()->addDays(6);

        /** @var Collection<string, int> $counts */
        $counts = Schedule::query()
            ->whereDate('scheduled_date', '>=', $today)
            ->whereDate('scheduled_date', '<=', $end)
            ->get(['scheduled_date'])
            ->groupBy(fn (Schedule $schedule): string => $schedule->scheduled_date->toDateString())
            ->map(fn (Collection $group): int => $group->count());

        $trend = [];

        for ($offset = 0; $offset < 7; $offset++) {
            $date = $today->copy()->addDays($offset);
            $key = $date->toDateString();

            $trend[] = [
                'date' => $key,
                'label' => $date->format('D'),
                'count' => $counts[$key] ?? 0,
            ];
        }

        return $trend;
    }

    /**
     * @return list<array{label: string, year: int, count: int}>
     */
    private function monthlyTrend(CarbonInterface $today): array
    {
        $trend = [];

        for ($monthsAgo = 5; $monthsAgo >= 0; $monthsAgo--) {
            $month = $today->copy()->subMonths($monthsAgo);

            $trend[] = [
                'label' => $month->format('M'),
                'year' => $month->year,
                'count' => Schedule::query()
                    ->whereYear('scheduled_date', $month->year)
                    ->whereMonth('scheduled_date', $month->month)
                    ->count(),
            ];
        }

        return $trend;
    }

    /**
     * @return list<array{id: int, title: string, count: int, percentage: int}>
     */
    private function topProjects(): array
    {
        $total = Schedule::query()->count();

        if ($total === 0) {
            return [];
        }

        /** @var list<array{id: int, title: string, count: int, percentage: int}> */
        return Project::query()
            ->withCount('schedules')
            ->whereHas('schedules')
            ->orderByDesc('schedules_count')
            ->limit(5)
            ->get(['id', 'title'])
            ->map(fn (Project $project): array => [
                'id' => $project->id,
                'title' => $project->title,
                'count' => (int) $project->schedules_count,
                'percentage' => (int) round(((int) $project->schedules_count / $total) * 100),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{location: string, count: int}>
     */
    private function topPickUpLocations(): array
    {
        /** @var list<array{location: string, count: int}> */
        return DB::table('schedules')
            ->selectRaw('pick_up_location as location, COUNT(*) as aggregate_count')
            ->groupBy('pick_up_location')
            ->orderByDesc('aggregate_count')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'location' => (string) $row->location,
                'count' => (int) $row->aggregate_count,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, crew_name: string, scheduled_date: string, pick_up_time: string, project: array{title: string}|null}>
     */
    private function recentSchedules(): array
    {
        /** @var list<array{id: int, crew_name: string, scheduled_date: string, pick_up_time: string, project: array{title: string}|null}> */
        return Schedule::query()
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
                'project' => $schedule->project !== null
                    ? ['title' => $schedule->project->title]
                    : null,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: string, title: string, message: string, action_url: string|null, read_at: string|null, created_at_diff: string|null}>
     */
    private function recentActivity(User $user): array
    {
        /** @var list<array{id: string, title: string, message: string, action_url: string|null, read_at: string|null, created_at_diff: string|null}> */
        return $user->notifications()
            ->latest()
            ->limit(10)
            ->get()
            ->map(function (DatabaseNotification $notification): array {
                /** @var array{title?: string, message?: string, action_url?: string|null} $data */
                $data = $notification->data;

                return [
                    'id' => (string) $notification->id,
                    'title' => $data['title'] ?? '',
                    'message' => $data['message'] ?? '',
                    'action_url' => $data['action_url'] ?? null,
                    'read_at' => $notification->read_at?->toIso8601String(),
                    'created_at_diff' => $notification->created_at?->diffForHumans(),
                ];
            })
            ->values()
            ->all();
    }
}
