import { router } from '@inertiajs/react';
import type { Table } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { ResourceTable } from '@/components/list/resource-table';
import { RowActions } from '@/components/list/row-actions';
import { Badge } from '@/components/ui/badge';

export const COUNTRY_ROUTES = {
    index: '/countries',
    create: '/countries/create',
    show: (id: number) => `/countries/${id}`,
    edit: (id: number) => `/countries/${id}/edit`,
    destroy: (id: number) => `/countries/${id}`,
} as const;

export type CountryRow = { id: number; name: string; iso2: string; dial_code: string };

type CountryTableProps = {
    table: Table<CountryRow>;
};

export function CountryTable({ table }: CountryTableProps) {
    return (
        <ResourceTable
            table={table}
            onRowClick={(country) => router.get(COUNTRY_ROUTES.show(country.id))}
        />
    );
}

type CountryCardsProps = {
    countries: CountryRow[];
    onDelete: (country: CountryRow) => () => Promise<void>;
};

export function CountryListCards({ countries, onDelete }: CountryCardsProps) {
    return (
        <div className="space-y-3">
            {countries.map((country) => (
                <GlassCard
                    key={country.id}
                    className="group cursor-pointer p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(COUNTRY_ROUTES.show(country.id))}
                    onMouseEnter={() => router.prefetch(COUNTRY_ROUTES.show(country.id))}
                    onTouchStart={() => router.prefetch(COUNTRY_ROUTES.show(country.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(COUNTRY_ROUTES.show(country.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-600/15 text-sm font-bold text-primary ring-1 ring-white/10">
                            {country.iso2}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{country.name}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="rounded-md font-mono text-[11px]">
                                    {country.iso2}
                                </Badge>
                                <Badge variant="outline" className="rounded-md font-mono text-[11px]">
                                    {country.dial_code}
                                </Badge>
                            </div>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={COUNTRY_ROUTES.show(country.id)}
                            editUrl={COUNTRY_ROUTES.edit(country.id)}
                            onDelete={onDelete(country)}
                            showLabel="View country"
                            editLabel="Edit country"
                            deleteLabel="Delete country"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export function CountryGridCards({ countries, onDelete }: CountryCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {countries.map((country) => (
                <GlassCard
                    key={country.id}
                    className="group flex cursor-pointer flex-col p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(COUNTRY_ROUTES.show(country.id))}
                    onMouseEnter={() => router.prefetch(COUNTRY_ROUTES.show(country.id))}
                    onTouchStart={() => router.prefetch(COUNTRY_ROUTES.show(country.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(COUNTRY_ROUTES.show(country.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-600/15 text-sm font-bold text-primary ring-1 ring-white/10">
                        {country.iso2}
                    </div>
                    <p className="mt-3 line-clamp-2 font-semibold text-foreground">{country.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="rounded-md font-mono text-[11px]">
                            {country.iso2}
                        </Badge>
                        <Badge variant="outline" className="rounded-md font-mono text-[11px]">
                            {country.dial_code}
                        </Badge>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={COUNTRY_ROUTES.show(country.id)}
                            editUrl={COUNTRY_ROUTES.edit(country.id)}
                            onDelete={onDelete(country)}
                            showLabel="View country"
                            editLabel="Edit country"
                            deleteLabel="Delete country"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
