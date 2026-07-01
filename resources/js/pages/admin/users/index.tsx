import { Deferred, Head, Link, router, usePage } from '@inertiajs/react';
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
import { StatCardsSkeleton } from '@/components/loading/stat-cards-skeleton';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useIndexQueryParams } from '@/hooks/use-index-query-params';
import { useIndexViewMode } from '@/hooks/use-index-view-mode';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    USER_ROUTES,
    UserGridCards,
    UserListCards,
    UserRoleBadge,
    UserTable,
    Users,
} from '@/pages/admin/users/user-views';
import type { UserRow } from '@/pages/admin/users/user-views';

type Paged<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    total?: number;
};

export default function UsersIndex({
    users,
    filters,
}: {
    users: Paged<UserRow>;
    filters: {
        q?: string;
        sort?: string;
        dir?: 'asc' | 'desc';
        per_page?: number;
    };
    counts?: { total: number; admins: number; users: number };
}) {
    const isMobile = useIsMobile();
    const { viewMode, setViewMode } = useIndexViewMode({
        storageKey: 'users:index:view',
    });

    const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } =
        useIndexQueryParams({
            href: USER_ROUTES.index,
            filters,
            defaultPerPage: 15,
            defaultSort: 'name',
            allowedSorts: ['name', 'email'],
        });

    const slOffset =
        ((users?.meta?.current_page ?? 1) - 1) * (users?.meta?.per_page ?? 15);
    const hasSearch = q.length > 0;
    const isEmpty = users.data.length === 0;

    const { requestConfirm, ConfirmDialog } = useConfirmDialog();

    const confirmDelete = React.useCallback(
        (user: UserRow) => async () => {
            if (
                !(await requestConfirm({
                    title: 'Delete this user?',
                    description: `"${user.name}" will be permanently removed.`,
                    confirmText: 'Delete',
                    variant: 'destructive',
                }))
            ) {
                return;
            }

            router.delete(USER_ROUTES.destroy(user.id), {
                preserveScroll: true,
            });
        },
        [requestConfirm],
    );

    const columns = React.useMemo<ColumnDef<UserRow>[]>(
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
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/15 to-blue-600/15 text-[11px] font-bold text-primary ring-1 ring-border dark:ring-white/10">
                            {row.original.name
                                .split(' ')
                                .map((part) => part[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                            {row.original.name}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'email',
                header: () => (
                    <SortableHeader
                        label="Email"
                        column="email"
                        sort={sort}
                        dir={dir}
                        onSort={toggleSort}
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-[14px] text-muted-foreground">
                        {row.original.email}
                    </span>
                ),
            },
            {
                id: 'role',
                header: () => (
                    <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Role
                    </span>
                ),
                cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
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
                        showUrl={USER_ROUTES.show(row.original.id)}
                        editUrl={USER_ROUTES.edit(row.original.id)}
                        onDelete={confirmDelete(row.original)}
                        showLabel="View user"
                        editLabel="Edit user"
                        deleteLabel="Delete user"
                    />
                ),
            },
        ],
        [slOffset, sort, dir, toggleSort, confirmDelete],
    );

    const table = useReactTable({
        data: users.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <PullToRefresh only={['users', 'counts']}>
                <ConfirmDialog />
                <Head title="Users" />

                <SectionHeader
                    title="Users"
                    subtitle="Manage user accounts and roles."
                    icon={Users}
                    iconWrapperClassName="bg-linear-to-br from-cyan-500/15 to-blue-600/15"
                    iconClassName="text-cyan-500"
                    right={
                        <Button
                            asChild
                            className="h-11 w-full rounded-full px-5 shadow-lg shadow-primary/20 sm:w-auto"
                        >
                            <Link href={USER_ROUTES.create} prefetch>
                                <Plus className="size-4" />
                                New User
                            </Link>
                        </Button>
                    }
                    className="mb-6 sm:mb-8"
                />

                <Deferred
                    data="counts"
                    fallback={
                        <StatCardsSkeleton
                            count={3}
                            columns="grid-cols-1 sm:grid-cols-3"
                            className="mb-6"
                        />
                    }
                >
                    <UserStatCards />
                </Deferred>

                <IndexToolbar
                    search={q}
                    onSearchChange={setQ}
                    searchPlaceholder="Search name, email, or role…"
                    hasSearch={hasSearch}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {isEmpty ? (
                    <EmptyState
                        icon={Users}
                        title={hasSearch ? 'No matches found' : 'No users yet'}
                        description={
                            hasSearch
                                ? 'Try adjusting your search or clear the filter to see all users.'
                                : 'Add your first user to get started.'
                        }
                        action={
                            !hasSearch ? (
                                <Button
                                    asChild
                                    className="rounded-full px-6 shadow-lg shadow-primary/20"
                                >
                                    <Link href={USER_ROUTES.create} prefetch>
                                        <Plus className="size-4" />
                                        Add User
                                    </Link>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : viewMode === 'list' ? (
                    isMobile ? (
                        <UserListCards
                            users={users.data}
                            onDelete={confirmDelete}
                        />
                    ) : (
                        <UserTable table={table} />
                    )
                ) : (
                    <UserGridCards
                        users={users.data}
                        onDelete={confirmDelete}
                    />
                )}

                {!isEmpty && users.links?.length > 0 && (
                    <PaginationBar
                        links={users.links}
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

function UserStatCards() {
    const { counts } = usePage<{
        counts: { total: number; admins: number; users: number };
    }>().props;

    return (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <GlassCard level="inner" className="px-4 py-3.5">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Total
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {counts.total}
                </p>
            </GlassCard>
            <GlassCard level="inner" className="px-4 py-3.5">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Admins
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {counts.admins}
                </p>
            </GlassCard>
            <GlassCard level="inner" className="px-4 py-3.5">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Users
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {counts.users}
                </p>
            </GlassCard>
        </div>
    );
}
