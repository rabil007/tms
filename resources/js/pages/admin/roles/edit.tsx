import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { RoleForm } from '@/pages/admin/roles/role-form';
import { ROLE_ROUTES } from '@/pages/admin/roles/role-views';

type Role = { id: number; name: string; slug: string };

export default function RolesEdit({ role }: { role: Role }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(ROLE_ROUTES.show(role.id));
    };

    return (
        <ModulePageLayout backHref={ROLE_ROUTES.index} backLabel="Roles">
            <Head title="Edit Role" />

            <RoleForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Save Changes"
                title="Edit Role"
                description={`Update the name for ${role.name}.`}
                cancelHref={ROLE_ROUTES.index}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
