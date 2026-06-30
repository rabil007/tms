import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { configureEcho } from '@laravel/echo-react';

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

redirectToHttpsIfNeeded();

if (shouldEnableEcho()) {
    configureEcho({
        broadcaster: 'reverb',
    });
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
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
