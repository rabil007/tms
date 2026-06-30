import { router } from '@inertiajs/react';
import type { Table } from '@tanstack/react-table';
import { ChevronRight, Users } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { ResourceTable } from '@/components/list/resource-table';
import { RowActions } from '@/components/list/row-actions';
import { Badge } from '@/components/ui/badge';

export const USER_ROUTES = {
    index: '/users',
    create: '/users/create',
    show: (id: number) => `/users/${id}`,
    edit: (id: number) => `/users/${id}/edit`,
    destroy: (id: number) => `/users/${id}`,
} as const;

export type UserRole = { id: number; name: string; slug: string };

export type UserRow = {
    id: number;
    name: string;
    email: string;
    role?: UserRole | null;
};

type UserTableProps = {
    table: Table<UserRow>;
};

export function UserTable({ table }: UserTableProps) {
    return (
        <ResourceTable
            table={table}
            onRowClick={(user) => router.get(USER_ROUTES.show(user.id))}
        />
    );
}

type UserCardsProps = {
    users: UserRow[];
    onDelete: (user: UserRow) => () => Promise<void>;
};

function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/15 to-blue-600/15 text-sm font-bold text-primary ring-1 ring-white/10">
            {initials}
        </div>
    );
}

export function UserRoleBadge({ role }: { role?: UserRole | null }) {
    if (!role) {
        return <span className="text-muted-foreground">—</span>;
    }

    const variant = role.slug === 'admin' ? 'default' : 'secondary';

    return (
        <Badge variant={variant} className="text-[11px]">
            {role.name}
        </Badge>
    );
}

export function UserListCards({ users, onDelete }: UserCardsProps) {
    return (
        <div className="space-y-3">
            {users.map((user) => (
                <GlassCard
                    key={user.id}
                    className="group cursor-pointer p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(USER_ROUTES.show(user.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(USER_ROUTES.show(user.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3.5">
                        <UserAvatar name={user.name} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
                            <div className="mt-1.5">
                                <UserRoleBadge role={user.role} />
                            </div>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={USER_ROUTES.show(user.id)}
                            editUrl={USER_ROUTES.edit(user.id)}
                            onDelete={onDelete(user)}
                            showLabel="View user"
                            editLabel="Edit user"
                            deleteLabel="Delete user"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export function UserGridCards({ users, onDelete }: UserCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {users.map((user) => (
                <GlassCard
                    key={user.id}
                    className="group flex cursor-pointer flex-col p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(USER_ROUTES.show(user.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(USER_ROUTES.show(user.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <UserAvatar name={user.name} />
                    <p className="mt-3 line-clamp-2 font-semibold text-foreground">{user.name}</p>
                    <p className="mt-1 truncate text-[12px] text-muted-foreground">{user.email}</p>
                    <div className="mt-2">
                        <UserRoleBadge role={user.role} />
                    </div>
                    <div className="mt-auto flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={USER_ROUTES.show(user.id)}
                            editUrl={USER_ROUTES.edit(user.id)}
                            onDelete={onDelete(user)}
                            showLabel="View user"
                            editLabel="Edit user"
                            deleteLabel="Delete user"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export { Users };
