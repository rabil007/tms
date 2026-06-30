import { router } from '@inertiajs/react';
import React from 'react';
import { pushDebugLog } from '@/lib/push-debug-log';

const PUSH_ROUTES = {
    store: '/push-subscriptions',
    destroy: '/push-subscriptions',
} as const;

export type PushSupportStatus = 'supported' | 'requires_https' | 'unsupported';

export function getPushSupportStatus(): PushSupportStatus {
    if (typeof window === 'undefined') {
        return 'unsupported';
    }

    if (!window.isSecureContext) {
        return 'requires_https';
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        return 'unsupported';
    }

    return 'supported';
}

function resolvePushError(caught: unknown): string {
    const message = (caught instanceof Error ? caught.message : String(caught)).toLowerCase();

    if (
        message.includes('ssl')
        || message.includes('certificate')
        || message.includes('securityerror')
        || message.includes('failed to register')
    ) {
        return 'Push requires a trusted HTTPS certificate. Run `herd secure tms`, trust the Herd root CA in macOS Keychain Access, then reload this page.';
    }

    return 'Unable to enable push notifications.';
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    const existing = await navigator.serviceWorker.getRegistration('/sw.js');

    if (existing) {
        return existing;
    }

    return navigator.serviceWorker.register('/sw.js');
}

export function usePushNotifications(
    vapidPublicKey: string | null | undefined,
    initialEnabled = false,
) {
    const [enabled, setEnabled] = React.useState(initialEnabled);
    const [processing, setProcessing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [setupError, setSetupError] = React.useState<string | null>(null);
    const [status] = React.useState<PushSupportStatus | null>(() =>
        typeof window === 'undefined' ? null : getPushSupportStatus(),
    );

    React.useEffect(() => {
        if (status !== 'supported') {
            return;
        }

        let cancelled = false;

        void (async () => {
            try {
                const registration = await getServiceWorkerRegistration();
                await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                if (!cancelled) {
                    // #region agent log
                    pushDebugLog({
                        hypothesisId: 'A',
                        location: 'use-push-notifications.ts:subscription-check',
                        message: 'Checked existing browser push subscription',
                        data: {
                            has_subscription: subscription !== null,
                            permission: Notification.permission,
                            endpoint_prefix: subscription?.endpoint?.slice(0, 80) ?? null,
                        },
                    });
                    // #endregion

                    setEnabled(subscription !== null);
                    setSetupError(null);
                }
            } catch (caught) {
                if (!cancelled) {
                    setEnabled(false);
                    setSetupError(resolvePushError(caught));
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [status]);

    const enable = React.useCallback(async () => {
        if (!vapidPublicKey) {
            setError('Push notifications are not configured on the server.');

            return false;
        }

        if (setupError) {
            setError(setupError);

            return false;
        }

        const resolvedStatus = status ?? getPushSupportStatus();

        if (resolvedStatus === 'requires_https') {
            setError('Open this site over HTTPS to enable browser notifications.');

            return false;
        }

        if (resolvedStatus === 'unsupported') {
            setError('Push notifications are not supported in this browser.');

            return false;
        }

        setProcessing(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                setError('Notification permission was denied.');

                return false;
            }

            const registration = await getServiceWorkerRegistration();
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            });

            const json = subscription.toJSON();

            const contentEncoding =
                PushManager.supportedContentEncodings?.[0] ?? 'aes128gcm';

            // #region agent log
            pushDebugLog({
                hypothesisId: 'A',
                location: 'use-push-notifications.ts:enable',
                message: 'Browser subscribed to push manager',
                data: {
                    permission,
                    content_encoding: contentEncoding,
                    supported_encodings: PushManager.supportedContentEncodings ?? [],
                    endpoint_prefix: json.endpoint?.slice(0, 80) ?? null,
                },
            });
            // #endregion

            await new Promise<void>((resolve, reject) => {
                router.post(
                    PUSH_ROUTES.store,
                    {
                        endpoint: json.endpoint,
                        keys: json.keys,
                        contentEncoding,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            // #region agent log
                            pushDebugLog({
                                hypothesisId: 'A',
                                location: 'use-push-notifications.ts:store-success',
                                message: 'Push subscription saved on server',
                                data: { content_encoding: contentEncoding },
                            });
                            // #endregion

                            resolve();
                        },
                        onError: () => reject(new Error('Failed to save push subscription.')),
                    },
                );
            });

            setEnabled(true);
            setSetupError(null);

            return true;
        } catch (caught) {
            const message = resolvePushError(caught);

            // #region agent log
            pushDebugLog({
                hypothesisId: 'E',
                location: 'use-push-notifications.ts:enable-error',
                message: 'Failed to enable push notifications',
                data: { error: message },
            });
            // #endregion

            setError(message);
            setSetupError(message);

            return false;
        } finally {
            setProcessing(false);
        }
    }, [setupError, status, vapidPublicKey]);

    const disable = React.useCallback(async () => {
        if (status !== 'supported') {
            return false;
        }

        setProcessing(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.getRegistration('/sw.js');

            if (!registration) {
                setEnabled(false);

                return true;
            }

            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const endpoint = subscription.endpoint;

                await new Promise<void>((resolve, reject) => {
                    router.delete(
                        PUSH_ROUTES.destroy,
                        {
                            data: { endpoint },
                            preserveScroll: true,
                            onSuccess: () => resolve(),
                            onError: () => reject(new Error('Failed to remove push subscription.')),
                        },
                    );
                });

                await subscription.unsubscribe();
            }

            setEnabled(false);

            return true;
        } catch (caught) {
            setError(resolvePushError(caught));

            return false;
        } finally {
            setProcessing(false);
        }
    }, [status]);

    return {
        status,
        supported: status === 'supported',
        ready: status !== null,
        enabled,
        processing,
        error,
        setupError,
        enable,
        disable,
    };
}
