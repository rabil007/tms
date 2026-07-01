import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

export type ModulePageLayoutProps = {
    children: React.ReactNode;
    title?: string;
    backHref?: string;
    backLabel?: string;
    className?: string;
};

export function ModulePageLayout({
    children,
    title,
    backHref,
    backLabel = 'Back',
    className,
}: ModulePageLayoutProps) {
    return (
        <div className={cn('w-full', className)}>
            {(backHref || title) && (
                <div className="mb-4 flex items-center gap-3 border-b border-border/40 pb-4">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold text-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground active:bg-muted/60"
                        >
                            <ArrowLeft className="size-4" />
                            <span>{backLabel}</span>
                        </Link>
                    )}
                    {title && (
                        <h1 className="truncate text-base font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                    )}
                </div>
            )}

            <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {children}
            </div>
        </div>
    );
}
