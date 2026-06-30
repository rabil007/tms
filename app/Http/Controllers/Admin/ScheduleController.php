<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreScheduleRequest;
use App\Http\Requests\Admin\UpdateScheduleRequest;
use App\Models\Country;
use App\Models\Project;
use App\Models\Schedule;
use App\Services\ScheduleAdminNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
            : 'scheduled_date';

        $dir = $request->input('dir', 'desc') === 'asc' ? 'asc' : 'desc';

        $schedules = Schedule::query()
            ->with('project')
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
            ->orderBy($sort, $dir)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        $filters = array_filter(
            $request->only(['q', 'sort', 'dir', 'per_page', 'project_id', 'date_from', 'date_to']),
            fn (mixed $value): bool => $value !== null && $value !== '',
        );

        return Inertia::render('admin/schedules/index', [
            'schedules' => $schedules,
            'filters' => (object) $filters,
            'projects' => $this->projectOptions(),
            'todayCount' => Schedule::query()->whereDate('scheduled_date', today())->count(),
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
        $schedule = Schedule::query()->create($request->validated());

        $notifier->notify($schedule, $request->user(), 'created');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Schedule created.')]);

        return to_route('schedules.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule): Response
    {
        $schedule->load('project');

        return Inertia::render('admin/schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule): Response
    {
        $schedule->load('project');

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

        $notifier->notify($schedule, $request->user(), 'updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Schedule updated.')]);

        return to_route('schedules.index');
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
