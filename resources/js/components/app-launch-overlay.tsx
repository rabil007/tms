import React from 'react';
import AppLogoImage from '@/components/app-logo-icon';
import {
    dispatchAppLaunchComplete,
    hasAppLaunchedThisSession,
    markAppLaunchedThisSession,
    prefersReducedMotion,
} from '@/lib/pwa';
import { cn } from '@/lib/utils';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type LaunchPhase = 'enter' | 'logo' | 'name' | 'exit' | 'done';

export function AppLaunchOverlay() {
    const [visible, setVisible] = React.useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return !hasAppLaunchedThisSession() && !prefersReducedMotion();
    });
    const [phase, setPhase] = React.useState<LaunchPhase>('enter');

    React.useEffect(() => {
        if (!hasAppLaunchedThisSession() && prefersReducedMotion()) {
            markAppLaunchedThisSession();
            dispatchAppLaunchComplete();
        }
    }, []);

    React.useEffect(() => {
        if (!visible) {
            return;
        }

        const raf = window.requestAnimationFrame(() => setPhase('logo'));

        const timers = [
            window.setTimeout(() => setPhase('name'), 200),
            window.setTimeout(() => setPhase('exit'), 500),
            window.setTimeout(() => {
                markAppLaunchedThisSession();
                dispatchAppLaunchComplete();
                setPhase('done');
                setVisible(false);
            }, 700),
        ];

        return () => {
            window.cancelAnimationFrame(raf);
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed inset-0 z-100 flex flex-col items-center justify-center bg-background',
                'transition-opacity duration-200 ease-out',
                phase === 'exit'
                    ? 'pointer-events-none opacity-0'
                    : 'opacity-100',
            )}
            aria-hidden={phase === 'exit'}
            aria-live="polite"
        >
            <div
                className={cn(
                    'flex flex-col items-center gap-4 transition-all duration-300 ease-out',
                    phase === 'enter'
                        ? 'scale-90 opacity-100'
                        : 'scale-100 opacity-100',
                )}
            >
                <AppLogoImage className="h-16 w-auto sm:h-20" />
                <p
                    className={cn(
                        'text-lg font-semibold tracking-tight text-foreground transition-opacity duration-300',
                        phase === 'name' || phase === 'exit'
                            ? 'opacity-100'
                            : 'opacity-0',
                    )}
                >
                    {appName}
                </p>
            </div>
        </div>
    );
}
