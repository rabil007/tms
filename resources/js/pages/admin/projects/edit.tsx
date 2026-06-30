import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { ProjectForm } from '@/pages/admin/projects/project-form';

const ROUTES = {
    index: '/projects',
    update: (id: number) => `/projects/${id}`,
} as const;

type Project = { id: number; title: string };

export default function ProjectsEdit({ project }: { project: Project }) {
    const { data, setData, put, processing, errors } = useForm({
        title: project.title,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(ROUTES.update(project.id));
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Projects">
            <Head title="Edit Project" />

            <ProjectForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Save Changes"
                title="Edit Project"
                description={`Update the title for ${project.title}.`}
                cancelHref={ROUTES.index}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
