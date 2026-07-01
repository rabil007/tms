import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatCardsSkeletonProps = {
    count?: number;
    columns?: string;
    className?: string;
};

export function StatCardsSkeleton({
    count = 4,
    columns = 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
    className,
}: StatCardsSkeletonProps) {
    return (
        <div className={cn('grid gap-3', columns, className)}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/50 bg-card/40 px-4 py-3.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="mt-2 h-8 w-12" />
                </div>
            ))}
        </div>
    );
}
