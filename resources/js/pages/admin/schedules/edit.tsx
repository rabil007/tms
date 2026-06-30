import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { parsePhoneNumber, type CountryPhoneOption } from '@/components/forms/phone-input';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { ProjectOption, ScheduleForm } from '@/pages/admin/schedules/schedule-form';
import { formatPickUpTime } from '@/pages/admin/schedules/schedule-views';

const ROUTES = {
    index: '/schedules',
    update: (id: number) => `/schedules/${id}`,
} as const;

type Schedule = {
    id: number;
    crew_name: string;
    scheduled_date: string;
    crew_contact: string;
    project_id: number;
    pick_up_location: string;
    drop_off_location: string;
    pick_up_time: string;
    remarks: string | null;
};

function toFormDate(value: string): string {
    return value.slice(0, 10);
}

export default function SchedulesEdit({
    schedule,
    projects,
    countries,
}: {
    schedule: Schedule;
    projects: ProjectOption[];
    countries: CountryPhoneOption[];
}) {
    const parsedContact = parsePhoneNumber(schedule.crew_contact, countries);

    const { data, setData, put, processing, errors, transform } = useForm({
        crew_name: schedule.crew_name,
        scheduled_date: toFormDate(schedule.scheduled_date),
        country_id: parsedContact.countryId,
        crew_phone: parsedContact.phone,
        project_id: String(schedule.project_id),
        pick_up_location: schedule.pick_up_location,
        drop_off_location: schedule.drop_off_location,
        pick_up_time: formatPickUpTime(schedule.pick_up_time),
        remarks: schedule.remarks ?? '',
    });

    transform((formData) => ({
        ...formData,
        project_id: Number(formData.project_id),
        country_id: Number(formData.country_id),
    }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(ROUTES.update(schedule.id));
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Schedules">
            <Head title="Edit Schedule" />

            <ScheduleForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Save Changes"
                title="Edit Schedule"
                description={`Update transport details for ${schedule.crew_name}.`}
                cancelHref={ROUTES.index}
                projects={projects}
                countries={countries}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
