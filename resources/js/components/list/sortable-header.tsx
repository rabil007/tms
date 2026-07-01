import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortableHeaderProps = {
    label: string;
    column: string;
    sort: string;
    dir: 'asc' | 'desc';
    onSort: (column: string) => void;
};

export function SortableHeader({
    label,
    column,
    sort,
    dir,
    onSort,
}: SortableHeaderProps) {
    const isActive = sort === column;

    return (
        <button
            type="button"
            onClick={() => onSort(column)}
            className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors',
                isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            {label}
            {isActive ? (
                dir === 'asc' ? (
                    <ArrowUp className="size-3.5 text-primary" />
                ) : (
                    <ArrowDown className="size-3.5 text-primary" />
                )
            ) : (
                <ArrowUpDown className="size-3.5 opacity-30" />
            )}
        </button>
    );
}
