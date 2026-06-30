import React from 'react';
import {
    FormActions,
    FormCard,
    FormField,
    FormSubmitButton,
    formInputClassName,
} from '@/components/forms/form-page';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type CountryFormData = {
    name: string;
    iso2: string;
    dial_code: string;
};

type CountryFormErrors = Partial<Record<keyof CountryFormData, string>>;

type CountryFormProps = {
    data: CountryFormData;
    errors: CountryFormErrors;
    processing: boolean;
    submitLabel: string;
    title: string;
    description?: string;
    cancelHref: string;
    onChange: <K extends keyof CountryFormData>(key: K, value: CountryFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export function CountryForm({
    data,
    errors,
    processing,
    submitLabel,
    title,
    description,
    cancelHref,
    onChange,
    onSubmit,
}: CountryFormProps) {
    return (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
            {/* Page title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
                {description && (
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{description}</p>
                )}
            </div>

            {/* Form card */}
            <FormCard>
                <div className="space-y-6">
                    <FormField
                        id="name"
                        label="Country name"
                        hint="Full official or common name"
                        error={errors.name}
                    >
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            className={formInputClassName(!!errors.name)}
                            autoComplete="country-name"
                            placeholder="United States"
                            aria-invalid={!!errors.name}
                            autoFocus
                        />
                    </FormField>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            id="iso2"
                            label="ISO2 code"
                            hint="2-letter code, e.g. US"
                            error={errors.iso2}
                        >
                            <Input
                                id="iso2"
                                value={data.iso2}
                                onChange={(e) => onChange('iso2', e.target.value.toUpperCase())}
                                className={cn(formInputClassName(!!errors.iso2), 'font-mono uppercase tracking-widest')}
                                placeholder="US"
                                maxLength={2}
                                autoComplete="off"
                                autoCapitalize="characters"
                                spellCheck={false}
                                aria-invalid={!!errors.iso2}
                            />
                        </FormField>

                        <FormField
                            id="dial_code"
                            label="Dial code"
                            hint="Include + prefix, e.g. +1"
                            error={errors.dial_code}
                        >
                            <Input
                                id="dial_code"
                                value={data.dial_code}
                                onChange={(e) => onChange('dial_code', e.target.value)}
                                className={cn(formInputClassName(!!errors.dial_code), 'font-mono tracking-wide')}
                                placeholder="+1"
                                inputMode="tel"
                                autoComplete="tel-country-code"
                                aria-invalid={!!errors.dial_code}
                            />
                        </FormField>
                    </div>
                </div>

                <FormActions cancelHref={cancelHref} className="mt-8">
                    <FormSubmitButton processing={processing}>{submitLabel}</FormSubmitButton>
                </FormActions>
            </FormCard>
        </form>
    );
}
