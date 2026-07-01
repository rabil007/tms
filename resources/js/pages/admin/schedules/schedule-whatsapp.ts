import {
    formatPickUpTime,
    formatScheduleDate,
    type ScheduleRow,
} from '@/pages/admin/schedules/schedule-format';

export type ScheduleWhatsAppData = Pick<
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

export function formatScheduleWhatsAppMessage(schedule: ScheduleWhatsAppData): string {
    const lines = [
        '*Crew Transport Schedule*',
        '',
        `*Crew:* ${schedule.crew_name}`,
        `*Date:* ${formatScheduleDate(schedule.scheduled_date)}`,
        `*Time:* ${formatPickUpTime(schedule.pick_up_time)}`,
        `*Project:* ${schedule.project?.title ?? '—'}`,
        `*Contact:* ${schedule.crew_contact}`,
        '',
        `*Pick up:* ${schedule.pick_up_location}`,
        `*Drop off:* ${schedule.drop_off_location}`,
    ];

    if (schedule.remarks) {
        lines.push('', `*Remarks:* ${schedule.remarks}`);
    }

    return lines.join('\n');
}

export function shareScheduleOnWhatsApp(schedule: ScheduleWhatsAppData): void {
    const message = formatScheduleWhatsAppMessage(schedule);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
}
