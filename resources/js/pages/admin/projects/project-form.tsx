import React from 'react';
import {
    FormActions,
    FormCard,
    FormField,
    FormSubmitButton,
    formInputClassName,
} from '@/components/forms/form-page';
import { Input } from '@/components/ui/input';

export type ProjectFormData = {
    title: string;
};

type ProjectFormErrors = Partial<Record<keyof ProjectFormData, string>>;

type ProjectFormProps = {
    data: ProjectFormData;
    errors: ProjectFormErrors;
    processing: boolean;
    submitLabel: string;
    title: string;
    description?: string;
    cancelHref: string;
    onChange: <K extends keyof ProjectFormData>(
        key: K,
        value: ProjectFormData[K],
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export function ProjectForm({
    data,
    errors,
    processing,
    submitLabel,
    title,
    description,
    cancelHref,
    onChange,
    onSubmit,
}: ProjectFormProps) {
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
                <FormField
                    id="title"
                    label="Project title"
                    hint="A unique name for this project"
                    error={errors.title}
                >
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => onChange('title', e.target.value)}
                        className={formInputClassName(!!errors.title)}
                        placeholder="NMDC"
                        autoComplete="off"
                        aria-invalid={!!errors.title}
                        autoFocus
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
