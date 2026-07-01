import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import {
    APP_LAUNCH_COMPLETE_EVENT,
    hasAppLaunchedThisSession,
    prefersReducedMotion,
} from '@/lib/pwa';
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

const LONG_PRESS_MS = 400;
const DRAG_THRESHOLD = 6;

type ModuleIconStyle = { bg: string; icon: string };

const MODULE_ICON_STYLES: Record<string, ModuleIconStyle> = {
    home: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-overview), transparent 78%)',
        icon: 'var(--dashboard-icon-overview)',
    },
    schedules: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-schedules), transparent 78%)',
        icon: 'var(--dashboard-icon-schedules)',
    },
    users: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-users), transparent 78%)',
        icon: 'var(--dashboard-icon-users)',
    },
    roles: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-roles), transparent 78%)',
        icon: 'var(--dashboard-icon-roles)',
    },
    projects: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-projects), transparent 78%)',
        icon: 'var(--dashboard-icon-projects)',
    },
    countries: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-countries), transparent 78%)',
        icon: 'var(--dashboard-icon-countries)',
    },
    settings: {
        bg: 'color-mix(in oklch, var(--dashboard-icon-settings), transparent 78%)',
        icon: 'var(--dashboard-icon-settings)',
    },
};

function getModuleIconStyle(moduleId: string): ModuleIconStyle {
    return (
        MODULE_ICON_STYLES[moduleId] ?? {
            bg: 'var(--dashboard-tile-surface)',
            icon: 'var(--foreground)',
        }
    );
}

/** @deprecated Use getModuleIconStyle(module.id) instead */
export function glassColor(gradientClass: string): ModuleIconStyle {
    const legacyMap: Record<string, ModuleIconStyle> = {
        'from-slate-600 to-slate-700': MODULE_ICON_STYLES.home,
        'from-emerald-500 to-teal-600': MODULE_ICON_STYLES.schedules,
        'from-cyan-500 to-sky-600': MODULE_ICON_STYLES.users,
        'from-rose-500 to-pink-600': MODULE_ICON_STYLES.roles,
        'from-violet-500 to-purple-600': MODULE_ICON_STYLES.projects,
        'from-blue-500 to-indigo-600': MODULE_ICON_STYLES.countries,
        'from-zinc-600 to-neutral-800': MODULE_ICON_STYLES.settings,
    };

    return (
        legacyMap[gradientClass] ?? {
            bg: 'var(--dashboard-tile-surface)',
            icon: 'var(--foreground)',
        }
    );
}

const PINNED_TAIL_ORDER = ['projects', 'countries', 'settings'] as const;
const PINNED_TAIL_SET = new Set<string>(PINNED_TAIL_ORDER);

function enforceModuleOrder(
    base: DashboardModule[],
    order: string[] | null,
): DashboardModule[] {
    const map = new Map(base.map((m) => [m.id, m] as const));
    const pinned = PINNED_TAIL_ORDER.filter((id) => map.has(id)).map((id) =>
        map.get(id)!,
    );
    const unpinnedBase = base.filter((m) => !PINNED_TAIL_SET.has(m.id));

    if (!order || !Array.isArray(order) || order.length === 0) {
        return [...unpinnedBase, ...pinned];
    }

    const unpinnedIds = order.filter(
        (id) => !PINNED_TAIL_SET.has(id) && map.has(id),
    );
    const orderedUnpinned = unpinnedIds.map((id) => map.get(id)!);
    const leftoverUnpinned = unpinnedBase.filter(
        (m) => !unpinnedIds.includes(m.id),
    );

    return [...orderedUnpinned, ...leftoverUnpinned, ...pinned];
}

function findModuleIdAtPoint(x: number, y: number): string | null {
    const element = document
        .elementFromPoint(x, y)
        ?.closest('[data-dashboard-module]');

    return element?.getAttribute('data-dashboard-module') ?? null;
}

export function DashboardGrid({
    modules: baseModules,
    iconSize = 'lg',
    storageKey,
    className,
}: DashboardGridProps) {
    const [modules, setModules] =
        React.useState<DashboardModule[]>(baseModules);
    const [draggingId, setDraggingId] = React.useState<string | null>(null);
    const [isReordering, setIsReordering] = React.useState(false);
    const [animateTiles, setAnimateTiles] = React.useState(() => {
        if (typeof window === 'undefined') {
            return true;
        }

        return hasAppLaunchedThisSession();
    });

    /**
     * Prevents click/navigation firing immediately after a drag ends.
     * Set to true on drag end, cleared after a short timeout.
     */
    const justDraggedRef = React.useRef(false);

    // --- Launch animation ---
    React.useEffect(() => {
        if (animateTiles) {
            return;
        }

        const handleLaunchComplete = () => setAnimateTiles(true);

        window.addEventListener(
            APP_LAUNCH_COMPLETE_EVENT,
            handleLaunchComplete,
        );

        return () =>
            window.removeEventListener(
                APP_LAUNCH_COMPLETE_EVENT,
                handleLaunchComplete,
            );
    }, [animateTiles]);

    // --- Load saved order from localStorage ---
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
            queueMicrotask(() =>
                setModules(enforceModuleOrder(baseModules, order)),
            );
        } catch {
            queueMicrotask(() => setModules(baseModules));
        }
    }, [storageKey, baseKey, baseModules]);

    const persistOrder = React.useCallback(
        (next: DashboardModule[]) => {
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
        },
        [storageKey],
    );

    const doMove = React.useCallback(
        (activeId: string, overId: string) => {
            if (activeId === overId || PINNED_TAIL_SET.has(overId)) {
                return;
            }

            setModules((current) => {
                const from = current.findIndex((m) => m.id === activeId);
                const to = current.findIndex((m) => m.id === overId);

                if (from === -1 || to === -1) {
                    return current;
                }

                const next = [...current];
                const [item] = next.splice(from, 1);
                next.splice(to, 0, item);
                const enforced = enforceModuleOrder(
                    baseModules,
                    next.map((m) => m.id),
                );
                persistOrder(enforced);

                return enforced;
            });
        },
        [baseModules, persistOrder],
    );

    /**
     * Activates drag mode for a module. Attaches global pointermove/pointerup
     * listeners so tracking works even when the pointer leaves the original tile.
     * Each drag session creates its own closure — no stale state issues.
     */
    const startDrag = React.useCallback(
        (moduleId: string) => {
            setDraggingId(moduleId);
            setIsReordering(true);
            justDraggedRef.current = false;

            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(12);
            }

            let lastOverId: string | null = null;

            const onMove = (e: PointerEvent) => {
                // Prevent page scroll during confirmed drag
                e.preventDefault();

                const overId = findModuleIdAtPoint(e.clientX, e.clientY);

                if (overId && overId !== moduleId && overId !== lastOverId) {
                    lastOverId = overId;
                    doMove(moduleId, overId);
                }
            };

            const onUp = () => {
                justDraggedRef.current = true;
                window.setTimeout(() => {
                    justDraggedRef.current = false;
                }, 350);

                setDraggingId(null);
                setIsReordering(false);
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                document.removeEventListener('pointercancel', onUp);
            };

            // passive: false so we can call preventDefault() to suppress page scroll
            document.addEventListener('pointermove', onMove, {
                passive: false,
            });
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onUp);
        },
        [doMove],
    );

    /**
     * Per-tile pointerdown handler.
     * - Touch: starts a long-press timer; cancels if finger moves > threshold first.
     * - Mouse: adds a pre-drag global listener; starts drag once cursor moves > threshold.
     */
    const handleTilePointerDown = React.useCallback(
        (moduleId: string, e: React.PointerEvent<HTMLElement>) => {
            if (!storageKey || PINNED_TAIL_SET.has(moduleId)) {
                return;
            }

            // Ignore non-primary button presses (right-click etc.)
            if (e.button != null && e.button !== 0) {
                return;
            }

            const isTouch = e.pointerType === 'touch';
            const startX = e.clientX;
            const startY = e.clientY;
            let timer: number | null = null;
            let done = false;

            const cancel = () => {
                done = true;

                if (timer !== null) {
                    window.clearTimeout(timer);
                }

                document.removeEventListener('pointermove', onPreMove);
                document.removeEventListener('pointerup', onPreUp);
                document.removeEventListener('pointercancel', onPreUp);
            };

            const onPreMove = (pe: PointerEvent) => {
                if (done) {
                    return;
                }

                const dist = Math.hypot(
                    pe.clientX - startX,
                    pe.clientY - startY,
                );

                if (dist > DRAG_THRESHOLD) {
                    cancel();

                    if (!isTouch) {
                        // Mouse crossed movement threshold — begin drag
                        startDrag(moduleId);
                    }
                    // Touch moved before long press — cancel silently (don't drag)
                }
            };

            const onPreUp = () => cancel();

            if (isTouch) {
                timer = window.setTimeout(() => {
                    if (!done) {
                        cancel();
                        startDrag(moduleId);
                    }
                }, LONG_PRESS_MS);
            }

            // Passive listener so scroll works normally until drag is confirmed
            document.addEventListener('pointermove', onPreMove, {
                passive: true,
            });
            document.addEventListener('pointerup', onPreUp);
            document.addEventListener('pointercancel', onPreUp);

            // Prevent text selection on mouse drag
            if (!isTouch) {
                e.preventDefault();
            }
        },
        [storageKey, startDrag],
    );

    const handleClick = React.useCallback(
        (e: React.MouseEvent) => {
            if (justDraggedRef.current || isReordering) {
                e.preventDefault();
            }
        },
        [isReordering],
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
              ? 'size-10 sm:size-11'
              : 'size-8 sm:size-9';

    const canReorder = Boolean(storageKey);

    return (
        <div className={cn('w-full', className)}>
            {isReordering && (
                <p className="mb-4 text-center text-[12px] font-medium text-muted-foreground">
                    Drag apps to reorder
                </p>
            )}

            <div
                className={cn(
                    'grid w-full max-w-lg grid-cols-3 justify-items-center gap-x-3 gap-y-8 px-1',
                    'sm:max-w-2xl sm:gap-x-6 sm:gap-y-10 sm:px-0',
                    'md:max-w-4xl md:grid-cols-4 md:gap-x-10 md:gap-y-14',
                    'lg:max-w-5xl lg:grid-cols-5',
                    isReordering && 'touch-none select-none',
                )}
            >
                {modules.map((module, index) => {
                    const isPinned = PINNED_TAIL_SET.has(module.id);
                    const isDragging = draggingId === module.id;
                    const isDraggable = canReorder && !isPinned;
                    const iconStyle = getModuleIconStyle(module.id);

                    return (
                        <Link
                            key={module.id}
                            href={module.href}
                            prefetch
                            data-dashboard-module={module.id}
                            onClick={handleClick}
                            onPointerDown={
                                isDraggable
                                    ? (e) => handleTilePointerDown(module.id, e)
                                    : undefined
                            }
                            className={cn(
                                'group flex min-w-[88px] touch-manipulation flex-col items-center gap-2.5 outline-none sm:gap-3',
                                !animateTiles && 'opacity-0',
                                animateTiles &&
                                    !prefersReducedMotion() &&
                                    'motion-safe:animate-in motion-safe:duration-300 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-bottom-4',
                                isReordering &&
                                    isDraggable &&
                                    !isDragging &&
                                    !prefersReducedMotion() &&
                                    'motion-safe:animate-[tile-wiggle_0.28s_ease-in-out_infinite]',
                                isDragging && 'z-50 scale-105 opacity-95',
                            )}
                            style={
                                animateTiles && !prefersReducedMotion()
                                    ? { animationDelay: `${index * 50}ms` }
                                    : undefined
                            }
                        >
                            <div className="relative">
                                <div
                                    className={cn(
                                        'flex items-center justify-center',
                                        'relative isolate overflow-hidden',
                                        tileSizeClass,
                                        'rounded-3xl',
                                        'transition-all duration-200 ease-out',
                                        !isReordering &&
                                            'group-hover:-translate-y-0.5 group-hover:scale-[1.10]',
                                        !isReordering &&
                                            'group-hover:shadow-2xl',
                                        !isReordering &&
                                            'group-active:scale-95',
                                        'group-focus-visible:ring-4 group-focus-visible:ring-ring/30',
                                        isDragging &&
                                            'shadow-2xl ring-2 ring-primary/40',
                                    )}
                                    style={{
                                        background: `${iconStyle.bg}, var(--dashboard-tile-surface)`,
                                        backdropFilter:
                                            'blur(16px) saturate(1.3)',
                                        WebkitBackdropFilter:
                                            'blur(16px) saturate(1.3)',
                                        border: '1px solid var(--dashboard-tile-border)',
                                        boxShadow:
                                            'var(--dashboard-tile-shadow)',
                                    }}
                                >
                                    <span
                                        className="pointer-events-none absolute top-0 left-0 z-1 h-[55%] w-[65%] dark:hidden"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.12) 60%, transparent 100%)',
                                            borderRadius: '22px 22px 60% 0',
                                        }}
                                    />
                                    <span
                                        className="pointer-events-none absolute top-0 left-0 z-1 hidden h-[55%] w-[65%] dark:block"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
                                            borderRadius: '22px 22px 60% 0',
                                        }}
                                    />
                                    <span className="pointer-events-none absolute -inset-px z-3 rounded-3xl border border-transparent transition-all duration-200 group-hover:border-border dark:group-hover:border-white/30" />
                                    <module.icon
                                        className={cn(
                                            'relative z-2 stroke-2 drop-shadow-[0_1px_2px_oklch(0_0_0/0.12)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]',
                                            iconClass,
                                        )}
                                        style={{
                                            color: iconStyle.icon,
                                        }}
                                    />
                                </div>

                                {module.badge != null &&
                                    Number(module.badge) > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-destructive px-1.5 text-[11px] font-black text-destructive-foreground shadow-lg">
                                            {Number(module.badge)}
                                        </span>
                                    )}
                            </div>

                            <span className="text-center text-[12px] font-bold tracking-wide text-foreground/90 transition-colors group-hover:text-foreground sm:text-[13px]">
                                {module.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
