import React from 'react';
import { isIosDevice, isStandalonePwa, PWA_INSTALL_DISMISSED_KEY } from '@/lib/pwa';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type PwaInstallPlatform = 'ios' | 'android' | null;

export type UsePwaInstallReturn = {
    platform: PwaInstallPlatform;
    canInstall: boolean;
    dismiss: () => void;
    promptInstall: () => Promise<void>;
};

function readDismissed(): boolean {
    return localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === '1';
}

function getInitialPwaInstall(): { platform: PwaInstallPlatform; canInstall: boolean } {
    if (typeof window === 'undefined' || isStandalonePwa() || readDismissed()) {
        return { platform: null, canInstall: false };
    }

    if (isIosDevice()) {
        return { platform: 'ios', canInstall: true };
    }

    return { platform: null, canInstall: false };
}

export function usePwaInstall(): UsePwaInstallReturn {
    const [platform, setPlatform] = React.useState<PwaInstallPlatform>(
        () => getInitialPwaInstall().platform,
    );
    const [canInstall, setCanInstall] = React.useState(
        () => getInitialPwaInstall().canInstall,
    );
    const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);

    React.useEffect(() => {
        if (isStandalonePwa() || readDismissed() || isIosDevice()) {
            return;
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            deferredPromptRef.current = event as BeforeInstallPromptEvent;
            setPlatform('android');
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const dismiss = React.useCallback(() => {
        localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1');
        setCanInstall(false);
        deferredPromptRef.current = null;
    }, []);

    const promptInstall = React.useCallback(async () => {
        const deferredPrompt = deferredPromptRef.current;

        if (!deferredPrompt) {
            return;
        }

        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        deferredPromptRef.current = null;

        if (choice.outcome === 'accepted') {
            setCanInstall(false);
        }
    }, []);

    return {
        platform,
        canInstall,
        dismiss,
        promptInstall,
    };
}
