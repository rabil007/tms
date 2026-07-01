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

const LONG_PRESS_MS = 420;
const DRAG_START_THRESHOLD = 10;

export function glassColor(gradientClass: string): {
    bg: string;
    icon: string;
} {
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

const PINNED_TAIL_ORDER = ['projects', 'countries', 'settings'] as const;
const PINNED_TAIL_SET = new Set<string>(PINNED_TAIL_ORDER);

function enforceModuleOrder(
    base: DashboardModule[],
    order: string[] | null,
): DashboardModule[] {
    const map = new Map(base.map((m) => [m.id, m] as const));
    const pinnedSet = PINNED_TAIL_SET;
    const pinned = PINNED_TAIL_ORDER.filter((id) => map.has(id)).map((id) =>
        map.get(id)!,
    );
    const unpinnedBase = base.filter((m) => !pinnedSet.has(m.id));

    if (!order || !Array.isArray(order) || order.length === 0) {
        return [...unpinnedBase, ...pinned];
    }

    const unpinnedIds = order.filter((id) => !pinnedSet.has(id) && map.has(id));
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

    const didDragRef = React.useRef(false);
    const longPressTimerRef = React.useRef<number | null>(null);
    const pointerStartRef = React.useRef({ x: 0, y: 0 });
    const lastOverIdRef = React.useRef<string | null>(null);
    const captureTargetRef = React.useRef<HTMLElement | null>(null);
    const activePointerIdRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (animateTiles) {
            return;
        }

        const handleLaunchComplete = () => {
            setAnimateTiles(true);
        };

        window.addEventListener(
            APP_LAUNCH_COMPLETE_EVENT,
            handleLaunchComplete,
        );

        return () => {
            window.removeEventListener(
                APP_LAUNCH_COMPLETE_EVENT,
                handleLaunchComplete,
            );
        };
    }, [animateTiles]);

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

    const move = React.useCallback(
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

                const next = current.slice();
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

    const clearLongPressTimer = React.useCallback(() => {
        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const endDrag = React.useCallback(() => {
        clearLongPressTimer();

        if (captureTargetRef.current && activePointerIdRef.current !== null) {
            try {
                captureTargetRef.current.releasePointerCapture(
                    activePointerIdRef.current,
                );
            } catch {
                void 0;
            }
        }

        captureTargetRef.current = null;
        activePointerIdRef.current = null;
        lastOverIdRef.current = null;
        setDraggingId(null);
        setIsReordering(false);
    }, [clearLongPressTimer]);

    const beginDrag = React.useCallback(
        (moduleId: string, target: HTMLElement, pointerId: number) => {
            clearLongPressTimer();
            didDragRef.current = false;
            lastOverIdRef.current = null;
            setDraggingId(moduleId);
            setIsReordering(true);
            captureTargetRef.current = target;
            activePointerIdRef.current = pointerId;

            try {
                target.setPointerCapture(pointerId);
            } catch {
                void 0;
            }

            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(12);
            }
        },
        [clearLongPressTimer],
    );

    const updateDropTarget = React.useCallback(
        (clientX: number, clientY: number, activeId: string) => {
            const overId = findModuleIdAtPoint(clientX, clientY);

            if (
                !overId ||
                overId === activeId ||
                overId === lastOverIdRef.current
            ) {
                return;
            }

            lastOverIdRef.current = overId;
            didDragRef.current = true;
            move(activeId, overId);
        },
        [move],
    );

    const handlePointerDown = React.useCallback(
        (moduleId: string, event: React.PointerEvent<HTMLElement>) => {
            if (!storageKey || PINNED_TAIL_SET.has(moduleId) || isReordering) {
                return;
            }

            pointerStartRef.current = { x: event.clientX, y: event.clientY };
            clearLongPressTimer();

            if (event.pointerType === 'mouse') {
                return;
            }

            longPressTimerRef.current = window.setTimeout(() => {
                beginDrag(moduleId, event.currentTarget, event.pointerId);
            }, LONG_PRESS_MS);
        },
        [beginDrag, clearLongPressTimer, isReordering, storageKey],
    );

    const handlePointerMove = React.useCallback(
        (moduleId: string, event: React.PointerEvent<HTMLElement>) => {
            const deltaX = event.clientX - pointerStartRef.current.x;
            const deltaY = event.clientY - pointerStartRef.current.y;
            const passedThreshold =
                Math.abs(deltaX) > DRAG_START_THRESHOLD ||
                Math.abs(deltaY) > DRAG_START_THRESHOLD;

            if (!draggingId) {
                if (longPressTimerRef.current && passedThreshold) {
                    clearLongPressTimer();
                }

                if (
                    event.pointerType === 'mouse' &&
                    passedThreshold &&
                    storageKey &&
                    !PINNED_TAIL_SET.has(moduleId)
                ) {
                    beginDrag(moduleId, event.currentTarget, event.pointerId);
                }

                return;
            }

            if (draggingId === moduleId) {
                event.preventDefault();
                updateDropTarget(event.clientX, event.clientY, draggingId);
            }
        },
        [
            beginDrag,
            clearLongPressTimer,
            draggingId,
            storageKey,
            updateDropTarget,
        ],
    );

    const handlePointerUp = React.useCallback(() => {
        const dragged = didDragRef.current;

        endDrag();

        if (dragged) {
            window.setTimeout(() => {
                didDragRef.current = false;
            }, 250);
        }
    }, [endDrag]);

    const handleClick = React.useCallback(
        (event: React.MouseEvent) => {
            if (didDragRef.current || isReordering) {
                event.preventDefault();
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
              ? 'size-9 sm:size-10'
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

                    return (
                        <Link
                            key={module.id}
                            href={module.href}
                            prefetch
                            data-dashboard-module={module.id}
                            onClick={handleClick}
                            onPointerDown={
                                isDraggable
                                    ? (event) =>
                                          handlePointerDown(module.id, event)
                                    : undefined
                            }
                            onPointerMove={
                                isDraggable
                                    ? (event) =>
                                          handlePointerMove(module.id, event)
                                    : undefined
                            }
                            onPointerUp={
                                isDraggable ? handlePointerUp : undefined
                            }
                            onPointerCancel={
                                isDraggable ? handlePointerUp : undefined
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
                                        background: glassColor(module.color).bg,
                                        backdropFilter:
                                            'blur(20px) saturate(1.4)',
                                        WebkitBackdropFilter:
                                            'blur(20px) saturate(1.4)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        boxShadow:
                                            '0 8px 32px rgba(0,0,0,0.25)',
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
                                        className={cn(
                                            'relative z-2 stroke-[1.4]',
                                            iconClass,
                                        )}
                                        style={{
                                            color: glassColor(module.color)
                                                .icon,
                                            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))',
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

                            <span className="text-center text-[12px] font-semibold tracking-wide text-muted-foreground transition-colors group-hover:text-foreground sm:text-[13px]">
                                {module.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
