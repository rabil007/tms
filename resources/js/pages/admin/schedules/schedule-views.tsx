import { router } from '@inertiajs/react';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { RowActions } from '@/components/list/row-actions';
import { ResourceTable } from '@/components/list/resource-table';
import { Badge } from '@/components/ui/badge';
import type { Table } from '@tanstack/react-table';

export const SCHEDULE_ROUTES = {
    index: '/schedules',
    create: '/schedules/create',
    show: (id: number) => `/schedules/${id}`,
    edit: (id: number) => `/schedules/${id}/edit`,
    destroy: (id: number) => `/schedules/${id}`,
} as const;

export type ScheduleRow = {
    id: number;
    crew_name: string;
    scheduled_date: string;
    crew_contact: string;
    project_id: number;
    pick_up_location: string;
    drop_off_location: string;
    pick_up_time: string;
    remarks: string | null;
    project?: { id: number; title: string };
};

export function formatScheduleDate(value: string): string {
    if (!value) {
        return '—';
    }

    const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function parsePickUpTime(value: string): Date | null {
    if (!value) {
        return null;
    }

    const timeMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (timeMatch) {
        const date = new Date();
        date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), Number(timeMatch[3] ?? 0), 0);

        return date;
    }

    if (value.includes('T')) {
        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
}

export function formatPickUpTime(value: string): string {
    const date = parsePickUpTime(value);

    if (!date) {
        return value;
    }

    return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function toTimeInputValue(value: string): string {
    const date = parsePickUpTime(value);

    if (!date) {
        return value.slice(0, 5);
    }

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

type ScheduleTableProps = {
    table: Table<ScheduleRow>;
};

export function ScheduleTable({ table }: ScheduleTableProps) {
    return (
        <ResourceTable
            table={table}
            onRowClick={(schedule) => router.get(SCHEDULE_ROUTES.show(schedule.id))}
        />
    );
}

type ScheduleCardsProps = {
    schedules: ScheduleRow[];
    onDelete: (schedule: ScheduleRow) => () => Promise<void>;
};

function ScheduleIcon() {
    return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-teal-600/15 text-primary ring-1 ring-white/10">
            <CalendarClock className="size-5" />
        </div>
    );
}

export function ScheduleListCards({ schedules, onDelete }: ScheduleCardsProps) {
    return (
        <div className="space-y-3">
            {schedules.map((schedule) => (
                <GlassCard
                    key={schedule.id}
                    className="group cursor-pointer p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(SCHEDULE_ROUTES.show(schedule.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(SCHEDULE_ROUTES.show(schedule.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3.5">
                        <ScheduleIcon />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{schedule.crew_name}</p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                {formatScheduleDate(schedule.scheduled_date)} · {formatPickUpTime(schedule.pick_up_time)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {schedule.project?.title && (
                                    <Badge variant="secondary" className="rounded-md text-[11px]">
                                        {schedule.project.title}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="max-w-full truncate rounded-md text-[11px]">
                                    {schedule.pick_up_location}
                                </Badge>
                            </div>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={SCHEDULE_ROUTES.show(schedule.id)}
                            editUrl={SCHEDULE_ROUTES.edit(schedule.id)}
                            onDelete={onDelete(schedule)}
                            showLabel="View schedule"
                            editLabel="Edit schedule"
                            deleteLabel="Delete schedule"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export function ScheduleGridCards({ schedules, onDelete }: ScheduleCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((schedule) => (
                <GlassCard
                    key={schedule.id}
                    className="group flex cursor-pointer flex-col p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(SCHEDULE_ROUTES.show(schedule.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(SCHEDULE_ROUTES.show(schedule.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <ScheduleIcon />
                    <p className="mt-3 line-clamp-1 font-semibold text-foreground">{schedule.crew_name}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        {formatScheduleDate(schedule.scheduled_date)} · {formatPickUpTime(schedule.pick_up_time)}
                    </p>
                    {schedule.project?.title && (
                        <Badge variant="secondary" className="mt-2 w-fit rounded-md text-[11px]">
                            {schedule.project.title}
                        </Badge>
                    )}
                    <p className="mt-2 line-clamp-2 text-[12px] text-muted-foreground">
                        {schedule.pick_up_location} → {schedule.drop_off_location}
                    </p>
                    <div className="mt-auto flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={SCHEDULE_ROUTES.show(schedule.id)}
                            editUrl={SCHEDULE_ROUTES.edit(schedule.id)}
                            onDelete={onDelete(schedule)}
                            showLabel="View schedule"
                            editLabel="Edit schedule"
                            deleteLabel="Delete schedule"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
