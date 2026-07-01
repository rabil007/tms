import { Head, Link, router } from '@inertiajs/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { FolderKanban, Plus } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { SectionHeader } from '@/components/layout/section-header';
import { EmptyState } from '@/components/list/empty-state';
import { IndexToolbar } from '@/components/list/index-toolbar';
import { PaginationBar } from '@/components/list/pagination-bar';
import { PullToRefresh } from '@/components/list/pull-to-refresh';
import { RowActions } from '@/components/list/row-actions';
import { RowsPerPageSelect } from '@/components/list/rows-per-page-select';
import { SortableHeader } from '@/components/list/sortable-header';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useIndexQueryParams } from '@/hooks/use-index-query-params';
import { useIndexViewMode } from '@/hooks/use-index-view-mode';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    PROJECT_ROUTES,
    ProjectGridCards,
    ProjectListCards,
    ProjectTable
    
} from '@/pages/admin/projects/project-views';
import type {ProjectRow} from '@/pages/admin/projects/project-views';

type Paged<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export default function ProjectsIndex({
    projects,
    filters,
}: {
    projects: Paged<ProjectRow>;
    filters: { q?: string; sort?: string; dir?: 'asc' | 'desc'; per_page?: number };
}) {
    const isMobile = useIsMobile();
    const { viewMode, setViewMode } = useIndexViewMode({ storageKey: 'projects:index:view' });

    const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } = useIndexQueryParams({
        href: PROJECT_ROUTES.index,
        filters,
        defaultPerPage: 15,
        defaultSort: 'title',
        allowedSorts: ['title'],
    });

    const slOffset = ((projects?.meta?.current_page ?? 1) - 1) * (projects?.meta?.per_page ?? 15);
    const total = projects?.meta?.total ?? 0;
    const hasSearch = q.length > 0;
    const isEmpty = projects.data.length === 0;

    const { requestConfirm, ConfirmDialog } = useConfirmDialog();

    const confirmDelete = React.useCallback(
        (project: ProjectRow) => async () => {
            if (
                !(await requestConfirm({
                    title: 'Delete this project?',
                    description: `"${project.title}" will be permanently removed.`,
                    confirmText: 'Delete',
                    variant: 'destructive',
                }))
            ) {
                return;
            }

            router.delete(PROJECT_ROUTES.destroy(project.id), { preserveScroll: true });
        },
        [requestConfirm],
    );

    const columns = React.useMemo<ColumnDef<ProjectRow>[]>(
        () => [
            {
                id: 'slno',
                header: () => <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</span>,
                cell: ({ row }) => (
                    <span className="text-[13px] tabular-nums text-muted-foreground">{slOffset + row.index + 1}</span>
                ),
            },
            {
                accessorKey: 'title',
                header: () => (
                    <SortableHeader label="Title" column="title" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/15 to-purple-600/15 text-[11px] font-bold text-primary ring-1 ring-white/10">
                            {row.original.title.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{row.original.title}</span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: () => (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                    </span>
                ),
                cell: ({ row }) => (
                    <RowActions
                        showUrl={PROJECT_ROUTES.show(row.original.id)}
                        editUrl={PROJECT_ROUTES.edit(row.original.id)}
                        onDelete={confirmDelete(row.original)}
                        showLabel="View project"
                        editLabel="Edit project"
                        deleteLabel="Delete project"
                    />
                ),
            },
        ],
        [slOffset, sort, dir, toggleSort, confirmDelete],
    );

    const table = useReactTable({
        data: projects.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <PullToRefresh only={['projects']}>
            <ConfirmDialog />
            <Head title="Projects" />

            <SectionHeader
                title="Projects"
                subtitle="Manage project titles."
                icon={FolderKanban}
                iconWrapperClassName="bg-linear-to-br from-violet-500/15 to-purple-600/15"
                iconClassName="text-violet-500"
                right={
                    <Button asChild className="h-11 w-full rounded-full px-5 shadow-lg shadow-primary/20 sm:w-auto">
                        <Link href={PROJECT_ROUTES.create} prefetch>
                            <Plus className="size-4" />
                            New Project
                        </Link>
                    </Button>
                }
                className="mb-6 sm:mb-8"
            />

            <div className="mb-6 grid grid-cols-2 gap-3">
                <GlassCard level="inner" className="px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">{total}</p>
                </GlassCard>
                <GlassCard level="inner" className="px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Showing</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                        {projects.data.length}
                    </p>
                </GlassCard>
            </div>

            <IndexToolbar
                search={q}
                onSearchChange={setQ}
                searchPlaceholder="Search project title…"
                hasSearch={hasSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {isEmpty ? (
                <EmptyState
                    icon={FolderKanban}
                    title={hasSearch ? 'No matches found' : 'No projects yet'}
                    description={
                        hasSearch
                            ? 'Try adjusting your search or clear the filter to see all projects.'
                            : 'Add your first project to get started.'
                    }
                    action={
                        !hasSearch ? (
                            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                                <Link href={PROJECT_ROUTES.create} prefetch>
                                    <Plus className="size-4" />
                                    Add Project
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            ) : viewMode === 'list' ? (
                isMobile ? (
                    <ProjectListCards projects={projects.data} onDelete={confirmDelete} />
                ) : (
                    <ProjectTable table={table} />
                )
            ) : (
                <ProjectGridCards projects={projects.data} onDelete={confirmDelete} />
            )}

            {!isEmpty && projects.links?.length > 0 && (
                <PaginationBar
                    links={projects.links}
                    onVisit={(url) => router.get(url, {}, { preserveScroll: true, preserveState: true })}
                    left={<RowsPerPageSelect value={perPage} onChange={setPerPage} />}
                />
            )}
            </PullToRefresh>
        </ModulePageLayout>
    );
}
