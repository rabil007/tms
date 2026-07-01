import { Head, router } from '@inertiajs/react';
import { BellRing, Smartphone } from 'lucide-react';
import React from 'react';
import Heading from '@/components/heading';
import PushSubscriptionItem from '@/components/push-subscription-item';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import type { PushSubscriptionItem as PushSubscription } from '@/types/notifications';

const TEST_NOTIFICATION_ROUTE = '/notifications/test';

export default function NotificationsSettings({
    vapidPublicKey,
    pushEnabled,
    pushSubscriptions,
}: {
    vapidPublicKey: string | null;
    pushEnabled: boolean;
    pushSubscriptions: PushSubscription[];
}) {
    const {
        status,
        supported,
        ready,
        enabled,
        currentEndpoint,
        processing,
        error,
        setupError,
        enable,
        disable,
    } = usePushNotifications(vapidPublicKey, pushEnabled);

    const httpsUrl =
        typeof window !== 'undefined'
            ? `${window.location.protocol === 'https:' ? window.location.origin : window.location.origin.replace('http:', 'https:')}/settings/notifications`
            : null;

    const isPushEnabled = enabled || pushEnabled;
    const [sendingTest, setSendingTest] = React.useState(false);

    const handlePushToggle = async () => {
        if (isPushEnabled) {
            await disable();
        } else {
            await enable();
        }
    };

    const sendTestNotification = () => {
        setSendingTest(true);

        router.post(
            TEST_NOTIFICATION_ROUTE,
            {},
            {
                preserveScroll: true,
                onFinish: () => setSendingTest(false),
            },
        );
    };

    return (
        <>
            <Head title="Notification settings" />

            <h1 className="sr-only">Notification settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Browser notifications"
                    description="Receive OS-level alerts when schedules are created or updated, even when this tab is in the background."
                />

                <div className="rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6">
                    {!ready ? (
                        <p className="text-sm text-muted-foreground">
                            Checking browser support…
                        </p>
                    ) : status === 'requires_https' ? (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                HTTPS required
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Browser push only works on a secure connection.
                                You are currently on HTTP.
                            </p>
                            {httpsUrl && (
                                <a
                                    href={httpsUrl}
                                    className="inline-flex text-sm font-medium text-primary hover:underline"
                                >
                                    Open {httpsUrl}
                                </a>
                            )}
                        </div>
                    ) : status === 'requires_pwa' ? (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                Add to Home Screen (iPhone/iPad)
                            </p>
                            <p className="text-sm text-muted-foreground">
                                iOS only shows web push alerts for installed
                                apps. In Safari, tap Share → Add to Home Screen,
                                open the app from your home screen, then enable
                                notifications here.
                            </p>
                        </div>
                    ) : !supported ? (
                        <p className="text-sm text-muted-foreground">
                            Push notifications are not supported in this
                            browser.
                        </p>
                    ) : !vapidPublicKey ? (
                        <p className="text-sm text-muted-foreground">
                            Push notifications are not configured yet. Add VAPID
                            keys to the server environment.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {isPushEnabled
                                        ? 'Browser notifications enabled'
                                        : 'Browser notifications disabled'}
                                </p>
                                <p className="mt-1 text-[13px] text-muted-foreground">
                                    {isPushEnabled
                                        ? 'You will receive push alerts for in-app notifications.'
                                        : 'Enable to get instant alerts outside the app.'}
                                </p>
                                {(setupError || error) && (
                                    <p className="mt-2 text-[13px] text-destructive">
                                        {setupError ?? error}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant={isPushEnabled ? 'outline' : 'default'}
                                className="h-11 rounded-xl px-6"
                                disabled={processing || !!setupError}
                                onClick={handlePushToggle}
                            >
                                {processing
                                    ? 'Saving…'
                                    : isPushEnabled
                                      ? 'Disable notifications'
                                      : 'Enable notifications'}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Heading
                        variant="small"
                        title="Linked devices"
                        description="Browsers and devices registered to receive push alerts for your account."
                    />

                    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
                        {pushSubscriptions.length > 0 ? (
                            pushSubscriptions.map((subscription) => (
                                <PushSubscriptionItem
                                    key={subscription.id}
                                    subscription={subscription}
                                    isCurrentDevice={
                                        currentEndpoint !== null &&
                                        subscription.endpoint === currentEndpoint
                                    }
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                    <Smartphone className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="font-medium">No linked devices yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Enable notifications on this browser to
                                    register a device.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Send test notification
                            </p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                Sends a test alert to your bell
                                {isPushEnabled
                                    ? ' and browser push on all linked devices'
                                    : ''}
                                . Use per-device test buttons above to target a
                                single device.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-xl px-6"
                            disabled={sendingTest}
                            onClick={sendTestNotification}
                        >
                            <BellRing className="size-4" />
                            {sendingTest ? 'Sending…' : 'Send test'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
