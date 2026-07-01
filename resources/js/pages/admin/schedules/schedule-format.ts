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
    created_at: string | null;
    project?: { id: number; title: string };
};

export function formatScheduleDate(value: string): string {
    if (!value) {
        return '—';
    }

    const date = value.includes('T')
        ? new Date(value)
        : new Date(`${value}T00:00:00`);

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
        date.setHours(
            Number(timeMatch[1]),
            Number(timeMatch[2]),
            Number(timeMatch[3] ?? 0),
            0,
        );

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

export function formatCreatedAt(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
