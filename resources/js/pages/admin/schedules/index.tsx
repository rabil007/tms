import { Head, Link, router } from '@inertiajs/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { CalendarClock, Plus } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { SectionHeader } from '@/components/layout/section-header';
import { EmptyState } from '@/components/list/empty-state';
import { IndexToolbar } from '@/components/list/index-toolbar';
import { PaginationBar } from '@/components/list/pagination-bar';
import { RowActions } from '@/components/list/row-actions';
import { RowsPerPageSelect } from '@/components/list/rows-per-page-select';
import { SortableHeader } from '@/components/list/sortable-header';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useIndexQueryParams } from '@/hooks/use-index-query-params';
import { useIndexViewMode } from '@/hooks/use-index-view-mode';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    formatPickUpTime,
    formatScheduleDate,
    SCHEDULE_ROUTES,
    ScheduleGridCards,
    ScheduleListCards,
    ScheduleTable,
    type ScheduleRow,
} from '@/pages/admin/schedules/schedule-views';

type Paged<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
};

const ALLOWED_SORTS = ['crew_name', 'scheduled_date', 'pick_up_time', 'pick_up_location', 'drop_off_location'];

export default function SchedulesIndex({
    schedules,
    filters,
}: {
    schedules: Paged<ScheduleRow>;
    filters: { q?: string; sort?: string; dir?: 'asc' | 'desc'; per_page?: number };
}) {
    const isMobile = useIsMobile();
    const { viewMode, setViewMode } = useIndexViewMode({ storageKey: 'schedules:index:view' });

    const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } = useIndexQueryParams({
        href: SCHEDULE_ROUTES.index,
        filters,
        defaultPerPage: 15,
        defaultSort: 'scheduled_date',
        allowedSorts: ALLOWED_SORTS,
    });

    const slOffset = ((schedules?.meta?.current_page ?? 1) - 1) * (schedules?.meta?.per_page ?? 15);
    const total = schedules?.meta?.total ?? 0;
    const hasSearch = q.length > 0;
    const isEmpty = schedules.data.length === 0;

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

            router.delete(SCHEDULE_ROUTES.destroy(schedule.id), { preserveScroll: true });
        },
        [requestConfirm],
    );

    const columns = React.useMemo<ColumnDef<ScheduleRow>[]>(
        () => [
            {
                id: 'slno',
                header: () => <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</span>,
                cell: ({ row }) => (
                    <span className="text-[13px] tabular-nums text-muted-foreground">{slOffset + row.index + 1}</span>
                ),
            },
            {
                accessorKey: 'crew_name',
                header: () => (
                    <SortableHeader label="Crew" column="crew_name" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-600/15 text-primary ring-1 ring-white/10">
                            <CalendarClock className="size-4" />
                        </div>
                        <span className="font-medium text-foreground">{row.original.crew_name}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'scheduled_date',
                header: () => (
                    <SortableHeader label="Date" column="scheduled_date" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <span className="text-[13px] text-foreground">{formatScheduleDate(row.original.scheduled_date)}</span>
                ),
            },
            {
                id: 'project',
                header: () => (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</span>
                ),
                cell: ({ row }) => (
                    <Badge variant="secondary" className="rounded-md text-[11px]">
                        {row.original.project?.title ?? '—'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'pick_up_time',
                header: () => (
                    <SortableHeader label="Time" column="pick_up_time" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-[13px] text-foreground">{formatPickUpTime(row.original.pick_up_time)}</span>
                ),
            },
            {
                accessorKey: 'pick_up_location',
                header: () => (
                    <SortableHeader label="Pick up" column="pick_up_location" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <span className="max-w-[12rem] truncate text-[13px] text-foreground">{row.original.pick_up_location}</span>
                ),
            },
            {
                accessorKey: 'drop_off_location',
                header: () => (
                    <SortableHeader label="Drop off" column="drop_off_location" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <span className="max-w-[12rem] truncate text-[13px] text-foreground">{row.original.drop_off_location}</span>
                ),
            },
            {
                id: 'actions',
                header: () => (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
                ),
                cell: ({ row }) => (
                    <RowActions
                        showUrl={SCHEDULE_ROUTES.show(row.original.id)}
                        editUrl={SCHEDULE_ROUTES.edit(row.original.id)}
                        onDelete={confirmDelete(row.original)}
                        showLabel="View schedule"
                        editLabel="Edit schedule"
                        deleteLabel="Delete schedule"
                    />
                ),
            },
        ],
        [slOffset, sort, dir, toggleSort, confirmDelete],
    );

    const table = useReactTable({
        data: schedules.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <ConfirmDialog />
            <Head title="Schedules" />

            <SectionHeader
                title="Schedules"
                subtitle="Manage crew transport schedules with pick-up and drop-off details."
                icon={CalendarClock}
                iconWrapperClassName="bg-linear-to-br from-emerald-500/15 to-teal-600/15"
                iconClassName="text-emerald-500"
                right={
                    <Button asChild className="h-11 w-full rounded-full px-5 shadow-lg shadow-primary/20 sm:w-auto">
                        <Link href={SCHEDULE_ROUTES.create}>
                            <Plus className="size-4" />
                            New Schedule
                        </Link>
                    </Button>
                }
                className="mb-6 sm:mb-8"
            />

            <div className="mb-6 grid grid-cols-2 gap-3">
                <GlassCard level="inner" className="px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">{total}</p>
                </GlassCard>
                <GlassCard level="inner" className="px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Showing</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                        {schedules.data.length}
                    </p>
                </GlassCard>
            </div>

            <IndexToolbar
                search={q}
                onSearchChange={setQ}
                searchPlaceholder="Search crew, project, location…"
                hasSearch={hasSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {isEmpty ? (
                <EmptyState
                    icon={CalendarClock}
                    title={hasSearch ? 'No matches found' : 'No schedules yet'}
                    description={
                        hasSearch
                            ? 'Try adjusting your search or clear the filter to see all schedules.'
                            : 'Create your first schedule to start managing crew transport.'
                    }
                    action={
                        !hasSearch ? (
                            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                                <Link href={SCHEDULE_ROUTES.create}>
                                    <Plus className="size-4" />
                                    Add Schedule
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            ) : viewMode === 'list' ? (
                isMobile ? (
                    <ScheduleListCards schedules={schedules.data} onDelete={confirmDelete} />
                ) : (
                    <ScheduleTable table={table} />
                )
            ) : (
                <ScheduleGridCards schedules={schedules.data} onDelete={confirmDelete} />
            )}

            {!isEmpty && schedules.links?.length > 0 && (
                <PaginationBar
                    links={schedules.links}
                    onVisit={(url) => router.get(url, {}, { preserveScroll: true, preserveState: true })}
                    left={<RowsPerPageSelect value={perPage} onChange={setPerPage} />}
                />
            )}
        </ModulePageLayout>
    );
}
