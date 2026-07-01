import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { Button } from '@/components/ui/button';

const ROUTES = {
    index: '/countries',
    edit: (id: number) => `/countries/${id}/edit`,
} as const;

type Country = { id: number; name: string; iso2: string; dial_code: string };

type DetailRowProps = { label: string; value: string; mono?: boolean };

function DetailRow({ label, value, mono = false }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                {label}
            </dt>
            <dd
                className={`text-[15px] font-medium text-foreground sm:text-right ${mono ? 'font-mono tracking-wide' : ''}`}
            >
                {value}
            </dd>
        </div>
    );
}

export default function CountriesShow({ country }: { country: Country }) {
    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Countries">
            <Head title={country.name} />

            <div className="mx-auto w-full max-w-2xl">
                {/* Page header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {country.name}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        Country details and dial code information.
                    </p>
                </div>

                {/* Detail card */}
                <GlassCard>
                    <dl className="divide-y divide-border/40 px-5 py-1 sm:px-8">
                        <div className="py-4">
                            <DetailRow
                                label="Country name"
                                value={country.name}
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="ISO2 code"
                                value={country.iso2}
                                mono
                            />
                        </div>
                        <div className="py-4">
                            <DetailRow
                                label="Dial code"
                                value={country.dial_code}
                                mono
                            />
                        </div>
                    </dl>
                </GlassCard>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 w-full rounded-xl border-border/60 bg-background/50 text-[14px] font-semibold sm:w-auto"
                    >
                        <Link href={ROUTES.index}>Back to list</Link>
                    </Button>
                    <Button
                        asChild
                        className="h-12 w-full rounded-xl px-8 text-[14px] font-semibold shadow-lg shadow-primary/20 sm:w-auto"
                    >
                        <Link href={ROUTES.edit(country.id)}>
                            <Pencil className="size-4" />
                            Edit Country
                        </Link>
                    </Button>
                </div>
            </div>
        </ModulePageLayout>
    );
}
