import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { cn } from '@/lib/utils';

export type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
    iconWrapperClassName?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    iconWrapperClassName,
}: EmptyStateProps) {
    return (
        <GlassCard
            className={cn(
                'flex flex-col items-center justify-center px-6 py-16 text-center',
                className,
            )}
        >
            <div
                className={cn(
                    'flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-600/15 ring-1 ring-border dark:ring-white/10',
                    iconWrapperClassName,
                )}
            >
                <Icon className="size-8 stroke-2 text-primary" />
            </div>
            <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-foreground/70">
                {description}
            </p>
            {action ? <div className="mt-6">{action}</div> : null}
        </GlassCard>
    );
}
