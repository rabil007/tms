import { Skeleton } from '@/components/ui/skeleton';

export function FeedListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <ul className="divide-y divide-border/40">
            {Array.from({ length: rows }).map((_, index) => (
                <li key={index} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-4/5" />
                    </div>
                    <Skeleton className="size-4 shrink-0 rounded" />
                </li>
            ))}
        </ul>
    );
}
