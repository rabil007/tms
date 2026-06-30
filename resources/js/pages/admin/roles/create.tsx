import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { RoleForm } from '@/pages/admin/roles/role-form';
import { ROLE_ROUTES } from '@/pages/admin/roles/role-views';

export default function RolesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ROLE_ROUTES.index);
    };

    return (
        <ModulePageLayout backHref={ROLE_ROUTES.index} backLabel="Roles">
            <Head title="New Role" />

            <RoleForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Create Role"
                title="New Role"
                description="Add a role with a unique name."
                cancelHref={ROLE_ROUTES.index}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
