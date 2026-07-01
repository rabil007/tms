import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { cn } from '@/lib/utils';

export function PwaInstallBanner() {
    const isMobile = useIsMobile();
    const { platform, canInstall, dismiss, promptInstall } = usePwaInstall();

    if (!isMobile || !canInstall || !platform) {
        return null;
    }

    return (
        <div
            className={cn(
                'border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl',
                'motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:slide-in-from-top-2',
            )}
        >
            <div className="mx-auto flex max-w-7xl items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    {platform === 'ios' ? (
                        <Share className="size-4" />
                    ) : (
                        <Download className="size-4" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                        Install this app
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                        {platform === 'ios'
                            ? 'Tap Share, then Add to Home Screen for a full-screen app experience.'
                            : 'Add to your home screen for faster access and a native app feel.'}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {platform === 'android' && (
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 rounded-lg px-3 text-xs"
                            onClick={() => void promptInstall()}
                        >
                            Install
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg"
                        aria-label="Dismiss install banner"
                        onClick={dismiss}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
