import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { UserForm  } from '@/pages/admin/users/user-form';
import type {RoleOption} from '@/pages/admin/users/user-form';
import { USER_ROUTES  } from '@/pages/admin/users/user-views';
import type {UserRole} from '@/pages/admin/users/user-views';

type User = {
    id: number;
    name: string;
    email: string;
    role?: UserRole | null;
};

export default function UsersEdit({
    user,
    roleOptions,
}: {
    user: User;
    roleOptions: RoleOption[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role_id: user.role ? String(user.role.id) : '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(USER_ROUTES.show(user.id));
    };

    return (
        <ModulePageLayout backHref={USER_ROUTES.index} backLabel="Users">
            <Head title="Edit User" />

            <UserForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Save Changes"
                title="Edit User"
                description={`Update account details for ${user.name}.`}
                cancelHref={USER_ROUTES.index}
                roleOptions={roleOptions}
                requirePassword={false}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
