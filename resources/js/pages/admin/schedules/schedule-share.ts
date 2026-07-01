import {
    formatPickUpTime,
    formatScheduleDate,
    type ScheduleRow,
} from '@/pages/admin/schedules/schedule-format';

export type ScheduleShareData = Pick<
    ScheduleRow,
    | 'crew_name'
    | 'scheduled_date'
    | 'crew_contact'
    | 'pick_up_location'
    | 'drop_off_location'
    | 'pick_up_time'
    | 'remarks'
> & {
    project?: { title: string } | null;
};

type FormatOptions = {
    markdown?: boolean;
};

function label(text: string, markdown: boolean): string {
    return markdown ? `*${text}:*` : `${text}:`;
}

export function formatScheduleShareMessage(schedule: ScheduleShareData, options: FormatOptions = {}): string {
    const markdown = options.markdown ?? false;
    const heading = markdown ? '*Crew Transport Schedule*' : 'Crew Transport Schedule';

    const lines = [
        heading,
        '',
        `${label('Crew', markdown)} ${schedule.crew_name}`,
        `${label('Date', markdown)} ${formatScheduleDate(schedule.scheduled_date)}`,
        `${label('Time', markdown)} ${formatPickUpTime(schedule.pick_up_time)}`,
        `${label('Project', markdown)} ${schedule.project?.title ?? '—'}`,
        `${label('Contact', markdown)} ${schedule.crew_contact}`,
        '',
        `${label('Pick up', markdown)} ${schedule.pick_up_location}`,
        `${label('Drop off', markdown)} ${schedule.drop_off_location}`,
    ];

    if (schedule.remarks) {
        lines.push('', `${label('Remarks', markdown)} ${schedule.remarks}`);
    }

    return lines.join('\n');
}

export async function copyScheduleShareMessage(schedule: ScheduleShareData): Promise<void> {
    await navigator.clipboard.writeText(formatScheduleShareMessage(schedule));
}

export function openScheduleWhatsAppShare(schedule: ScheduleShareData): void {
    const message = formatScheduleShareMessage(schedule, { markdown: true });
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
}

export function openScheduleEmailShare(schedule: ScheduleShareData, to: string): void {
    const subject = encodeURIComponent(`Crew Transport Schedule - ${schedule.crew_name}`);
    const body = encodeURIComponent(formatScheduleShareMessage(schedule));

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}
