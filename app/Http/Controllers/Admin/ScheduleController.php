<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ScheduleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreScheduleRequest;
use App\Http\Requests\Admin\UpdateScheduleRequest;
use App\Models\Country;
use App\Models\Project;
use App\Models\Schedule;
use App\Services\ScheduleAdminNotifier;
use App\Services\ScheduleUserNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ScheduleController extends Controller
{
    /**
     * @var list<string>
     */
    private const SORTABLE_COLUMNS = [
        'crew_name',
        'scheduled_date',
        'pick_up_time',
        'pick_up_location',
        'drop_off_location',
        'created_at',
        'status',
    ];

    /**
     * @var list<string>
     */
    private const SEARCHABLE_COLUMNS = [
        'crew_name',
        'crew_contact',
        'pick_up_location',
        'drop_off_location',
        'remarks',
    ];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $sort = in_array($request->input('sort'), self::SORTABLE_COLUMNS, true)
            ? $request->input('sort')
            : 'created_at';

        $dir = $request->input('dir', 'desc') === 'asc' ? 'asc' : 'desc';

        $schedules = Schedule::query()
            ->with(['project', 'createdBy:id,name'])
            ->when($request->q, function ($query) use ($request): void {
                $search = '%'.$request->q.'%';

                $query->where(function ($query) use ($search): void {
                    foreach (self::SEARCHABLE_COLUMNS as $index => $column) {
                        if ($index === 0) {
                            $query->where($column, 'like', $search);
                        } else {
                            $query->orWhere($column, 'like', $search);
                        }
                    }

                    $query->orWhereHas('project', function ($query) use ($search): void {
                        $query->where('title', 'like', $search);
                    });
                });
            })
            ->when($request->filled('project_id'), function ($query) use ($request): void {
                $query->where('project_id', $request->integer('project_id'));
            })
            ->when($request->filled('date_from'), function ($query) use ($request): void {
                $query->whereDate('scheduled_date', '>=', $request->date('date_from'));
            })
            ->when($request->filled('date_to'), function ($query) use ($request): void {
                $query->whereDate('scheduled_date', '<=', $request->date('date_to'));
            })
            ->when(
                in_array($request->input('status'), [ScheduleStatus::Pending->value, ScheduleStatus::Completed->value], true),
                fn ($query) => $query->where('status', $request->input('status')),
            )
            ->orderBy($sort, $dir)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        $filters = array_filter(
            $request->only(['q', 'sort', 'dir', 'per_page', 'project_id', 'date_from', 'date_to', 'status']),
            fn (mixed $value): bool => $value !== null && $value !== '',
        );

        return Inertia::render('admin/schedules/index', [
            'schedules' => $schedules,
            'filters' => (object) $filters,
            'projects' => Inertia::defer(fn (): array => $this->projectOptions()),
            'totalCount' => Inertia::defer(fn (): int => Schedule::query()->count()),
            'todayCount' => Inertia::defer(fn (): int => Schedule::query()->whereDate('scheduled_date', today())->count()),
            'pendingCount' => Inertia::defer(fn (): int => Schedule::query()->where('status', ScheduleStatus::Pending)->count()),
            'todayDate' => today()->toDateString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/schedules/create', [
            'projects' => $this->projectOptions(),
            'countries' => $this->countryOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreScheduleRequest $request, ScheduleAdminNotifier $notifier): RedirectResponse
    {
        $schedule = Schedule::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'created_by_id' => $request->user()->id,
            'status' => $request->user()->isAdmin()
                ? ScheduleStatus::Completed
                : ScheduleStatus::Pending,
        ]);

        $notifier->notify($schedule, $request->user(), 'created');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Schedule created.')]);

        return to_route('schedules.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule): Response
    {
        $schedule->load(['project', 'createdBy:id,name']);

        return Inertia::render('admin/schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule): Response
    {
        $schedule->load(['project', 'createdBy:id,name']);

        return Inertia::render('admin/schedules/edit', [
            'schedule' => $schedule,
            'projects' => $this->projectOptions(),
            'countries' => $this->countryOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScheduleRequest $request, Schedule $schedule, ScheduleAdminNotifier $notifier): RedirectResponse
    {
        $schedule->update($request->validated());

        if (! $request->user()->isAdmin()) {
            $schedule->status = ScheduleStatus::Pending;
            $schedule->save();
        }

        $notifier->notify($schedule, $request->user(), 'updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Schedule updated.')]);

        return to_route('schedules.index');
    }

    /**
     * Approve a pending schedule.
     */
    public function approve(Request $request, Schedule $schedule, ScheduleUserNotifier $notifier): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        if ($schedule->status === ScheduleStatus::Completed) {
            throw new UnprocessableEntityHttpException(__('Schedule is already completed.'));
        }

        $schedule->update(['status' => ScheduleStatus::Completed]);

        $notifier->notifyApproved($schedule, $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Schedule approved.')]);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Schedule deleted.')]);

        return to_route('schedules.index');
    }

    /**
     * @return list<array{id: int, title: string}>
     */
    private function projectOptions(): array
    {
        return array_values(
            Project::query()
                ->orderBy('title')
                ->get(['id', 'title'])
                ->map(fn (Project $project): array => [
                    'id' => $project->id,
                    'title' => $project->title,
                ])
                ->all(),
        );
    }

    /**
     * @return list<array{id: int, name: string, iso2: string, dial_code: string}>
     */
    private function countryOptions(): array
    {
        return array_values(
            Country::query()
                ->orderBy('name')
                ->get(['id', 'name', 'iso2', 'dial_code'])
                ->map(fn (Country $country): array => [
                    'id' => $country->id,
                    'name' => $country->name,
                    'iso2' => $country->iso2,
                    'dial_code' => $country->dial_code,
                ])
                ->all(),
        );
    }
}
