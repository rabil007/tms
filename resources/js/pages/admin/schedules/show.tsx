import { Head, Link } from '@inertiajs/react';
import { Pencil, Share2 } from 'lucide-react';
import React from 'react';
import { ScheduleShareModal } from '@/components/schedules/schedule-share-modal';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { Button } from '@/components/ui/button';
import { formatPickUpTime, formatScheduleDate } from '@/pages/admin/schedules/schedule-views';

const ROUTES = {
    index: '/schedules',
    edit: (id: number) => `/schedules/${id}/edit`,
} as const;

type Schedule = {
    id: number;
    crew_name: string;
    scheduled_date: string;
    crew_contact: string;
    pick_up_location: string;
    drop_off_location: string;
    pick_up_time: string;
    remarks: string | null;
    project?: { id: number; title: string };
};

type DetailRowProps = { label: string; value: string; mono?: boolean };

function DetailRow({ label, value, mono = false }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">{label}</dt>
            <dd className={`text-[15px] font-medium text-foreground sm:text-right ${mono ? 'font-mono tracking-wide' : ''}`}>
                {value}
            </dd>
        </div>
    );
}

export default function SchedulesShow({ schedule }: { schedule: Schedule }) {
    const [shareOpen, setShareOpen] = React.useState(false);

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Schedules">
            <Head title={schedule.crew_name} />

            <ScheduleShareModal schedule={schedule} open={shareOpen} onOpenChange={setShareOpen} />

            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{schedule.crew_name}</h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        {formatScheduleDate(schedule.scheduled_date)} · {formatPickUpTime(schedule.pick_up_time)}
                    </p>
                </div>

                <GlassCard>
                    <dl className="divide-y divide-border/40 px-5 py-1 sm:px-8">
                        <div className="py-4">
                            <DetailRow label="Crew name" value={schedule.crew_name} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Date" value={formatScheduleDate(schedule.scheduled_date)} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Crew contact" value={schedule.crew_contact} mono />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Project" value={schedule.project?.title ?? '—'} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Pick up location" value={schedule.pick_up_location} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Drop off location" value={schedule.drop_off_location} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Pick up time" value={formatPickUpTime(schedule.pick_up_time)} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Remarks" value={schedule.remarks || '—'} />
                        </div>
                    </dl>
                </GlassCard>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 w-full rounded-xl border-border/60 bg-background/50 text-[14px] font-semibold sm:w-auto"
                    >
                        <Link href={ROUTES.index}>Back to list</Link>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShareOpen(true)}
                        className="h-12 w-full rounded-xl border-border/60 bg-background/50 text-[14px] font-semibold sm:w-auto"
                    >
                        <Share2 className="size-4" />
                        Share
                    </Button>
                    <Button asChild className="h-12 w-full rounded-xl px-8 text-[14px] font-semibold shadow-lg shadow-primary/20 sm:w-auto">
                        <Link href={ROUTES.edit(schedule.id)}>
                            <Pencil className="size-4" />
                            Edit Schedule
                        </Link>
                    </Button>
                </div>
            </div>
        </ModulePageLayout>
    );
}
