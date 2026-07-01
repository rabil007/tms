import { FolderKanban, MapPin, TrendingUp } from 'lucide-react';
import type { ElementType } from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { cn } from '@/lib/utils';

export type ScheduleTrendPoint = {
    date: string;
    label: string;
    count: number;
};

export type MonthlyTrendPoint = {
    label: string;
    year: number;
    count: number;
};

export type TopProject = {
    id: number;
    title: string;
    count: number;
    percentage: number;
};

export type TopPickUpLocation = {
    location: string;
    count: number;
};

export type OverviewAnalytics = {
    scheduleTrend: ScheduleTrendPoint[];
    monthlyTrend: MonthlyTrendPoint[];
    topProjects: TopProject[];
    topPickUpLocations: TopPickUpLocation[];
};

function PanelEmpty({
    icon: Icon,
    title,
}: {
    icon: ElementType;
    title: string;
}) {
    return (
        <div className="flex min-h-32 flex-col items-center justify-center px-4 py-8 text-center">
            <Icon className="mb-2 size-5 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">{title}</p>
        </div>
    );
}

function maxCount<T extends { count: number }>(items: T[]): number {
    return items.reduce((max, item) => Math.max(max, item.count), 0);
}

export function ScheduleForecastPanel({
    data,
}: {
    data: ScheduleTrendPoint[];
}) {
    const peak = maxCount(data);

    return (
        <GlassCard className="flex flex-col overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <TrendingUp className="size-4 text-emerald-500" />
                    <div>
                        <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                            7-day forecast
                        </h3>
                        <p className="text-[12px] text-muted-foreground">
                            Schedules per day (today through next 6 days)
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5">
                {peak === 0 ? (
                    <PanelEmpty
                        icon={TrendingUp}
                        title="No upcoming schedules in the next 7 days."
                    />
                ) : (
                    <div className="flex h-36 items-end gap-2 sm:gap-3">
                        {data.map((point) => {
                            const height =
                                peak > 0
                                    ? Math.max(
                                          (point.count / peak) * 100,
                                          point.count > 0 ? 8 : 0,
                                      )
                                    : 0;

                            return (
                                <div
                                    key={point.date}
                                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                                >
                                    <span className="text-[11px] font-bold text-foreground tabular-nums">
                                        {point.count}
                                    </span>
                                    <div className="flex w-full flex-1 items-end">
                                        <div
                                            className="w-full rounded-t-lg bg-linear-to-t from-emerald-600 to-emerald-400/80 transition-all"
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <span className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        {point.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

export function MonthlyTrendPanel({ data }: { data: MonthlyTrendPoint[] }) {
    const peak = maxCount(data);
    const currentYear = data.at(-1)?.year;

    return (
        <GlassCard className="flex flex-col overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <TrendingUp className="size-4 text-primary" />
                    <div>
                        <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                            Monthly volume
                        </h3>
                        <p className="text-[12px] text-muted-foreground">
                            Schedules by month
                            {currentYear ? ` · ${currentYear}` : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5">
                {peak === 0 ? (
                    <PanelEmpty
                        icon={TrendingUp}
                        title="No schedule history yet."
                    />
                ) : (
                    <div className="flex h-36 items-end gap-2 sm:gap-3">
                        {data.map((point) => {
                            const height =
                                peak > 0
                                    ? Math.max(
                                          (point.count / peak) * 100,
                                          point.count > 0 ? 8 : 0,
                                      )
                                    : 0;

                            return (
                                <div
                                    key={`${point.year}-${point.label}`}
                                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                                >
                                    <span className="text-[11px] font-bold text-foreground tabular-nums">
                                        {point.count}
                                    </span>
                                    <div className="flex w-full flex-1 items-end">
                                        <div
                                            className="w-full rounded-t-lg bg-linear-to-t from-primary to-primary/60 transition-all"
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <span className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        {point.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

function HorizontalBarList({
    items,
    getLabel,
    getValue,
    barClassName,
}: {
    items: Array<{ key: string; label: string; value: number; meta?: string }>;
    getLabel: (item: {
        key: string;
        label: string;
        value: number;
        meta?: string;
    }) => string;
    getValue: (item: {
        key: string;
        label: string;
        value: number;
        meta?: string;
    }) => number;
    barClassName?: string;
}) {
    const peak = items.reduce((max, item) => Math.max(max, getValue(item)), 0);

    return (
        <ul className="space-y-3.5">
            {items.map((item) => {
                const value = getValue(item);
                const width = peak > 0 ? (value / peak) * 100 : 0;

                return (
                    <li key={item.key}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="truncate text-[13px] font-medium text-foreground">
                                {getLabel(item)}
                            </span>
                            <span className="shrink-0 text-[12px] font-semibold text-muted-foreground tabular-nums">
                                {value}
                                {item.meta ? ` · ${item.meta}` : ''}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all',
                                    barClassName ?? 'bg-primary',
                                )}
                                style={{ width: `${width}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export function TopProjectsPanel({ data }: { data: TopProject[] }) {
    const items = data.map((project) => ({
        key: String(project.id),
        label: project.title,
        value: project.count,
        meta: `${project.percentage}%`,
    }));

    return (
        <GlassCard className="flex flex-col overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <FolderKanban className="size-4 text-violet-500" />
                    <div>
                        <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                            By project
                        </h3>
                        <p className="text-[12px] text-muted-foreground">
                            Top projects by schedule count
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5">
                {data.length === 0 ? (
                    <PanelEmpty
                        icon={FolderKanban}
                        title="No project breakdown available yet."
                    />
                ) : (
                    <HorizontalBarList
                        items={items}
                        getLabel={(item) => item.label}
                        getValue={(item) => item.value}
                        barClassName="bg-violet-500"
                    />
                )}
            </div>
        </GlassCard>
    );
}

export function TopPickUpLocationsPanel({
    data,
}: {
    data: TopPickUpLocation[];
}) {
    const items = data.map((row, index) => ({
        key: `${index}-${row.location}`,
        label: row.location,
        value: row.count,
    }));

    return (
        <GlassCard className="flex flex-col overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <MapPin className="size-4 text-sky-500" />
                    <div>
                        <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                            Top pick-up locations
                        </h3>
                        <p className="text-[12px] text-muted-foreground">
                            Most frequent crew pick-up points
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5">
                {data.length === 0 ? (
                    <PanelEmpty
                        icon={MapPin}
                        title="No pick-up location data yet."
                    />
                ) : (
                    <HorizontalBarList
                        items={items}
                        getLabel={(item) => item.label}
                        getValue={(item) => item.value}
                        barClassName="bg-sky-500"
                    />
                )}
            </div>
        </GlassCard>
    );
}
