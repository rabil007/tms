import { useAppearance } from '@/hooks/use-appearance';
import { PWA_THEME_COLORS, setThemeColorMeta } from '@/lib/pwa';
import React from 'react';

export function PwaThemeMeta() {
    const { resolvedAppearance } = useAppearance();

    React.useEffect(() => {
        setThemeColorMeta(PWA_THEME_COLORS[resolvedAppearance]);
    }, [resolvedAppearance]);

    return null;
}
