self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const payload = event.data.json();
    const title = payload.title ?? 'Overseas';
    const options = {
        body: payload.body ?? '',
        icon: '/logo.png',
        badge: '/logo.png',
        data: {
            url: payload.data?.url ?? payload.action ?? '/dashboard',
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
