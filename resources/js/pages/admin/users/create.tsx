import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { UserForm  } from '@/pages/admin/users/user-form';
import type {RoleOption} from '@/pages/admin/users/user-form';
import { USER_ROUTES } from '@/pages/admin/users/user-views';

export default function UsersCreate({ roleOptions }: { roleOptions: RoleOption[] }) {
    const defaultRoleId = roleOptions.find((role) => role.name === 'User')?.id ?? roleOptions[0]?.id;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role_id: defaultRoleId ? String(defaultRoleId) : '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(USER_ROUTES.index);
    };

    return (
        <ModulePageLayout backHref={USER_ROUTES.index} backLabel="Users">
            <Head title="New User" />

            <UserForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Create User"
                title="New User"
                description="Add a user account with name, email, role, and password."
                cancelHref={USER_ROUTES.index}
                roleOptions={roleOptions}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
