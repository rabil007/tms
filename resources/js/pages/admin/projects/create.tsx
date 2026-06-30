import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { ProjectForm } from '@/pages/admin/projects/project-form';

const ROUTES = {
    index: '/projects',
    store: '/projects',
} as const;

export default function ProjectsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ROUTES.store);
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Projects">
            <Head title="New Project" />

            <ProjectForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Create Project"
                title="New Project"
                description="Add a project with a unique title."
                cancelHref={ROUTES.index}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
