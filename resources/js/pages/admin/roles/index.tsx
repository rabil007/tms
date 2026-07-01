import { Head, Link, router } from '@inertiajs/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
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
    ROLE_ROUTES,
    RoleGridCards,
    RoleListCards,
    RoleSlugBadge,
    RoleTable,
    Shield,
} from '@/pages/admin/roles/role-views';
import type { RoleRow } from '@/pages/admin/roles/role-views';

type Paged<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function RolesIndex({
    roles,
    filters,
}: {
    roles: Paged<RoleRow>;
    filters: {
        q?: string;
        sort?: string;
        dir?: 'asc' | 'desc';
        per_page?: number;
    };
}) {
    const isMobile = useIsMobile();
    const { viewMode, setViewMode } = useIndexViewMode({
        storageKey: 'roles:index:view',
    });

    const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } =
        useIndexQueryParams({
            href: ROLE_ROUTES.index,
            filters,
            defaultPerPage: 15,
            defaultSort: 'name',
            allowedSorts: ['name', 'slug'],
        });

    const slOffset =
        ((roles?.meta?.current_page ?? 1) - 1) * (roles?.meta?.per_page ?? 15);
    const total = roles?.meta?.total ?? 0;
    const hasSearch = q.length > 0;
    const isEmpty = roles.data.length === 0;

    const { requestConfirm, ConfirmDialog } = useConfirmDialog();

    const confirmDelete = React.useCallback(
        (role: RoleRow) => async () => {
            if (
                !(await requestConfirm({
                    title: 'Delete this role?',
                    description: `"${role.name}" will be permanently removed.`,
                    confirmText: 'Delete',
                    variant: 'destructive',
                }))
            ) {
                return;
            }

            router.delete(ROLE_ROUTES.destroy(role.id), {
                preserveScroll: true,
            });
        },
        [requestConfirm],
    );

    const columns = React.useMemo<ColumnDef<RoleRow>[]>(
        () => [
            {
                id: 'slno',
                header: () => (
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        #
                    </span>
                ),
                cell: ({ row }) => (
                    <span className="text-[13px] text-muted-foreground tabular-nums">
                        {slOffset + row.index + 1}
                    </span>
                ),
            },
            {
                accessorKey: 'name',
                header: () => (
                    <SortableHeader
                        label="Name"
                        column="name"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500/15 to-pink-600/15 text-[11px] font-bold text-primary ring-1 ring-white/10">
                            {row.original.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                            {row.original.name}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'slug',
                header: () => (
                    <SortableHeader
                        label="Slug"
                        column="slug"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => <RoleSlugBadge slug={row.original.slug} />,
            },
            {
                id: 'actions',
                header: () => (
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Actions
                    </span>
                ),
                cell: ({ row }) => (
                    <RowActions
                        showUrl={ROLE_ROUTES.show(row.original.id)}
                        editUrl={ROLE_ROUTES.edit(row.original.id)}
                        onDelete={confirmDelete(row.original)}
                        showLabel="View role"
                        editLabel="Edit role"
                        deleteLabel="Delete role"
                    />
                ),
            },
        ],
        [slOffset, sort, dir, toggleSort, confirmDelete],
    );

    const table = useReactTable({
        data: roles.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <PullToRefresh only={['roles']}>
                <ConfirmDialog />
                <Head title="Roles" />

                <SectionHeader
                    title="Roles"
                    subtitle="Manage user roles and permissions."
                    icon={Shield}
                    iconWrapperClassName="bg-linear-to-br from-rose-500/15 to-pink-600/15"
                    iconClassName="text-rose-500"
                    right={
                        <Button
                            asChild
                            className="h-11 w-full rounded-full px-5 shadow-lg shadow-primary/20 sm:w-auto"
                        >
                            <Link href={ROLE_ROUTES.create} prefetch>
                                <Plus className="size-4" />
                                New Role
                            </Link>
                        </Button>
                    }
                    className="mb-6 sm:mb-8"
                />

                <div className="mb-6 grid grid-cols-2 gap-3">
                    <GlassCard level="inner" className="px-4 py-3.5">
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Total
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                            {total}
                        </p>
                    </GlassCard>
                    <GlassCard level="inner" className="px-4 py-3.5">
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Showing
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                            {roles.data.length}
                        </p>
                    </GlassCard>
                </div>

                <IndexToolbar
                    search={q}
                    onSearchChange={setQ}
                    searchPlaceholder="Search role name or slug…"
                    hasSearch={hasSearch}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {isEmpty ? (
                    <EmptyState
                        icon={Shield}
                        title={hasSearch ? 'No matches found' : 'No roles yet'}
                        description={
                            hasSearch
                                ? 'Try adjusting your search or clear the filter to see all roles.'
                                : 'Add your first role to get started.'
                        }
                        action={
                            !hasSearch ? (
                                <Button
                                    asChild
                                    className="rounded-full px-6 shadow-lg shadow-primary/20"
                                >
                                    <Link href={ROLE_ROUTES.create} prefetch>
                                        <Plus className="size-4" />
                                        Add Role
                                    </Link>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : viewMode === 'list' ? (
                    isMobile ? (
                        <RoleListCards
                            roles={roles.data}
                            onDelete={confirmDelete}
                        />
                    ) : (
                        <RoleTable table={table} />
                    )
                ) : (
                    <RoleGridCards
                        roles={roles.data}
                        onDelete={confirmDelete}
                    />
                )}

                {!isEmpty && roles.links?.length > 0 && (
                    <PaginationBar
                        links={roles.links}
                        onVisit={(url) =>
                            router.get(
                                url,
                                {},
                                { preserveScroll: true, preserveState: true },
                            )
                        }
                        left={
                            <RowsPerPageSelect
                                value={perPage}
                                onChange={setPerPage}
                            />
                        }
                    />
                )}
            </PullToRefresh>
        </ModulePageLayout>
    );
}
