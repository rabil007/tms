import { Link } from '@inertiajs/react';
import React from 'react';
import InputError from '@/components/input-error';
import { GlassCard } from '@/components/layout/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export function formInputClassName(hasError = false) {
    return cn(
        'h-12 w-full rounded-xl border-border/60 bg-muted/40 text-base px-4 transition-all [color-scheme:light] dark:[color-scheme:dark] sm:text-[14px]',
        'focus:border-primary/60 focus:ring-2 focus:ring-primary/20',
        hasError && 'border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20',
    );
}

export function formLabelClassName() {
    return 'text-[13px] font-semibold text-foreground';
}

export function FormPageHeader({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-5 sm:mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
            {description && (
                <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

export function FormPage({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={cn('mx-auto w-full max-w-xl', className)}>{children}</div>;
}

export function FormCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <GlassCard className={cn('overflow-hidden', className)}>
            <div className="p-5 sm:p-8">{children}</div>
        </GlassCard>
    );
}

export function FormField({
    id,
    label,
    hint,
    error,
    children,
    className,
}: {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={id} className={formLabelClassName()}>
                {label}
            </Label>
            {children}
            {hint && !error ? (
                <p className="text-[12px] leading-relaxed text-muted-foreground">{hint}</p>
            ) : null}
            <InputError message={error} />
        </div>
    );
}

export function FormActions({
    children,
    cancelHref,
    cancelLabel = 'Cancel',
    className,
}: {
    children: React.ReactNode;
    cancelHref?: string;
    cancelLabel?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-t border-border/40 pt-5 sm:flex-row sm:justify-end sm:pt-6',
                className,
            )}
        >
            {cancelHref ? (
                <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="h-12 w-full rounded-xl border-border/60 bg-background/50 text-[14px] font-semibold sm:order-1 sm:w-auto"
                >
                    <Link href={cancelHref}>{cancelLabel}</Link>
                </Button>
            ) : null}
            <div className="w-full sm:order-2 sm:w-auto">{children}</div>
        </div>
    );
}

export function FormSubmitButton({
    processing,
    children,
    className,
}: {
    processing: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Button
            type="submit"
            disabled={processing}
            className={cn(
                'h-12 w-full rounded-xl px-8 text-[14px] font-semibold shadow-lg shadow-primary/20 sm:w-auto sm:min-w-[10rem]',
                className,
            )}
        >
            {processing ? <Spinner className="mr-2" /> : null}
            {children}
        </Button>
    );
}
