import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type ListSearchProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export function ListSearch({
    value,
    onChange,
    placeholder,
    className,
}: ListSearchProps) {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
                'h-12 rounded-xl border-border/60 bg-muted/40 px-4 text-base transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20 sm:text-[14px]',
                className,
            )}
        />
    );
}
