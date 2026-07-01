import { Link } from '@inertiajs/react';
import { BellRing, LayoutGrid, Smartphone, X } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { isStandalonePwa, PWA_INSTALL_DISMISSED_KEY } from '@/lib/pwa';

const TIP_KEYS = {
    install: 'onboarding:install-dismissed',
    push: 'onboarding:push-dismissed',
    layout: 'onboarding:layout-dismissed',
} as const;

function readDismissed(key: string): boolean {
    return localStorage.getItem(key) === '1';
}

function readInitialDismissed(): Record<keyof typeof TIP_KEYS, boolean> {
    return {
        install:
            readDismissed(TIP_KEYS.install) ||
            isStandalonePwa() ||
            readDismissed(PWA_INSTALL_DISMISSED_KEY),
        push: readDismissed(TIP_KEYS.push),
        layout: readDismissed(TIP_KEYS.layout),
    };
}

export function AppOnboardingTips() {
    const isMobile = useIsMobile();
    const [dismissed, setDismissed] = React.useState(readInitialDismissed);

    const dismiss = (key: keyof typeof TIP_KEYS) => {
        localStorage.setItem(TIP_KEYS[key], '1');
        setDismissed((current) => ({ ...current, [key]: true }));
    };

    const tips: Array<{
        key: keyof typeof TIP_KEYS;
        icon: typeof Smartphone;
        title: string;
        description: string;
        href?: string;
    }> = [];

    if (!dismissed.install) {
        tips.push({
            key: 'install',
            icon: Smartphone,
            title: 'Install on your home screen',
            description: 'Open in full screen like a native app for faster access.',
        });
    }

    if (!dismissed.push) {
        tips.push({
            key: 'push',
            icon: BellRing,
            title: 'Enable push notifications',
            description: 'Get schedule alerts even when the app is in the background.',
            href: '/settings/notifications',
        });
    }

    if (!dismissed.layout) {
        tips.push({
            key: 'layout',
            icon: LayoutGrid,
            title: 'Customize your dashboard',
            description: isMobile
                ? 'Press and hold an app, then drag it to a new spot.'
                : 'Press and drag apps to reorder them.',
        });
    }

    if (tips.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 space-y-3">
            {tips.map((tip) => (
                <GlassCard key={tip.key} level="inner" className="flex items-start gap-3 px-4 py-3.5">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <tip.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{tip.description}</p>
                        {tip.href && (
                            <Link href={tip.href} className="mt-2 inline-flex text-[13px] font-medium text-primary hover:underline">
                                Open notification settings
                            </Link>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-lg"
                        aria-label="Dismiss tip"
                        onClick={() => dismiss(tip.key)}
                    >
                        <X className="size-4" />
                    </Button>
                </GlassCard>
            ))}
        </div>
    );
}
