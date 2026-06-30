import { router } from '@inertiajs/react';
import { ChevronRight, Shield } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { RowActions } from '@/components/list/row-actions';
import { ResourceTable } from '@/components/list/resource-table';
import { Badge } from '@/components/ui/badge';
import type { Table } from '@tanstack/react-table';

export const ROLE_ROUTES = {
    index: '/roles',
    create: '/roles/create',
    show: (id: number) => `/roles/${id}`,
    edit: (id: number) => `/roles/${id}/edit`,
    destroy: (id: number) => `/roles/${id}`,
} as const;

export type RoleRow = { id: number; name: string; slug: string };

type RoleTableProps = {
    table: Table<RoleRow>;
};

export function RoleTable({ table }: RoleTableProps) {
    return (
        <ResourceTable
            table={table}
            onRowClick={(role) => router.get(ROLE_ROUTES.show(role.id))}
        />
    );
}

type RoleCardsProps = {
    roles: RoleRow[];
    onDelete: (role: RoleRow) => () => Promise<void>;
};

function RoleIcon({ name }: { name: string }) {
    const initials = name.slice(0, 2).toUpperCase();

    return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500/15 to-pink-600/15 text-sm font-bold text-primary ring-1 ring-white/10">
            {initials}
        </div>
    );
}

function RoleSlugBadge({ slug }: { slug: string }) {
    const isSystem = slug === 'admin' || slug === 'user';

    return (
        <Badge variant={isSystem ? 'default' : 'secondary'} className="font-mono text-[11px]">
            {slug}
        </Badge>
    );
}

export function RoleListCards({ roles, onDelete }: RoleCardsProps) {
    return (
        <div className="space-y-3">
            {roles.map((role) => (
                <GlassCard
                    key={role.id}
                    className="group cursor-pointer p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(ROLE_ROUTES.show(role.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(ROLE_ROUTES.show(role.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3.5">
                        <RoleIcon name={role.name} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{role.name}</p>
                            <div className="mt-1">
                                <RoleSlugBadge slug={role.slug} />
                            </div>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={ROLE_ROUTES.show(role.id)}
                            editUrl={ROLE_ROUTES.edit(role.id)}
                            onDelete={onDelete(role)}
                            showLabel="View role"
                            editLabel="Edit role"
                            deleteLabel="Delete role"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export function RoleGridCards({ roles, onDelete }: RoleCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {roles.map((role) => (
                <GlassCard
                    key={role.id}
                    className="group flex cursor-pointer flex-col p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(ROLE_ROUTES.show(role.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(ROLE_ROUTES.show(role.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <RoleIcon name={role.name} />
                    <p className="mt-3 line-clamp-2 font-semibold text-foreground">{role.name}</p>
                    <div className="mt-2">
                        <RoleSlugBadge slug={role.slug} />
                    </div>
                    <div className="mt-auto flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={ROLE_ROUTES.show(role.id)}
                            editUrl={ROLE_ROUTES.edit(role.id)}
                            onDelete={onDelete(role)}
                            showLabel="View role"
                            editLabel="Edit role"
                            deleteLabel="Delete role"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export { Shield, RoleSlugBadge };
