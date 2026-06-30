import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export type ViewMode = 'list' | 'grid';

function isViewMode(value: string | null): value is ViewMode {
    return value === 'list' || value === 'grid';
}

function readStoredPreference(storageKey: string): ViewMode | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = window.localStorage.getItem(storageKey);

    return isViewMode(stored) ? stored : null;
}

export type UseIndexViewModeOptions = {
    storageKey: string;
};

export function useIndexViewMode({ storageKey }: UseIndexViewModeOptions) {
    const isMobile = useIsMobile();
    const [preference, setPreference] = React.useState<ViewMode | null>(() => readStoredPreference(storageKey));

    const viewMode: ViewMode = preference ?? (isMobile ? 'grid' : 'list');

    const setViewMode = React.useCallback(
        (mode: ViewMode) => {
            setPreference(mode);
            window.localStorage.setItem(storageKey, mode);
        },
        [storageKey],
    );

    return {
        viewMode,
        setViewMode,
        isUsingDefault: preference === null,
    };
}
