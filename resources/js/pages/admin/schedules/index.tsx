import { Deferred, Head, Link, router, usePage } from '@inertiajs/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { CalendarClock, Plus } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { SectionHeader } from '@/components/layout/section-header';
import { BulkActionBar } from '@/components/list/bulk-action-bar';
import { EmptyState } from '@/components/list/empty-state';
import { IndexToolbar } from '@/components/list/index-toolbar';
import { PaginationBar } from '@/components/list/pagination-bar';
import { PullToRefresh } from '@/components/list/pull-to-refresh';
import { RowActions } from '@/components/list/row-actions';
import { RowsPerPageSelect } from '@/components/list/rows-per-page-select';
import { SortableHeader } from '@/components/list/sortable-header';
import { StatCardsSkeleton } from '@/components/loading/stat-cards-skeleton';
import {
    ScheduleSelectAllCheckbox,
    ScheduleSelectRowCheckbox,
    ScheduleSelectionProvider,
} from '@/components/schedules/schedule-selection-context';
import { ScheduleShareModal } from '@/components/schedules/schedule-share-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useIndexQueryParams } from '@/hooks/use-index-query-params';
import { useIndexViewMode } from '@/hooks/use-index-view-mode';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ScheduleIndexFilters } from '@/pages/admin/schedules/schedule-index-filters';
import type { ProjectFilterOption } from '@/pages/admin/schedules/schedule-index-filters';
import {
    canUserModifySchedule,
    formatCreatedAt,
    formatPickUpTime,
    formatScheduleDate,
    SCHEDULE_ROUTES,
    ScheduleGridCards,
    ScheduleListCards,
    ScheduleStatusBadge,
    ScheduleTable,
} from '@/pages/admin/schedules/schedule-views';
import type { ScheduleRow } from '@/pages/admin/schedules/schedule-views';
import type { Auth } from '@/types';

type Paged<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    total?: number;
    current_page?: number;
    per_page?: number;
};

const ALLOWED_SORTS = [
    'crew_name',
    'scheduled_date',
    'pick_up_time',
    'pick_up_location',
    'drop_off_location',
    'created_at',
    'status',
];

type ScheduleFilters = {
    q?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
    per_page?: number;
    project_id?: number | string;
    date_from?: string;
    date_to?: string;
    status?: string;
};

const SCHEDULE_INDEX_RELOAD_ONLY = ['schedules', 'filters'] as const;

export default function SchedulesIndex({
    schedules,
    filters,
    todayDate,
}: {
    schedules: Paged<ScheduleRow>;
    filters: ScheduleFilters;
    projects?: ProjectFilterOption[];
    totalCount?: number;
    todayCount?: number;
    todayDate: string;
}) {
    const isMobile = useIsMobile();
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role?.slug === 'admin';
    const { viewMode, setViewMode } = useIndexViewMode({
        storageKey: 'schedules:index:view',
    });
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );
    const [shareSchedules, setShareSchedules] = React.useState<
        ScheduleRow[] | null
    >(null);

    const [statusFilter, setStatusFilter] = React.useState(
        filters.status ?? '',
    );

    React.useEffect(() => {
        setStatusFilter(filters.status ?? '');
    }, [filters.status]);

    const [indexFilters, setIndexFilters] = React.useState({
        projectId: filters.project_id ? String(filters.project_id) : '',
        dateFrom: filters.date_from ?? '',
        dateTo: filters.date_to ?? '',
    });

    React.useEffect(() => {
        setIndexFilters({
            projectId: filters.project_id ? String(filters.project_id) : '',
            dateFrom: filters.date_from ?? '',
            dateTo: filters.date_to ?? '',
        });
    }, [filters.project_id, filters.date_from, filters.date_to]);

    const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } =
        useIndexQueryParams({
            href: SCHEDULE_ROUTES.index,
            filters,
            defaultPerPage: 15,
            defaultSort: 'created_at',
            allowedSorts: ALLOWED_SORTS,
            extras: {
                project_id: indexFilters.projectId
                    ? Number(indexFilters.projectId)
                    : undefined,
                date_from: indexFilters.dateFrom || undefined,
                date_to: indexFilters.dateTo || undefined,
                status: statusFilter || undefined,
            },
            reloadOnly: SCHEDULE_INDEX_RELOAD_ONLY,
        });

    const visitIndex = React.useCallback(
        (overrides?: {
            q?: string;
            projectId?: string;
            dateFrom?: string;
            dateTo?: string;
            status?: string;
            sort?: string;
            dir?: 'asc' | 'desc';
            perPage?: number;
        }) => {
            const projectId =
                overrides?.projectId !== undefined
                    ? overrides.projectId
                    : indexFilters.projectId;
            const dateFrom =
                overrides?.dateFrom !== undefined
                    ? overrides.dateFrom
                    : indexFilters.dateFrom;
            const dateTo =
                overrides?.dateTo !== undefined
                    ? overrides.dateTo
                    : indexFilters.dateTo;
            const status =
                overrides?.status !== undefined
                    ? overrides.status
                    : statusFilter;

            router.get(
                SCHEDULE_ROUTES.index,
                {
                    q: (overrides?.q ?? q) || undefined,
                    sort: overrides?.sort ?? sort,
                    dir: overrides?.dir ?? dir,
                    per_page: overrides?.perPage ?? perPage,
                    project_id: projectId ? Number(projectId) : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    status: status || undefined,
                },
                {
                    preserveScroll: true,
                    replace: true,
                    only: ['schedules', 'filters'],
                },
            );
        },
        [q, sort, dir, perPage, indexFilters, statusFilter],
    );

    const currentPage =
        schedules?.meta?.current_page ?? schedules?.current_page ?? 1;

    React.useEffect(() => {
        setRowSelection({});
    }, [
        currentPage,
        perPage,
        q,
        sort,
        dir,
        indexFilters.projectId,
        indexFilters.dateFrom,
        indexFilters.dateTo,
        statusFilter,
    ]);

    const slOffset =
        (currentPage - 1) *
        (schedules?.meta?.per_page ?? schedules?.per_page ?? 15);
    const isTodayFilterActive =
        indexFilters.dateFrom === todayDate &&
        indexFilters.dateTo === todayDate &&
        statusFilter === '';
    const isPendingFilterActive = statusFilter === 'pending';
    const isTotalFilterActive = !isTodayFilterActive && !isPendingFilterActive;
    const hasSearch = q.length > 0;
    const hasActiveFilters =
        hasSearch ||
        !!indexFilters.projectId ||
        !!indexFilters.dateFrom ||
        !!indexFilters.dateTo ||
        !!statusFilter;
    const isEmpty = schedules.data.length === 0;

    const toggleSelected = React.useCallback((id: number) => {
        const key = String(id);

        setRowSelection((current) => {
            if (current[key]) {
                const next = { ...current };
                delete next[key];

                return next;
            }

            return { ...current, [key]: true };
        });
    }, []);

    const setRowSelected = React.useCallback(
        (id: number, selected: boolean) => {
            const key = String(id);

            setRowSelection((current) => {
                const next = { ...current };

                if (selected) {
                    next[key] = true;
                } else {
                    delete next[key];
                }

                return next;
            });
        },
        [],
    );

    const setAllOnPageSelected = React.useCallback(
        (selected: boolean) => {
            setRowSelection((current) => {
                const next = { ...current };

                if (selected) {
                    schedules.data.forEach((schedule) => {
                        next[String(schedule.id)] = true;
                    });
                } else {
                    schedules.data.forEach((schedule) => {
                        delete next[String(schedule.id)];
                    });
                }

                return next;
            });
        },
        [schedules.data],
    );

    const clearSelection = React.useCallback(() => {
        setRowSelection({});
    }, []);

    const openShare = React.useCallback((items: ScheduleRow[]) => {
        setShareSchedules(items);
    }, []);

    const { requestConfirm, ConfirmDialog } = useConfirmDialog();

    const confirmDelete = React.useCallback(
        (schedule: ScheduleRow) => async () => {
            if (
                !(await requestConfirm({
                    title: 'Delete this schedule?',
                    description: `"${schedule.crew_name}" will be permanently removed.`,
                    confirmText: 'Delete',
                    variant: 'destructive',
                }))
            ) {
                return;
            }

            router.delete(SCHEDULE_ROUTES.destroy(schedule.id), {
                preserveScroll: true,
            });
        },
        [requestConfirm],
    );

    const confirmApprove = React.useCallback(
        (schedule: ScheduleRow) => () => {
            router.post(
                SCHEDULE_ROUTES.approve(schedule.id),
                {},
                { preserveScroll: true },
            );
        },
        [],
    );

    const selectedOnPage = schedules.data.filter(
        (schedule) => rowSelection[String(schedule.id)],
    );
    const selectedCount = selectedOnPage.length;

    const scheduleIdsOnPage = React.useMemo(
        () => schedules.data.map((schedule) => schedule.id),
        [schedules.data],
    );

    const columns = React.useMemo<ColumnDef<ScheduleRow>[]>(
        () => [
            {
                id: 'select',
                header: () => <ScheduleSelectAllCheckbox />,
                cell: ({ row }) => (
                    <ScheduleSelectRowCheckbox
                        id={row.original.id}
                        label={row.original.crew_name}
                    />
                ),
            },
            {
                id: 'slno',
                header: () => (
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        #
                    </span>
                ),
                cell: ({ row }) => (
                    <span className="text-[13px] text-muted-foreground tabular-nums">
                        {slOffset + row.index + 1}
                    </span>
                ),
            },
            {
                accessorKey: 'crew_name',
                header: () => (
                    <SortableHeader
                        label="Crew"
                        column="crew_name"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-600/15 text-primary ring-1 ring-border dark:ring-white/10">
                            <CalendarClock className="size-4" />
                        </div>
                        <span className="font-semibold text-foreground/90">
                            {row.original.crew_name}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'scheduled_date',
                header: () => (
                    <SortableHeader
                        label="Date"
                        column="scheduled_date"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-[13px] text-foreground">
                        {formatScheduleDate(row.original.scheduled_date)}
                    </span>
                ),
            },
            {
                id: 'project',
                header: () => (
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Project
                    </span>
                ),
                cell: ({ row }) => (
                    <Badge
                        variant="secondary"
                        className="rounded-md text-[11px]"
                    >
                        {row.original.project?.title ?? '—'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'pick_up_time',
                header: () => (
                    <SortableHeader
                        label="Time"
                        column="pick_up_time"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-[13px] text-foreground">
                        {formatPickUpTime(row.original.pick_up_time)}
                    </span>
                ),
            },
            {
                accessorKey: 'pick_up_location',
                header: () => (
                    <SortableHeader
                        label="Pick up"
                        column="pick_up_location"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <span className="max-w-[12rem] truncate text-[13px] text-foreground">
                        {row.original.pick_up_location}
                    </span>
                ),
            },
            {
                accessorKey: 'drop_off_location',
                header: () => (
                    <SortableHeader
                        label="Drop off"
                        column="drop_off_location"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <span className="max-w-[12rem] truncate text-[13px] text-foreground">
                        {row.original.drop_off_location}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: () => (
                    <SortableHeader
                        label="Status"
                        column="status"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <ScheduleStatusBadge status={row.original.status} />
                ),
            },
            {
                accessorKey: 'created_at',
                header: () => (
                    <SortableHeader
                        label="Created"
                        column="created_at"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] text-foreground">
                            {formatCreatedAt(row.original.created_at)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            {row.original.created_by?.name ?? '—'}
                        </span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: () => (
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Actions
                    </span>
                ),
                cell: ({ row }) => {
                    const canModify = canUserModifySchedule(
                        isAdmin,
                        row.original.status,
                    );

                    return (
                        <RowActions
                            showUrl={SCHEDULE_ROUTES.show(row.original.id)}
                            editUrl={
                                canModify
                                    ? SCHEDULE_ROUTES.edit(row.original.id)
                                    : undefined
                            }
                            onDelete={
                                canModify
                                    ? confirmDelete(row.original)
                                    : undefined
                            }
                            onShare={() => openShare([row.original])}
                            onApprove={
                                isAdmin && row.original.status === 'pending'
                                    ? confirmApprove(row.original)
                                    : undefined
                            }
                        />
                    );
                },
            },
        ],
        [
            slOffset,
            sort,
            dir,
            toggleSort,
            confirmDelete,
            openShare,
            isAdmin,
            confirmApprove,
        ],
    );

    const table = useReactTable({
        data: schedules.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    const listResultsKey = React.useMemo(
        () =>
            schedules.data.map((schedule) => schedule.id).join('-') || 'empty',
        [schedules.data],
    );

    const cardSelectionProps = {
        rowSelection,
        onToggleSelect: toggleSelected,
    };

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <PullToRefresh
                only={[
                    'schedules',
                    'totalCount',
                    'todayCount',
                    'pendingCount',
                    'projects',
                ]}
            >
                <ConfirmDialog />
                <ScheduleShareModal
                    schedules={shareSchedules ?? []}
                    open={shareSchedules !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setShareSchedules(null);
                        }
                    }}
                />
                <Head title="Schedules" />

                <SectionHeader
                    title="Schedules"
                    subtitle="Manage crew transport schedules with pick-up and drop-off details."
                    icon={CalendarClock}
                    iconWrapperClassName="bg-linear-to-br from-emerald-500/15 to-teal-600/15"
                    iconClassName="text-emerald-500"
                    right={
                        <Button
                            asChild
                            className="h-11 w-full rounded-full px-5 shadow-lg shadow-primary/20 sm:w-auto"
                        >
                            <Link href={SCHEDULE_ROUTES.create} prefetch>
                                <Plus className="size-4" />
                                New Schedule
                            </Link>
                        </Button>
                    }
                    className="mb-6 sm:mb-8"
                />

                <Deferred
                    data={['totalCount', 'todayCount', 'pendingCount']}
                    fallback={
                        <StatCardsSkeleton
                            count={3}
                            columns="grid-cols-1 sm:grid-cols-3"
                            className="mb-6"
                        />
                    }
                >
                    <ScheduleStatCards
                        todayDate={todayDate}
                        isTodayFilterActive={isTodayFilterActive}
                        isTotalFilterActive={isTotalFilterActive}
                        isPendingFilterActive={isPendingFilterActive}
                        visitIndex={visitIndex}
                    />
                </Deferred>

                <IndexToolbar
                    search={q}
                    onSearchChange={setQ}
                    searchPlaceholder="Search crew, project, location…"
                    hasSearch={hasActiveFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                <Deferred
                    data="projects"
                    fallback={
                        <div className="mb-4 rounded-2xl border border-border/50 bg-card/40 p-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    }
                >
                    <ScheduleFiltersSection
                        indexFilters={indexFilters}
                        visitIndex={visitIndex}
                    />
                </Deferred>

                <BulkActionBar
                    count={selectedCount}
                    onClear={clearSelection}
                    onShare={() => openShare(selectedOnPage)}
                />

                {isEmpty ? (
                    <EmptyState
                        icon={CalendarClock}
                        title={
                            hasActiveFilters
                                ? 'No matches found'
                                : 'No schedules yet'
                        }
                        description={
                            hasActiveFilters
                                ? 'Try adjusting your search or filters to see more schedules.'
                                : 'Create your first schedule to start managing crew transport.'
                        }
                        action={
                            !hasActiveFilters ? (
                                <Button
                                    asChild
                                    className="rounded-full px-6 shadow-lg shadow-primary/20"
                                >
                                    <Link
                                        href={SCHEDULE_ROUTES.create}
                                        prefetch
                                    >
                                        <Plus className="size-4" />
                                        Add Schedule
                                    </Link>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : viewMode === 'list' ? (
                    isMobile ? (
                        <ScheduleListCards
                            schedules={schedules.data}
                            onDelete={confirmDelete}
                            onShare={(schedule) => openShare([schedule])}
                            onApprove={isAdmin ? confirmApprove : undefined}
                            isAdmin={isAdmin}
                            {...cardSelectionProps}
                        />
                    ) : (
                        <ScheduleSelectionProvider
                            key={listResultsKey}
                            rowSelection={rowSelection}
                            setRowSelected={setRowSelected}
                            setAllOnPageSelected={setAllOnPageSelected}
                            scheduleIdsOnPage={scheduleIdsOnPage}
                        >
                            <ScheduleTable table={table} />
                        </ScheduleSelectionProvider>
                    )
                ) : (
                    <ScheduleGridCards
                        schedules={schedules.data}
                        onDelete={confirmDelete}
                        onShare={(schedule) => openShare([schedule])}
                        onApprove={isAdmin ? confirmApprove : undefined}
                        isAdmin={isAdmin}
                        {...cardSelectionProps}
                    />
                )}

                {!isEmpty && schedules.links?.length > 0 && (
                    <PaginationBar
                        links={schedules.links}
                        onVisit={(url) =>
                            router.get(
                                url,
                                {},
                                {
                                    preserveScroll: true,
                                    only: ['schedules', 'filters'],
                                },
                            )
                        }
                        left={
                            <RowsPerPageSelect
                                value={perPage}
                                onChange={setPerPage}
                            />
                        }
                    />
                )}
            </PullToRefresh>
        </ModulePageLayout>
    );
}

type SchedulePageProps = {
    totalCount: number;
    todayCount: number;
    pendingCount: number;
    projects: ProjectFilterOption[];
};

function ScheduleStatCards({
    todayDate,
    isTodayFilterActive,
    isTotalFilterActive,
    isPendingFilterActive,
    visitIndex,
}: {
    todayDate: string;
    isTodayFilterActive: boolean;
    isTotalFilterActive: boolean;
    isPendingFilterActive: boolean;
    visitIndex: (overrides?: {
        projectId?: string;
        dateFrom?: string;
        dateTo?: string;
        status?: string;
    }) => void;
}) {
    const { totalCount, todayCount, pendingCount } =
        usePage<SchedulePageProps>().props;

    return (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <GlassCard
                as="button"
                type="button"
                level="inner"
                onClick={() =>
                    visitIndex({
                        dateFrom: '',
                        dateTo: '',
                        status: '',
                        projectId: '',
                    })
                }
                className={cn(
                    'w-full px-4 py-3.5 text-left transition-all hover:bg-background/60',
                    isTotalFilterActive && 'ring-2 ring-primary/40',
                )}
            >
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Total
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {totalCount}
                </p>
            </GlassCard>
            <GlassCard
                as="button"
                type="button"
                level="inner"
                onClick={() =>
                    visitIndex({
                        dateFrom: todayDate,
                        dateTo: todayDate,
                        status: '',
                    })
                }
                className={cn(
                    'w-full px-4 py-3.5 text-left transition-all hover:bg-background/60',
                    isTodayFilterActive && 'ring-2 ring-emerald-500/50',
                )}
            >
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Today
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {todayCount}
                </p>
            </GlassCard>
            <GlassCard
                as="button"
                type="button"
                level="inner"
                onClick={() =>
                    visitIndex({
                        dateFrom: '',
                        dateTo: '',
                        status: 'pending',
                    })
                }
                className={cn(
                    'w-full px-4 py-3.5 text-left transition-all hover:bg-background/60',
                    isPendingFilterActive && 'ring-2 ring-amber-500/50',
                )}
            >
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Pending
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {pendingCount}
                </p>
            </GlassCard>
        </div>
    );
}

function ScheduleFiltersSection({
    indexFilters,
    visitIndex,
}: {
    indexFilters: { projectId: string; dateFrom: string; dateTo: string };
    visitIndex: (overrides?: {
        projectId?: string;
        dateFrom?: string;
        dateTo?: string;
    }) => void;
}) {
    const { projects } = usePage<SchedulePageProps>().props;

    return (
        <ScheduleIndexFilters
            projects={projects}
            value={indexFilters}
            onChange={(next) =>
                visitIndex({
                    projectId: next.projectId,
                    dateFrom: next.dateFrom,
                    dateTo: next.dateTo,
                })
            }
            onClear={() =>
                visitIndex({ projectId: '', dateFrom: '', dateTo: '' })
            }
        />
    );
}
