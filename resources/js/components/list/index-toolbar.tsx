import { Search } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { ListSearch } from '@/components/list/list-search';
import { ViewModeToggle } from '@/components/list/view-mode-toggle';
import { Badge } from '@/components/ui/badge';
import type { ViewMode } from '@/hooks/use-index-view-mode';

export type IndexToolbarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    hasSearch?: boolean;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    className?: string;
};

export function IndexToolbar({
    search,
    onSearchChange,
    searchPlaceholder = 'Search…',
    hasSearch = false,
    viewMode,
    onViewModeChange,
    className,
}: IndexToolbarProps) {
    return (
        <GlassCard level="inner" className={className ?? 'mb-6 p-3 sm:p-4'}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <ListSearch
                        value={search}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        className="h-11 border-border/40 bg-background/50 pl-10"
                    />
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    {hasSearch && (
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            Filtered
                        </Badge>
                    )}
                    <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
                </div>
            </div>
        </GlassCard>
    );
}
