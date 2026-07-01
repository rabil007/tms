import { router } from '@inertiajs/react';
import type { RowSelectionState, Table } from '@tanstack/react-table';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { ResourceTable } from '@/components/list/resource-table';
import { RowActions } from '@/components/list/row-actions';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    canUserModifySchedule,
    formatCreatedAt,
    formatPickUpTime,
    formatScheduleDate,
    scheduleStatusLabel,
    SCHEDULE_ROUTES,
} from '@/pages/admin/schedules/schedule-format';
import type {
    ScheduleRow,
    ScheduleStatus,
} from '@/pages/admin/schedules/schedule-format';

export {
    canUserModifySchedule,
    formatCreatedAt,
    formatPickUpTime,
    formatScheduleDate,
    scheduleStatusLabel,
    SCHEDULE_ROUTES,
    toTimeInputValue,
    type ScheduleRow,
    type ScheduleStatus,
} from '@/pages/admin/schedules/schedule-format';

export function ScheduleStatusBadge({
    status,
    className,
}: {
    status: ScheduleStatus;
    className?: string;
}) {
    return (
        <Badge
            variant={status === 'pending' ? 'outline' : 'secondary'}
            className={cn(
                status === 'pending'
                    ? 'rounded-md border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300'
                    : 'rounded-md bg-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-300',
                className,
            )}
        >
            {scheduleStatusLabel(status)}
        </Badge>
    );
}

type ScheduleTableProps = {
    table: Table<ScheduleRow>;
};

export function ScheduleTable({ table }: ScheduleTableProps) {
    return (
        <ResourceTable
            table={table}
            onRowClick={(schedule) =>
                router.get(SCHEDULE_ROUTES.show(schedule.id))
            }
        />
    );
}

type ScheduleCardsProps = {
    schedules: ScheduleRow[];
    onDelete: (schedule: ScheduleRow) => () => Promise<void>;
    onShare: (schedule: ScheduleRow) => void;
    onApprove?: (schedule: ScheduleRow) => () => void;
    isAdmin?: boolean;
    rowSelection: RowSelectionState;
    onToggleSelect: (id: number) => void;
};

function scheduleRowActionsProps(
    schedule: ScheduleRow,
    onDelete: () => Promise<void>,
    onShare: (schedule: ScheduleRow) => void,
    onApprove?: (schedule: ScheduleRow) => () => void,
    isAdmin = false,
) {
    const canModify = canUserModifySchedule(isAdmin, schedule.status);

    return {
        showUrl: SCHEDULE_ROUTES.show(schedule.id),
        editUrl: canModify ? SCHEDULE_ROUTES.edit(schedule.id) : undefined,
        onDelete: canModify ? onDelete : undefined,
        onShare: () => onShare(schedule),
        onApprove:
            onApprove && schedule.status === 'pending'
                ? onApprove(schedule)
                : undefined,
        showLabel: 'View schedule',
        editLabel: 'Edit schedule',
        deleteLabel: 'Delete schedule',
        shareLabel: 'Share schedule',
        approveLabel: 'Approve schedule',
    };
}

function ScheduleIcon() {
    return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-teal-600/15 text-primary ring-1 ring-border dark:ring-white/10">
            <CalendarClock className="size-5" />
        </div>
    );
}

function ScheduleCardCheckbox({
    scheduleId,
    rowSelection,
    onToggleSelect,
}: {
    scheduleId: number;
    rowSelection: RowSelectionState;
    onToggleSelect: (id: number) => void;
}) {
    return (
        <div
            className="absolute top-3 left-3 z-10"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <Checkbox
                checked={!!rowSelection[String(scheduleId)]}
                onCheckedChange={() => onToggleSelect(scheduleId)}
                aria-label="Select schedule"
                className="size-5 rounded-md bg-background/80 shadow-sm"
            />
        </div>
    );
}

export function ScheduleListCards({
    schedules,
    onDelete,
    onShare,
    onApprove,
    isAdmin = false,
    rowSelection,
    onToggleSelect,
}: ScheduleCardsProps) {
    return (
        <div className="space-y-3">
            {schedules.map((schedule) => (
                <GlassCard
                    key={schedule.id}
                    className="group relative cursor-pointer p-4 pt-10 transition-all hover:border-primary/25 hover:bg-card/60 active:scale-[0.99]"
                    onClick={() =>
                        router.get(SCHEDULE_ROUTES.show(schedule.id))
                    }
                    onMouseEnter={() =>
                        router.prefetch(SCHEDULE_ROUTES.show(schedule.id))
                    }
                    onTouchStart={() =>
                        router.prefetch(SCHEDULE_ROUTES.show(schedule.id))
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(SCHEDULE_ROUTES.show(schedule.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <ScheduleCardCheckbox
                        scheduleId={schedule.id}
                        rowSelection={rowSelection}
                        onToggleSelect={onToggleSelect}
                    />
                    <div className="flex items-center gap-3.5">
                        <ScheduleIcon />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">
                                {schedule.crew_name}
                            </p>
                            <p className="mt-1 text-[13px] text-foreground/70">
                                {formatScheduleDate(schedule.scheduled_date)} ·{' '}
                                {formatPickUpTime(schedule.pick_up_time)}
                            </p>
                            <p className="mt-1 text-[12px] text-muted-foreground">
                                Created {formatCreatedAt(schedule.created_at)}
                                {schedule.created_by?.name
                                    ? ` · ${schedule.created_by.name}`
                                    : ''}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <ScheduleStatusBadge status={schedule.status} />
                                {schedule.project?.title && (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-md text-[11px]"
                                    >
                                        {schedule.project.title}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="max-w-full truncate rounded-md text-[11px]"
                                >
                                    {schedule.pick_up_location}
                                </Badge>
                            </div>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-foreground/35 transition-colors group-hover:text-foreground/60" />
                    </div>
                    <div className="mt-4 flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            {...scheduleRowActionsProps(
                                schedule,
                                onDelete(schedule),
                                onShare,
                                onApprove,
                                isAdmin,
                            )}
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export function ScheduleGridCards({
    schedules,
    onDelete,
    onShare,
    onApprove,
    isAdmin = false,
    rowSelection,
    onToggleSelect,
}: ScheduleCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((schedule) => (
                <GlassCard
                    key={schedule.id}
                    className="group relative flex cursor-pointer flex-col p-4 pt-10 transition-all hover:border-primary/25 hover:bg-card/60 active:scale-[0.99]"
                    onClick={() =>
                        router.get(SCHEDULE_ROUTES.show(schedule.id))
                    }
                    onMouseEnter={() =>
                        router.prefetch(SCHEDULE_ROUTES.show(schedule.id))
                    }
                    onTouchStart={() =>
                        router.prefetch(SCHEDULE_ROUTES.show(schedule.id))
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(SCHEDULE_ROUTES.show(schedule.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <ScheduleCardCheckbox
                        scheduleId={schedule.id}
                        rowSelection={rowSelection}
                        onToggleSelect={onToggleSelect}
                    />
                    <ScheduleIcon />
                    <p className="mt-3 line-clamp-1 font-semibold text-foreground">
                        {schedule.crew_name}
                    </p>
                    <p className="mt-1 text-[13px] text-foreground/70">
                        {formatScheduleDate(schedule.scheduled_date)} ·{' '}
                        {formatPickUpTime(schedule.pick_up_time)}
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                        Created {formatCreatedAt(schedule.created_at)}
                        {schedule.created_by?.name
                            ? ` · ${schedule.created_by.name}`
                            : ''}
                    </p>
                    <ScheduleStatusBadge
                        status={schedule.status}
                        className="mt-2 w-fit"
                    />
                    {schedule.project?.title && (
                        <Badge
                            variant="secondary"
                            className="mt-2 w-fit rounded-md text-[11px]"
                        >
                            {schedule.project.title}
                        </Badge>
                    )}
                    <p className="mt-2 line-clamp-2 text-[12px] text-foreground/70">
                        {schedule.pick_up_location} →{' '}
                        {schedule.drop_off_location}
                    </p>
                    <div className="mt-auto flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            {...scheduleRowActionsProps(
                                schedule,
                                onDelete(schedule),
                                onShare,
                                onApprove,
                                isAdmin,
                            )}
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
