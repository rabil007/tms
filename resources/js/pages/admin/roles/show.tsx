import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { Button } from '@/components/ui/button';
import { RoleSlugBadge, ROLE_ROUTES } from '@/pages/admin/roles/role-views';

type Role = { id: number; name: string; slug: string };

type DetailRowProps = { label: string; value: React.ReactNode };

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">{label}</dt>
            <dd className="text-[15px] font-medium text-foreground sm:text-right">{value}</dd>
        </div>
    );
}

export default function RolesShow({ role }: { role: Role }) {
    return (
        <ModulePageLayout backHref={ROLE_ROUTES.index} backLabel="Roles">
            <Head title={role.name} />

            <div className="mx-auto w-full max-w-2xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{role.name}</h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">Role details.</p>
                </div>

                <GlassCard>
                    <dl className="divide-y divide-border/40 px-5 py-1 sm:px-8">
                        <div className="py-4">
                            <DetailRow label="Role name" value={role.name} />
                        </div>
                        <div className="py-4">
                            <DetailRow label="Slug" value={<RoleSlugBadge slug={role.slug} />} />
                        </div>
                    </dl>
                </GlassCard>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 w-full rounded-xl border-border/60 bg-background/50 text-[14px] font-semibold sm:w-auto"
                    >
                        <Link href={ROLE_ROUTES.index}>Back to list</Link>
                    </Button>
                    <Button asChild className="h-12 w-full rounded-xl px-8 text-[14px] font-semibold shadow-lg shadow-primary/20 sm:w-auto">
                        <Link href={ROLE_ROUTES.edit(role.id)}>
                            <Pencil className="size-4" />
                            Edit Role
                        </Link>
                    </Button>
                </div>
            </div>
        </ModulePageLayout>
    );
}
