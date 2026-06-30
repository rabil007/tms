import { Head, Link, router } from '@inertiajs/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Globe, Plus } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { SectionHeader } from '@/components/layout/section-header';
import { EmptyState } from '@/components/list/empty-state';
import { IndexToolbar } from '@/components/list/index-toolbar';
import { PaginationBar } from '@/components/list/pagination-bar';
import { RowActions } from '@/components/list/row-actions';
import { RowsPerPageSelect } from '@/components/list/rows-per-page-select';
import { SortableHeader } from '@/components/list/sortable-header';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useIndexQueryParams } from '@/hooks/use-index-query-params';
import { useIndexViewMode } from '@/hooks/use-index-view-mode';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    COUNTRY_ROUTES,
    CountryGridCards,
    CountryListCards,
    CountryTable,
    type CountryRow,
} from '@/pages/admin/countries/country-views';

type Paged<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export default function CountriesIndex({
    countries,
    filters,
}: {
    countries: Paged<CountryRow>;
    filters: { q?: string; sort?: string; dir?: 'asc' | 'desc'; per_page?: number };
}) {
    const isMobile = useIsMobile();
    const { viewMode, setViewMode } = useIndexViewMode({ storageKey: 'countries:index:view' });

    const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } = useIndexQueryParams({
        href: COUNTRY_ROUTES.index,
        filters,
        defaultPerPage: 15,
        defaultSort: 'name',
        allowedSorts: ['name', 'iso2', 'dial_code'],
    });

    const slOffset = ((countries?.meta?.current_page ?? 1) - 1) * (countries?.meta?.per_page ?? 15);
    const total = countries?.meta?.total ?? 0;
    const hasSearch = q.length > 0;
    const isEmpty = countries.data.length === 0;

    const { requestConfirm, ConfirmDialog } = useConfirmDialog();

    const confirmDelete = React.useCallback(
        (country: CountryRow) => async () => {
            if (
                !(await requestConfirm({
                    title: 'Delete this country?',
                    description: `"${country.name}" will be permanently removed.`,
                    confirmText: 'Delete',
                    variant: 'destructive',
                }))
            ) {
                return;
            }

            router.delete(COUNTRY_ROUTES.destroy(country.id), { preserveScroll: true });
        },
        [requestConfirm],
    );

    const columns = React.useMemo<ColumnDef<CountryRow>[]>(
        () => [
            {
                id: 'slno',
                header: () => <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</span>,
                cell: ({ row }) => (
                    <span className="text-[13px] tabular-nums text-muted-foreground">{slOffset + row.index + 1}</span>
                ),
            },
            {
                accessorKey: 'name',
                header: () => (
                    <SortableHeader label="Name" column="name" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/15 to-indigo-600/15 text-[11px] font-bold text-primary ring-1 ring-white/10">
                            {row.original.iso2}
                        </div>
                        <span className="font-medium text-foreground">{row.original.name}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'iso2',
                header: () => (
                    <SortableHeader label="ISO2" column="iso2" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <Badge variant="secondary" className="rounded-md font-mono text-[11px]">
                        {row.original.iso2}
                    </Badge>
                ),
            },
            {
                accessorKey: 'dial_code',
                header: () => (
                    <SortableHeader label="Dial Code" column="dial_code" sort={sort} dir={dir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <Badge variant="outline" className="rounded-md font-mono text-[11px]">
                        {row.original.dial_code}
                    </Badge>
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
                        showUrl={COUNTRY_ROUTES.show(row.original.id)}
                        editUrl={COUNTRY_ROUTES.edit(row.original.id)}
                        onDelete={confirmDelete(row.original)}
                        showLabel="View country"
                        editLabel="Edit country"
                        deleteLabel="Delete country"
                    />
                ),
            },
        ],
        [slOffset, sort, dir, toggleSort, confirmDelete],
    );

    const table = useReactTable({
        data: countries.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <ModulePageLayout backHref="/dashboard" backLabel="Dashboard">
            <ConfirmDialog />
            <Head title="Countries" />

            <SectionHeader
                title="Countries"
                subtitle="Manage country names, ISO codes, and international dial prefixes."
                icon={Globe}
                iconWrapperClassName="bg-linear-to-br from-blue-500/15 to-indigo-600/15"
                iconClassName="text-blue-500"
                right={
                    <Button asChild className="h-11 w-full rounded-full px-5 shadow-lg shadow-primary/20 sm:w-auto">
                        <Link href={COUNTRY_ROUTES.create}>
                            <Plus className="size-4" />
                            New Country
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
                        {countries.data.length}
                    </p>
                </GlassCard>
            </div>

            <IndexToolbar
                search={q}
                onSearchChange={setQ}
                searchPlaceholder="Search name, ISO2, dial code…"
                hasSearch={hasSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {isEmpty ? (
                <EmptyState
                    icon={Globe}
                    title={hasSearch ? 'No matches found' : 'No countries yet'}
                    description={
                        hasSearch
                            ? 'Try adjusting your search or clear the filter to see all countries.'
                            : 'Add your first country to start managing names, ISO codes, and dial prefixes.'
                    }
                    action={
                        !hasSearch ? (
                            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                                <Link href={COUNTRY_ROUTES.create}>
                                    <Plus className="size-4" />
                                    Add Country
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            ) : viewMode === 'list' ? (
                isMobile ? (
                    <CountryListCards countries={countries.data} onDelete={confirmDelete} />
                ) : (
                    <CountryTable table={table} />
                )
            ) : (
                <CountryGridCards countries={countries.data} onDelete={confirmDelete} />
            )}

            {!isEmpty && countries.links?.length > 0 && (
                <PaginationBar
                    links={countries.links}
                    onVisit={(url) => router.get(url, {}, { preserveScroll: true, preserveState: true })}
                    left={<RowsPerPageSelect value={perPage} onChange={setPerPage} />}
                />
            )}
        </ModulePageLayout>
    );
}
