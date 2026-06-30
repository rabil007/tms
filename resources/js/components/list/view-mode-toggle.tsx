import { LayoutGrid, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ViewMode } from '@/hooks/use-index-view-mode';
import { cn } from '@/lib/utils';

export type ViewModeToggleProps = {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
    className?: string;
};

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={value}
            onValueChange={(next) => {
                if (next === 'list' || next === 'grid') {
                    onChange(next);
                }
            }}
            className={cn('shrink-0 rounded-xl border-border/50 bg-background/50', className)}
            aria-label="View mode"
        >
            <ToggleGroupItem value="list" aria-label="List view" className="h-10 w-10 px-0">
                <List className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-10 w-10 px-0">
                <LayoutGrid className="size-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    );
}
