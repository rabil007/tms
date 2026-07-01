import { router } from '@inertiajs/react';
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { prefersReducedMotion } from '@/lib/pwa';

const PULL_THRESHOLD = 80;

type UsePullToRefreshOptions = {
    only: string[];
    enabled?: boolean;
};

export function usePullToRefresh({ only, enabled = true }: UsePullToRefreshOptions) {
    const isMobile = useIsMobile();
    const [pullDistance, setPullDistance] = React.useState(0);
    const [refreshing, setRefreshing] = React.useState(false);
    const startYRef = React.useRef<number | null>(null);
    const pullingRef = React.useRef(false);

    const onTouchStart = React.useCallback(
        (event: React.TouchEvent<HTMLElement>) => {
            if (!enabled || !isMobile || prefersReducedMotion() || refreshing) {
                return;
            }

            if (window.scrollY > 0) {
                return;
            }

            startYRef.current = event.touches[0]?.clientY ?? null;
            pullingRef.current = true;
        },
        [enabled, isMobile, refreshing],
    );

    const onTouchMove = React.useCallback(
        (event: React.TouchEvent<HTMLElement>) => {
            if (!pullingRef.current || startYRef.current === null) {
                return;
            }

            const currentY = event.touches[0]?.clientY ?? startYRef.current;
            const distance = Math.max(0, Math.min(PULL_THRESHOLD * 1.5, currentY - startYRef.current));

            if (distance > 0 && window.scrollY === 0) {
                setPullDistance(distance);
            }
        },
        [],
    );

    const onTouchEnd = React.useCallback(() => {
        if (!pullingRef.current) {
            return;
        }

        pullingRef.current = false;
        startYRef.current = null;

        if (pullDistance >= PULL_THRESHOLD && !refreshing) {
            setRefreshing(true);
            router.reload({
                only,
                onFinish: () => {
                    setRefreshing(false);
                    setPullDistance(0);
                },
            });

            return;
        }

        setPullDistance(0);
    }, [only, pullDistance, refreshing]);

    return {
        pullDistance,
        refreshing,
        isActive: enabled && isMobile && !prefersReducedMotion(),
        handlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
        },
    };
}
