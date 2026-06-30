import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export type ProjectFilterOption = { id: number; title: string };

export type ScheduleIndexFilters = {
    projectId: string;
    dateFrom: string;
    dateTo: string;
};

type ScheduleIndexFiltersProps = {
    projects: ProjectFilterOption[];
    value: ScheduleIndexFilters;
    onChange: (next: ScheduleIndexFilters) => void;
    onClear: () => void;
    className?: string;
};

export function ScheduleIndexFilters({
    projects,
    value,
    onChange,
    onClear,
    className,
}: ScheduleIndexFiltersProps) {
    const isMobile = useIsMobile();
    const [expanded, setExpanded] = React.useState(false);
    const hasActiveFilters = !!(value.projectId || value.dateFrom || value.dateTo);
    const activeFilterCount = [value.projectId, value.dateFrom, value.dateTo].filter(Boolean).length;

    return (
        <GlassCard level="inner" className={cn('mb-6 p-3 sm:p-4', className)}>
            {isMobile && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setExpanded((open) => !open)}
                    className="h-11 w-full justify-between rounded-xl border-border/60 bg-background/50 px-4 text-[14px] font-semibold"
                    aria-expanded={expanded}
                >
                    <span className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4" />
                        {expanded ? 'Hide filters' : 'Show filters'}
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </span>
                    <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
                </Button>
            )}

            <div className={cn('flex flex-col gap-4', isMobile && (expanded ? 'mt-4' : 'hidden'), !isMobile && 'block')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="filter-project" className="text-[12px] font-semibold text-muted-foreground">
                            Project
                        </Label>
                        <Select
                            value={value.projectId || 'all'}
                            onValueChange={(next) =>
                                onChange({ ...value, projectId: next === 'all' ? '' : next })
                            }
                        >
                            <SelectTrigger id="filter-project" className="h-11 w-full rounded-xl border-border/40 bg-background/50">
                                <SelectValue placeholder="All projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All projects</SelectItem>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={String(project.id)}>
                                        {project.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter-date-from" className="text-[12px] font-semibold text-muted-foreground">
                            Date from
                        </Label>
                        <Input
                            id="filter-date-from"
                            type="date"
                            value={value.dateFrom}
                            onChange={(event) => onChange({ ...value, dateFrom: event.target.value })}
                            className="h-11 rounded-xl border-border/40 bg-background/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter-date-to" className="text-[12px] font-semibold text-muted-foreground">
                            Date to
                        </Label>
                        <Input
                            id="filter-date-to"
                            type="date"
                            value={value.dateTo}
                            onChange={(event) => onChange({ ...value, dateTo: event.target.value })}
                            className="h-11 rounded-xl border-border/40 bg-background/50"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClear}
                            disabled={!hasActiveFilters}
                            className="h-11 w-full rounded-xl border-border/60 bg-background/50 sm:w-auto"
                        >
                            <X className="size-4" />
                            Clear filters
                        </Button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
