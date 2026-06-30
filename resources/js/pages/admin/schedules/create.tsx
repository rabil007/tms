import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { defaultCountryId  } from '@/components/forms/phone-input';
import type {CountryPhoneOption} from '@/components/forms/phone-input';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import type { ProjectOption} from '@/pages/admin/schedules/schedule-form';
import { ScheduleForm } from '@/pages/admin/schedules/schedule-form';

const ROUTES = {
    index: '/schedules',
    store: '/schedules',
} as const;

export default function SchedulesCreate({
    projects,
    countries,
}: {
    projects: ProjectOption[];
    countries: CountryPhoneOption[];
}) {
    const { data, setData, post, processing, errors, transform } = useForm({
        crew_name: '',
        scheduled_date: '',
        country_id: defaultCountryId(countries),
        crew_phone: '',
        project_id: '',
        pick_up_location: '',
        drop_off_location: '',
        pick_up_time: '',
        remarks: '',
    });

    transform((formData) => ({
        ...formData,
        project_id: formData.project_id ? Number(formData.project_id) : '',
        country_id: formData.country_id ? Number(formData.country_id) : '',
    }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ROUTES.store);
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Schedules">
            <Head title="New Schedule" />

            <ScheduleForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Create Schedule"
                title="New Schedule"
                description="Schedule crew transport with pick-up and drop-off details."
                cancelHref={ROUTES.index}
                projects={projects}
                countries={countries}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
