import { createInertiaApp, router } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { AppLaunchOverlay } from '@/components/app-launch-overlay';
import { PwaThemeMeta } from '@/components/pwa-theme-meta';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { registerServiceWorker } from '@/lib/register-service-worker';

function redirectToHttpsIfNeeded(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.location.protocol !== 'http:') {
        return;
    }

    window.location.replace(window.location.href.replace(/^http:/, 'https:'));
}

function shouldEnableEcho(): boolean {
    if (!import.meta.env.VITE_REVERB_APP_KEY) {
        return false;
    }

    if (typeof window === 'undefined') {
        return true;
    }

    const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';

    // Browsers block ws:// Reverb connections from https:// pages (mixed content).
    if (window.location.protocol === 'https:' && reverbScheme === 'http') {
        return false;
    }

    return true;
}

function readInitialAppName(): string {
    const fallback = import.meta.env.VITE_APP_NAME || 'Laravel';
    const root = document.getElementById('app');

    if (!root?.dataset.page) {
        return fallback;
    }

    try {
        const page = JSON.parse(root.dataset.page) as { props?: { name?: unknown } };

        if (typeof page.props?.name === 'string' && page.props.name.length > 0) {
            return page.props.name;
        }
    } catch {
        return fallback;
    }

    return fallback;
}

function syncAppNameFromPage(page: { props?: { name?: unknown } }): void {
    if (typeof page.props?.name === 'string' && page.props.name.length > 0) {
        resolvedAppName = page.props.name;
    }
}

redirectToHttpsIfNeeded();

if (shouldEnableEcho()) {
    configureEcho({
        broadcaster: 'reverb',
    });
}

let resolvedAppName = readInitialAppName();

router.on('navigate', (event) => {
    syncAppNameFromPage(event.detail.page);
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${resolvedAppName}` : resolvedAppName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <PwaThemeMeta />
                <AppLaunchOverlay />
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        void registerServiceWorker();
    });
}
