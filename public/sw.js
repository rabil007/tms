self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const payload = event.data.json();
    const title = payload.title ?? 'Overseas';
    const actionUrl = payload.data?.url ?? payload.actions?.[0]?.action ?? '/dashboard';
    const iconUrl = new URL('/logo.png', self.location.origin).toString();
    const options = {
        body: payload.body ?? '',
        icon: iconUrl,
        badge: iconUrl,
        data: {
            url: actionUrl,
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url;

    if (!targetUrl) {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }

            return undefined;
        }),
    );
});
