import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
export type DashboardModule = {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    href: string;
    badge?: number;
};

export type DashboardGridProps = {
    modules: DashboardModule[];
    iconSize?: 'sm' | 'md' | 'lg';
    storageKey?: string;
    className?: string;
};

export function glassColor(gradientClass: string): { bg: string; icon: string } {
    const map: Record<string, { bg: string; icon: string }> = {
        'from-blue-600 to-indigo-700': {
            bg: 'color-mix(in oklch, var(--chart-3), transparent 82%)',
            icon: 'var(--chart-2)',
        },
        'from-amber-500 to-orange-600': {
            bg: 'color-mix(in oklch, var(--status-pending), transparent 82%)',
            icon: 'var(--status-pending)',
        },
        'from-emerald-500 to-teal-600': {
            bg: 'color-mix(in oklch, var(--status-confirmed), transparent 82%)',
            icon: 'var(--status-confirmed)',
        },
        'from-sky-500 to-indigo-600': {
            bg: 'color-mix(in oklch, var(--chart-2), transparent 82%)',
            icon: 'var(--chart-2)',
        },
        'from-slate-500 to-slate-700': {
            bg: 'color-mix(in oklch, var(--muted-foreground), transparent 86%)',
            icon: 'var(--foreground)',
        },
        'from-slate-600 to-slate-700': {
            bg: 'color-mix(in oklch, var(--muted-foreground), transparent 84%)',
            icon: 'var(--foreground)',
        },
        'from-orange-500 to-amber-600': {
            bg: 'color-mix(in oklch, var(--status-pending), transparent 82%)',
            icon: 'var(--status-pending)',
        },
        'from-fuchsia-600 to-pink-700': {
            bg: 'color-mix(in oklch, var(--chart-4), transparent 82%)',
            icon: 'var(--chart-4)',
        },
        'from-violet-600 to-purple-700': {
            bg: 'color-mix(in oklch, var(--chart-1), transparent 82%)',
            icon: 'var(--chart-1)',
        },
        'from-cyan-500 to-sky-600': {
            bg: 'color-mix(in oklch, var(--chart-2), transparent 82%)',
            icon: 'var(--chart-2)',
        },
        'from-blue-500 to-indigo-600': {
            bg: 'color-mix(in oklch, var(--primary), transparent 80%)',
            icon: 'var(--primary)',
        },
        'from-zinc-600 to-neutral-800': {
            bg: 'color-mix(in oklch, var(--muted-foreground), transparent 86%)',
            icon: 'var(--foreground)',
        },
    };

    return (
        map[gradientClass] ?? {
            bg: 'color-mix(in oklch, var(--foreground), transparent 90%)',
            icon: 'var(--foreground)',
        }
    );
}

function orderModules(base: DashboardModule[], order: string[] | null): DashboardModule[] {
    if (!order || !Array.isArray(order) || order.length === 0) {
        return base;
    }

    const map = new Map(base.map((m) => [m.id, m] as const));
    const ordered = order.map((id) => map.get(id)).filter(Boolean) as DashboardModule[];
    const leftovers = base.filter((m) => !order.includes(m.id));

    return [...ordered, ...leftovers];
}

export function DashboardGrid({
    modules: baseModules,
    iconSize = 'lg',
    storageKey,
    className,
}: DashboardGridProps) {
    const [modules, setModules] = React.useState<DashboardModule[]>(baseModules);
    const [draggingId, setDraggingId] = React.useState<string | null>(null);

    const baseKey = React.useMemo(
        () => baseModules.map((m) => m.id).join('|'),
        [baseModules],
    );

    React.useEffect(() => {
        if (!storageKey) {
            queueMicrotask(() => setModules(baseModules));

            return;
        }

        try {
            const raw = window.localStorage.getItem(storageKey);
            const order = raw ? (JSON.parse(raw) as string[]) : null;
            queueMicrotask(() => setModules(orderModules(baseModules, order)));
        } catch {
            queueMicrotask(() => setModules(baseModules));
        }
    }, [storageKey, baseKey, baseModules]);

    const persistOrder = (next: DashboardModule[]) => {
        if (!storageKey) {
            return;
        }

        try {
            window.localStorage.setItem(
                storageKey,
                JSON.stringify(next.map((m) => m.id)),
            );
        } catch {
            void 0;
        }
    };

    const move = (activeId: string, overId: string) => {
        if (activeId === overId) {
            return;
        }

        setModules((current) => {
            const from = current.findIndex((m) => m.id === activeId);
            const to = current.findIndex((m) => m.id === overId);

            if (from === -1 || to === -1) {
                return current;
            }

            const next = current.slice();
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            persistOrder(next);

            return next;
        });
    };

    const canReorder = React.useMemo(
        () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
        [],
    );

    const tileSizeClass =
        iconSize === 'sm'
            ? 'h-16 w-16 sm:h-[64px] sm:w-[64px]'
            : iconSize === 'lg'
              ? 'h-22 w-22 sm:h-[88px] sm:w-[88px]'
              : 'h-18 w-18 sm:h-[72px] sm:w-[72px]';

    const iconClass =
        iconSize === 'sm'
            ? 'size-7 sm:size-8'
            : iconSize === 'lg'
              ? 'size-9 sm:size-10'
              : 'size-8 sm:size-9';

    return (
        <div
            className={cn(
                'grid w-full max-w-lg grid-cols-3 justify-items-center gap-x-3 gap-y-8 px-1',
                'sm:max-w-2xl sm:gap-x-6 sm:gap-y-10 sm:px-0',
                'md:max-w-4xl md:grid-cols-4 md:gap-x-10 md:gap-y-14',
                'lg:max-w-5xl lg:grid-cols-5',
                className,
            )}
        >
            {modules.map((module) => (
                <Link
                    key={module.id}
                    href={module.href}
                    prefetch
                    draggable={canReorder}
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', module.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingId(module.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onDragOver={(e) => {
                        if (!draggingId || draggingId === module.id) {
                            return;
                        }

                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        const activeId = e.dataTransfer.getData('text/plain');

                        if (!activeId) {
                            return;
                        }

                        move(activeId, module.id);
                        setDraggingId(null);
                    }}
                    className="group flex min-w-[88px] touch-manipulation flex-col items-center gap-2.5 outline-none sm:gap-3"
                >
                    <div className="relative">
                        <div
                            className={cn(
                                'flex items-center justify-center',
                                'relative isolate overflow-hidden',
                                tileSizeClass,
                                'rounded-3xl',
                                'transition-all duration-200 ease-out',
                                'group-hover:-translate-y-0.5 group-hover:scale-[1.10]',
                                'group-hover:shadow-2xl',
                                'group-active:scale-95',
                                'group-focus-visible:ring-4 group-focus-visible:ring-ring/30',
                                draggingId && draggingId === module.id ? 'scale-95 opacity-70' : '',
                            )}
                            style={{
                                background: glassColor(module.color).bg,
                                backdropFilter: 'blur(20px) saturate(1.4)',
                                WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                            }}
                        >
                            <span
                                className="pointer-events-none absolute top-0 left-0 z-1 h-[55%] w-[65%]"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
                                    borderRadius: '22px 22px 60% 0',
                                }}
                            />

                            <span className="pointer-events-none absolute -inset-px z-3 rounded-3xl border border-white/0 transition-all duration-200 group-hover:border-white/30" />

                            <module.icon
                                className={cn('relative z-2 stroke-[1.4]', iconClass)}
                                style={{
                                    color: glassColor(module.color).icon,
                                    filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))',
                                }}
                            />
                        </div>

                        {module.badge != null && Number(module.badge) > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-destructive px-1.5 text-[11px] font-black text-destructive-foreground shadow-lg">
                                {Number(module.badge)}
                            </span>
                        )}
                    </div>

                    <span className="text-center text-[12px] font-semibold tracking-wide text-muted-foreground transition-colors group-hover:text-foreground sm:text-[13px]">
                        {module.name}
                    </span>
                </Link>
            ))}
        </div>
    );
}
