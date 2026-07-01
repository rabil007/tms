import { Deferred, Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, CalendarClock, ChevronRight, LayoutDashboard } from 'lucide-react';
import type { ElementType } from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { SectionHeader } from '@/components/layout/section-header';
import { AnalyticsPanelsSkeleton } from '@/components/loading/analytics-panel-skeleton';
import { FeedListSkeleton } from '@/components/loading/feed-list-skeleton';
import { StatCardsSkeleton } from '@/components/loading/stat-cards-skeleton';
import {
    MonthlyTrendPanel,
    ScheduleForecastPanel,
    TopPickUpLocationsPanel,
    TopProjectsPanel
    
} from '@/components/overview/analytics-panels';
import type {OverviewAnalytics} from '@/components/overview/analytics-panels';
import { cn } from '@/lib/utils';
import {
    formatPickUpTime,
    formatScheduleDate,
} from '@/pages/admin/schedules/schedule-views';
import type { Auth } from '@/types';

type OverviewStats = {
    schedules_today: number;
    schedules_upcoming: number;
    schedules_this_month: number;
    schedules_past: number;
    schedules_total: number;
    schedules_created_this_week: number;
    unread_notifications: number;
    users_count?: number;
    projects_count?: number;
};

type RecentSchedule = {
    id: number;
    crew_name: string;
    scheduled_date: string;
    pick_up_time: string;
    project: { title: string } | null;
};

type RecentActivity = {
    id: string;
    title: string;
    message: string;
    action_url: string | null;
    read_at: string | null;
    created_at_diff: string | null;
};

type PageProps = {
    auth: Auth;
    stats: OverviewStats;
    analytics: OverviewAnalytics;
    recentSchedules: RecentSchedule[];
    recentActivity: RecentActivity[];
};

const ROUTES = {
    scheduleShow: (id: number) => `/schedules/${id}`,
    schedulesIndex: '/schedules',
} as const;

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <GlassCard level="inner" className="px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums tracking-tight', accent ?? 'text-foreground')}>
                {value}
            </p>
        </GlassCard>
    );
}

function FeedEmpty({ icon: Icon, title, description }: { icon: ElementType; title: string; description: string }) {
    return (
        <div className="flex h-full min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">{description}</p>
        </div>
    );
}

export default function Overview() {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user?.role?.slug === 'admin';

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <Head title="Overview" />

            <SectionHeader
                title="Overview"
                subtitle={`Welcome back, ${auth.user?.name ?? 'there'}`}
                icon={LayoutDashboard}
                iconWrapperClassName="bg-linear-to-br from-slate-500/15 to-slate-700/15"
                iconClassName="text-slate-500"
                className="mb-6 sm:mb-8"
            />

            <Deferred data="stats" fallback={<StatCardsSkeleton count={isAdmin ? 9 : 7} className="mb-6" />}>
                <OverviewStats isAdmin={isAdmin} />
            </Deferred>

            <Deferred data="analytics" fallback={<AnalyticsPanelsSkeleton />}>
                <OverviewAnalyticsPanels />
            </Deferred>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Deferred
                    data="recentSchedules"
                    fallback={
                        <GlassCard className="overflow-hidden">
                            <div className="border-b border-border/40 px-5 py-4">
                                <SkeletonHeader title="Recent Schedules" icon={CalendarClock} iconClassName="text-emerald-500" />
                            </div>
                            <FeedListSkeleton />
                        </GlassCard>
                    }
                >
                    <RecentSchedulesFeed />
                </Deferred>

                <Deferred
                    data="recentActivity"
                    fallback={
                        <GlassCard className="overflow-hidden">
                            <div className="border-b border-border/40 px-5 py-4">
                                <SkeletonHeader title="Recent Activity" icon={Bell} iconClassName="text-primary" />
                            </div>
                            <FeedListSkeleton />
                        </GlassCard>
                    }
                >
                    <RecentActivityFeed />
                </Deferred>
            </div>
        </ModulePageLayout>
    );
}

function SkeletonHeader({
    title,
    icon: Icon,
    iconClassName,
}: {
    title: string;
    icon: ElementType;
    iconClassName: string;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <Icon className={cn('size-4', iconClassName)} />
            <h3 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
        </div>
    );
}

function OverviewStats({ isAdmin }: { isAdmin: boolean }) {
    const { stats } = usePage<PageProps>().props;

    const statCards = [
        { label: 'Today', value: stats.schedules_today },
        { label: 'This month', value: stats.schedules_this_month },
        { label: 'Next 7 days', value: stats.schedules_upcoming },
        { label: 'Completed', value: stats.schedules_past },
        { label: 'New this week', value: stats.schedules_created_this_week },
        {
            label: 'Unread alerts',
            value: stats.unread_notifications,
            accent: stats.unread_notifications > 0 ? 'text-primary' : undefined,
        },
        { label: 'Total schedules', value: stats.schedules_total },
        ...(isAdmin && stats.users_count !== undefined
            ? [{ label: 'Users', value: stats.users_count }]
            : []),
        ...(isAdmin && stats.projects_count !== undefined
            ? [{ label: 'Projects', value: stats.projects_count }]
            : []),
    ];

    return (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {statCards.map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} accent={card.accent} />
            ))}
        </div>
    );
}

function OverviewAnalyticsPanels() {
    const { analytics } = usePage<PageProps>().props;

    return (
        <>
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <ScheduleForecastPanel data={analytics.scheduleTrend} />
                <MonthlyTrendPanel data={analytics.monthlyTrend} />
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <TopProjectsPanel data={analytics.topProjects} />
                <TopPickUpLocationsPanel data={analytics.topPickUpLocations} />
            </div>
        </>
    );
}

function RecentSchedulesFeed() {
    const { recentSchedules } = usePage<PageProps>().props;

    return (
        <GlassCard className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <CalendarClock className="size-4 text-emerald-500" />
                    <h3 className="text-[15px] font-bold tracking-tight text-foreground">Recent Schedules</h3>
                </div>
                <Link
                    href={ROUTES.schedulesIndex}
                    prefetch
                    className="text-[12px] font-semibold text-primary hover:underline"
                >
                    View all
                </Link>
            </div>

            <div className={cn('custom-scrollbar h-112 overflow-y-auto', recentSchedules.length === 0 && 'h-auto')}>
                {recentSchedules.length === 0 ? (
                    <FeedEmpty
                        icon={CalendarClock}
                        title="No schedules yet"
                        description="New crew transport schedules will appear here."
                    />
                ) : (
                    <ul className="divide-y divide-border/40">
                        {recentSchedules.map((schedule) => (
                            <li key={schedule.id}>
                                <Link
                                    href={ROUTES.scheduleShow(schedule.id)}
                                    prefetch
                                    className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-semibold text-foreground">
                                            {schedule.crew_name}
                                        </p>
                                        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                                            {schedule.project?.title ?? 'No project'}
                                            {' · '}
                                            {formatScheduleDate(schedule.scheduled_date)}
                                            {' · '}
                                            {formatPickUpTime(schedule.pick_up_time)}
                                        </p>
                                    </div>
                                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </GlassCard>
    );
}

function RecentActivityFeed() {
    const { recentActivity } = usePage<PageProps>().props;

    const handleActivityClick = (activity: RecentActivity) => {
        if (activity.action_url) {
            router.visit(activity.action_url);
        }
    };

    return (
        <GlassCard className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <Bell className="size-4 text-primary" />
                    <h3 className="text-[15px] font-bold tracking-tight text-foreground">Recent Activity</h3>
                </div>
            </div>

            <div className={cn('custom-scrollbar h-112 overflow-y-auto', recentActivity.length === 0 && 'h-auto')}>
                {recentActivity.length === 0 ? (
                    <FeedEmpty
                        icon={Bell}
                        title="No recent activity"
                        description="Notifications about schedule changes will show up here."
                    />
                ) : (
                    <ul className="divide-y divide-border/40">
                        {recentActivity.map((activity) => (
                            <li key={activity.id}>
                                <button
                                    type="button"
                                    onClick={() => handleActivityClick(activity)}
                                    disabled={!activity.action_url}
                                    className={cn(
                                        'group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors',
                                        activity.action_url ? 'cursor-pointer hover:bg-muted/30' : 'cursor-default',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'mt-1.5 size-2 shrink-0 rounded-full',
                                            activity.read_at ? 'bg-muted-foreground/30' : 'bg-primary',
                                        )}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-semibold text-foreground">
                                            {activity.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
                                            {activity.message}
                                        </p>
                                        {activity.created_at_diff && (
                                            <p className="mt-1 text-[11px] text-muted-foreground/80">
                                                {activity.created_at_diff}
                                            </p>
                                        )}
                                    </div>
                                    {activity.action_url && (
                                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </GlassCard>
    );
}
