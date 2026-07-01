import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

type PullToRefreshProps = {
    children: ReactNode;
    only: string[];
    className?: string;
};

export function PullToRefresh({ children, only, className }: PullToRefreshProps) {
    const { pullDistance, refreshing, isActive, handlers } = usePullToRefresh({ only });

    return (
        <div className={cn('relative', className)} {...(isActive ? handlers : {})}>
            {isActive && (pullDistance > 0 || refreshing) && (
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
                    style={{ transform: `translateY(${Math.min(pullDistance, 72)}px)` }}
                >
                    <div className="rounded-full border border-border/50 bg-background/90 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-sm backdrop-blur">
                        {refreshing ? 'Refreshing…' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
