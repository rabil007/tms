import React from 'react';
import { cn } from '@/lib/utils';

export type GlassCardProps<T extends React.ElementType = 'div'> = {
    as?: T;
    children: React.ReactNode;
    className?: string;
    level?: 'card' | 'inner';
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function GlassCard<T extends React.ElementType = 'div'>({
    as,
    children,
    className,
    level = 'card',
    ...rest
}: GlassCardProps<T>) {
    const Tag = (as ?? 'div') as React.ElementType;

    return (
        <Tag
            className={cn(
                level === 'inner'
                    ? 'rounded-3xl border border-border/40 bg-card/85 shadow-sm backdrop-blur-md dark:bg-background/40'
                    : 'rounded-3xl border border-border/50 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-card/40',
                className,
            )}
            {...rest}
        >
            {children}
        </Tag>
    );
}
