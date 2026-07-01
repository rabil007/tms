import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AnalyticsPanelSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-2xl border border-border/50 bg-card/40 p-5', className)}>
            <Skeleton className="h-4 w-32" />
            <div className="mt-6 flex h-40 items-end gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="flex-1 rounded-t-lg"
                        style={{ height: `${40 + (index % 3) * 20}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function AnalyticsPanelsSkeleton() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <AnalyticsPanelSkeleton />
            <AnalyticsPanelSkeleton />
        </div>
    );
}
