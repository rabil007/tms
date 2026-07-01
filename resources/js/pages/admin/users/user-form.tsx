import React from 'react';
import {
    FormActions,
    FormCard,
    FormField,
    FormSubmitButton,
    formInputClassName,
} from '@/components/forms/form-page';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type RoleOption = { id: number; name: string };

export type UserFormData = {
    name: string;
    email: string;
    role_id: string;
    password: string;
    password_confirmation: string;
};

type UserFormErrors = Partial<Record<keyof UserFormData, string>>;

type UserFormProps = {
    data: UserFormData;
    errors: UserFormErrors;
    processing: boolean;
    submitLabel: string;
    title: string;
    description?: string;
    cancelHref: string;
    roleOptions: RoleOption[];
    requirePassword?: boolean;
    onChange: <K extends keyof UserFormData>(
        key: K,
        value: UserFormData[K],
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export function UserForm({
    data,
    errors,
    processing,
    submitLabel,
    title,
    description,
    cancelHref,
    roleOptions,
    requirePassword = true,
    onChange,
    onSubmit,
}: UserFormProps) {
    return (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <FormCard>
                <FormField id="name" label="Full name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        className={formInputClassName(!!errors.name)}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        autoFocus
                    />
                </FormField>

                <FormField
                    id="email"
                    label="Email address"
                    error={errors.email}
                    className="mt-6"
                >
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        className={formInputClassName(!!errors.email)}
                        placeholder="jane@example.com"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                    />
                </FormField>

                <FormField
                    id="role_id"
                    label="Role"
                    hint="Assign a role to control access"
                    error={errors.role_id}
                    className="mt-6"
                >
                    <Select
                        value={data.role_id}
                        onValueChange={(value) => onChange('role_id', value)}
                    >
                        <SelectTrigger
                            id="role_id"
                            className={formInputClassName(!!errors.role_id)}
                            aria-invalid={!!errors.role_id}
                        >
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions.map((role) => (
                                <SelectItem
                                    key={role.id}
                                    value={String(role.id)}
                                >
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    id="password"
                    label={requirePassword ? 'Password' : 'New password'}
                    hint={
                        requirePassword
                            ? undefined
                            : 'Leave blank to keep the current password'
                    }
                    error={errors.password}
                    className="mt-6"
                >
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => onChange('password', e.target.value)}
                        className={formInputClassName(!!errors.password)}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                    />
                </FormField>

                <FormField
                    id="password_confirmation"
                    label="Confirm password"
                    error={errors.password_confirmation}
                    className="mt-6"
                >
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            onChange('password_confirmation', e.target.value)
                        }
                        className={formInputClassName(
                            !!errors.password_confirmation,
                        )}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password_confirmation}
                    />
                </FormField>

                <FormActions cancelHref={cancelHref} className="mt-8">
                    <FormSubmitButton processing={processing}>
                        {submitLabel}
                    </FormSubmitButton>
                </FormActions>
            </FormCard>
        </form>
    );
}
