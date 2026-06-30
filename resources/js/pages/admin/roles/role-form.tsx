import React from 'react';
import {
    FormActions,
    FormCard,
    FormField,
    FormSubmitButton,
    formInputClassName,
} from '@/components/forms/form-page';
import { Input } from '@/components/ui/input';

export type RoleFormData = {
    name: string;
};

type RoleFormErrors = Partial<Record<keyof RoleFormData, string>>;

type RoleFormProps = {
    data: RoleFormData;
    errors: RoleFormErrors;
    processing: boolean;
    submitLabel: string;
    title: string;
    description?: string;
    cancelHref: string;
    onChange: <K extends keyof RoleFormData>(key: K, value: RoleFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export function RoleForm({
    data,
    errors,
    processing,
    submitLabel,
    title,
    description,
    cancelHref,
    onChange,
    onSubmit,
}: RoleFormProps) {
    return (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
                {description && (
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{description}</p>
                )}
            </div>

            <FormCard>
                <FormField
                    id="name"
                    label="Role name"
                    hint="A unique display name for this role"
                    error={errors.name}
                >
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        className={formInputClassName(!!errors.name)}
                        placeholder="Admin"
                        autoComplete="off"
                        aria-invalid={!!errors.name}
                        autoFocus
                    />
                </FormField>

                <FormActions cancelHref={cancelHref} className="mt-8">
                    <FormSubmitButton processing={processing}>{submitLabel}</FormSubmitButton>
                </FormActions>
            </FormCard>
        </form>
    );
}
