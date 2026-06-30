import React from 'react';
import {
    FormActions,
    FormCard,
    FormField,
    FormSubmitButton,
    formInputClassName,
} from '@/components/forms/form-page';
import { Input } from '@/components/ui/input';
import { SearchSelect } from '@/components/ui/search-select';
import { cn } from '@/lib/utils';

export type ProjectOption = { id: number; title: string };

export type ScheduleFormData = {
    crew_name: string;
    scheduled_date: string;
    crew_contact: string;
    project_id: string;
    pick_up_location: string;
    drop_off_location: string;
    pick_up_time: string;
    remarks: string;
};

type ScheduleFormErrors = Partial<Record<keyof ScheduleFormData, string>>;

type ScheduleFormProps = {
    data: ScheduleFormData;
    errors: ScheduleFormErrors;
    processing: boolean;
    submitLabel: string;
    title: string;
    description?: string;
    cancelHref: string;
    projects: ProjectOption[];
    onChange: <K extends keyof ScheduleFormData>(key: K, value: ScheduleFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export function ScheduleForm({
    data,
    errors,
    processing,
    submitLabel,
    title,
    description,
    cancelHref,
    projects,
    onChange,
    onSubmit,
}: ScheduleFormProps) {
    const projectOptions = projects.map((project) => ({
        id: project.id,
        name: project.title,
    }));

    return (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
                {description && (
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{description}</p>
                )}
            </div>

            <FormCard>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            id="crew_name"
                            label="Crew name"
                            hint="Full name of the crew member"
                            error={errors.crew_name}
                        >
                            <Input
                                id="crew_name"
                                value={data.crew_name}
                                onChange={(e) => onChange('crew_name', e.target.value)}
                                className={formInputClassName(!!errors.crew_name)}
                                placeholder="John Smith"
                                autoComplete="name"
                                aria-invalid={!!errors.crew_name}
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            id="crew_contact"
                            label="Crew contact"
                            hint="Phone number with country code"
                            error={errors.crew_contact}
                        >
                            <Input
                                id="crew_contact"
                                type="tel"
                                inputMode="tel"
                                value={data.crew_contact}
                                onChange={(e) => onChange('crew_contact', e.target.value)}
                                className={cn(formInputClassName(!!errors.crew_contact), 'font-mono tracking-wide')}
                                placeholder="+971501234567"
                                autoComplete="tel"
                                aria-invalid={!!errors.crew_contact}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            id="scheduled_date"
                            label="Date"
                            error={errors.scheduled_date}
                        >
                            <Input
                                id="scheduled_date"
                                type="date"
                                value={data.scheduled_date}
                                onChange={(e) => onChange('scheduled_date', e.target.value)}
                                className={formInputClassName(!!errors.scheduled_date)}
                                aria-invalid={!!errors.scheduled_date}
                            />
                        </FormField>

                        <FormField
                            id="pick_up_time"
                            label="Pick up time"
                            error={errors.pick_up_time}
                        >
                            <Input
                                id="pick_up_time"
                                type="time"
                                value={data.pick_up_time}
                                onChange={(e) => onChange('pick_up_time', e.target.value)}
                                className={formInputClassName(!!errors.pick_up_time)}
                                aria-invalid={!!errors.pick_up_time}
                            />
                        </FormField>
                    </div>

                    <FormField
                        id="project_id"
                        label="Project"
                        hint="Select the project for this schedule"
                        error={errors.project_id}
                    >
                        <SearchSelect
                            options={projectOptions}
                            value={data.project_id}
                            onChange={(val) => onChange('project_id', val)}
                            placeholder="Select a project"
                            error={errors.project_id}
                            className="h-12 rounded-xl"
                        />
                    </FormField>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            id="pick_up_location"
                            label="Pick up location"
                            error={errors.pick_up_location}
                        >
                            <Input
                                id="pick_up_location"
                                value={data.pick_up_location}
                                onChange={(e) => onChange('pick_up_location', e.target.value)}
                                className={formInputClassName(!!errors.pick_up_location)}
                                placeholder="Airport Terminal 1"
                                aria-invalid={!!errors.pick_up_location}
                            />
                        </FormField>

                        <FormField
                            id="drop_off_location"
                            label="Drop off location"
                            error={errors.drop_off_location}
                        >
                            <Input
                                id="drop_off_location"
                                value={data.drop_off_location}
                                onChange={(e) => onChange('drop_off_location', e.target.value)}
                                className={formInputClassName(!!errors.drop_off_location)}
                                placeholder="Hotel Marina"
                                aria-invalid={!!errors.drop_off_location}
                            />
                        </FormField>
                    </div>

                    <FormField
                        id="remarks"
                        label="Remarks"
                        hint="Optional notes or special instructions"
                        error={errors.remarks}
                    >
                        <textarea
                            id="remarks"
                            value={data.remarks}
                            onChange={(e) => onChange('remarks', e.target.value)}
                            rows={3}
                            className={cn(
                                formInputClassName(!!errors.remarks),
                                'h-auto min-h-[6rem] resize-y py-3',
                            )}
                            placeholder="Any additional details…"
                            aria-invalid={!!errors.remarks}
                        />
                    </FormField>
                </div>

                <FormActions cancelHref={cancelHref} className="mt-8">
                    <FormSubmitButton processing={processing}>{submitLabel}</FormSubmitButton>
                </FormActions>
            </FormCard>
        </form>
    );
}
