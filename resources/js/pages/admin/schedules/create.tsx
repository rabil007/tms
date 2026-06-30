import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { ProjectOption, ScheduleForm } from '@/pages/admin/schedules/schedule-form';

const ROUTES = {
    index: '/schedules',
    store: '/schedules',
} as const;

const emptyForm = {
    crew_name: '',
    scheduled_date: '',
    crew_contact: '',
    project_id: '',
    pick_up_location: '',
    drop_off_location: '',
    pick_up_time: '',
    remarks: '',
};

export default function SchedulesCreate({ projects }: { projects: ProjectOption[] }) {
    const { data, setData, post, processing, errors, transform } = useForm(emptyForm);

    transform((formData) => ({
        ...formData,
        project_id: formData.project_id ? Number(formData.project_id) : '',
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
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
