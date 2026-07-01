import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, FileText, Pencil, Share2 } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { ScheduleShareModal } from '@/components/schedules/schedule-share-modal';
import { Button } from '@/components/ui/button';
import {
    formatCreatedAt,
    formatPickUpTime,
    formatScheduleDate,
    SCHEDULE_ROUTES,
    ScheduleStatusBadge,
    canUserModifySchedule,
} from '@/pages/admin/schedules/schedule-views';
import type { ScheduleStatus } from '@/pages/admin/schedules/schedule-views';
import type { Auth } from '@/types';

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
    created_at: string | null;
    status: ScheduleStatus;
    attachment_url: string | null;
    attachment_name: string | null;
    attachment_mime: string | null;
    has_attachment: boolean;
    project?: { id: number; title: string };
    created_by?: { id: number; name: string } | null;
};

type DetailRowProps = { label: string; value: string; mono?: boolean };

function DetailRow({ label, value, mono = false }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                {label}
            </dt>
            <dd
                className={`text-[15px] font-medium text-foreground sm:text-right ${mono ? 'font-mono tracking-wide' : ''}`}
            >
                {value}
            </dd>
        </div>
    );
}

function isImageMime(mime: string): boolean {
    return mime.startsWith('image/');
}

export default function SchedulesShow({ schedule }: { schedule: Schedule }) {
    const [shareOpen, setShareOpen] = React.useState(false);
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role?.slug === 'admin';
    const canApprove = isAdmin && schedule.status === 'pending';
    const canModify = canUserModifySchedule(isAdmin, schedule.status);

    const handleApprove = () => {
        router.post(
            SCHEDULE_ROUTES.approve(schedule.id),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Schedules">
            <Head title={schedule.crew_name} />

            <ScheduleShareModal
                schedules={shareOpen ? [schedule] : []}
                open={shareOpen}
                onOpenChange={setShareOpen}
            />

            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {schedule.crew_name}
                        </h2>
                        <ScheduleStatusBadge status={schedule.status} />
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        {formatScheduleDate(schedule.scheduled_date)} ·{' '}
                        {formatPickUpTime(schedule.pick_up_time)}
                    </p>
                </div>

                <GlassCard>
                    <dl className="divide-y divide-border/40 px-5 py-1 sm:px-8">
                        <div className="py-4">
                            <DetailRow
                                label="Crew name"
                                value={schedule.crew_name}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Date"
                                value={formatScheduleDate(
                                    schedule.scheduled_date,
                                )}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Crew contact"
                                value={schedule.crew_contact}
                                mono
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Project"
                                value={schedule.project?.title ?? '—'}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Pick up location"
                                value={schedule.pick_up_location}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Drop off location"
                                value={schedule.drop_off_location}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Pick up time"
                                value={formatPickUpTime(schedule.pick_up_time)}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Remarks"
                                value={schedule.remarks || '—'}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Created"
                                value={
                                    schedule.created_by?.name
                                        ? `${formatCreatedAt(schedule.created_at)} · ${schedule.created_by.name}`
                                        : formatCreatedAt(schedule.created_at)
                                }
                            />
                        </div>
                    </dl>
                </GlassCard>

                {schedule.has_attachment &&
                    schedule.attachment_url &&
                    schedule.attachment_name &&
                    schedule.attachment_mime && (
                        <GlassCard className="mt-6">
                            <div className="px-5 py-5 sm:px-8">
                                <h3 className="text-[13px] font-semibold text-muted-foreground">
                                    Attachment
                                </h3>
                                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                                    {isImageMime(schedule.attachment_mime) ? (
                                        <a
                                            href={schedule.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block shrink-0"
                                        >
                                            <img
                                                src={schedule.attachment_url}
                                                alt={schedule.attachment_name}
                                                className="max-h-48 rounded-xl object-cover ring-1 ring-border"
                                            />
                                        </a>
                                    ) : (
                                        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
                                            <FileText className="size-7 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {schedule.attachment_name}
                                        </p>
                                        <a
                                            href={schedule.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                                        >
                                            {isImageMime(
                                                schedule.attachment_mime,
                                            )
                                                ? 'Open full image'
                                                : 'Open PDF'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    )}

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
                    {canApprove && (
                        <Button
                            type="button"
                            onClick={handleApprove}
                            className="h-12 w-full rounded-xl bg-emerald-600 px-8 text-[14px] font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-600/90 sm:w-auto"
                        >
                            <Check className="size-4" />
                            Approve
                        </Button>
                    )}
                    {canModify && (
                        <Button
                            asChild
                            className="h-12 w-full rounded-xl px-8 text-[14px] font-semibold shadow-lg shadow-primary/20 sm:w-auto"
                        >
                            <Link href={ROUTES.edit(schedule.id)}>
                                <Pencil className="size-4" />
                                Edit Schedule
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </ModulePageLayout>
    );
}
