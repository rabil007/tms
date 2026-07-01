import { Skeleton } from '@/components/ui/skeleton';

export function NotificationListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="divide-y divide-border/40">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="space-y-2 px-4 py-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            ))}
        </div>
    );
}
