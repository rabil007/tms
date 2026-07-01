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

const SCHEDULE_SEPARATOR = '\n\n---\n\n';
const WHATSAPP_URL_CHAR_LIMIT = 1800;

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

export function formatSchedulesShareMessage(schedules: ScheduleShareData[], options: FormatOptions = {}): string {
    if (schedules.length === 0) {
        return '';
    }

    if (schedules.length === 1) {
        return formatScheduleShareMessage(schedules[0], options);
    }

    return schedules.map((schedule) => formatScheduleShareMessage(schedule, options)).join(SCHEDULE_SEPARATOR);
}

function formatEmailSubject(schedules: ScheduleShareData[]): string {
    if (schedules.length === 1) {
        return `Crew Transport Schedule - ${schedules[0].crew_name}`;
    }

    return `Crew Transport Schedules (${schedules.length})`;
}

export function isWhatsAppShareTooLong(schedules: ScheduleShareData[]): boolean {
    const message = formatSchedulesShareMessage(schedules, { markdown: true });
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    return url.length > WHATSAPP_URL_CHAR_LIMIT;
}

export async function copySchedulesShareMessage(schedules: ScheduleShareData[]): Promise<void> {
    await navigator.clipboard.writeText(formatSchedulesShareMessage(schedules));
}

export function openSchedulesWhatsAppShare(schedules: ScheduleShareData[]): boolean {
    if (isWhatsAppShareTooLong(schedules)) {
        return false;
    }

    const message = formatSchedulesShareMessage(schedules, { markdown: true });
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');

    return true;
}

export function openSchedulesEmailShare(schedules: ScheduleShareData[], to: string): void {
    const subject = encodeURIComponent(formatEmailSubject(schedules));
    const body = encodeURIComponent(formatSchedulesShareMessage(schedules));

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

export async function copyScheduleShareMessage(schedule: ScheduleShareData): Promise<void> {
    await copySchedulesShareMessage([schedule]);
}

export function openScheduleWhatsAppShare(schedule: ScheduleShareData): void {
    openSchedulesWhatsAppShare([schedule]);
}

export function openScheduleEmailShare(schedule: ScheduleShareData, to: string): void {
    openSchedulesEmailShare([schedule], to);
}
