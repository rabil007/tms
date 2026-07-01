function agentPushDebugLog(hypothesisId, location, message, data = {}) {
    const payload = {
        sessionId: '55a27f',
        runId: 'post-fix',
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
    };

    fetch('http://127.0.0.1:7922/ingest/b4e2405a-b303-40c5-8d94-3b564608dd1b', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '55a27f',
        },
        body: JSON.stringify(payload),
    }).catch(() => {});

    fetch('/internal/push-debug', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    }).catch(() => {});
}

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    const rawPayload = event.data ? event.data.text() : null;

    // #region agent log
    agentPushDebugLog('D', 'sw.js:push', 'Service worker received push event', {
        has_data: Boolean(rawPayload),
        data_text: rawPayload ? rawPayload.slice(0, 200) : null,
        origin: self.location.origin,
    });
    // #endregion

    if (!rawPayload) {
        // #region agent log
        agentPushDebugLog('D', 'sw.js:push-empty', 'Push event had no payload data', {});
        // #endregion

        return;
    }

    const payload = JSON.parse(rawPayload);
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

    event.waitUntil(
        self.registration.showNotification(title, options).then(() => {
            // #region agent log
            agentPushDebugLog('D', 'sw.js:showNotification', 'OS notification displayed', {
                title,
                body: options.body,
                icon: iconUrl,
            });
            // #endregion
        }).catch((error) => {
            // #region agent log
            agentPushDebugLog('D', 'sw.js:showNotification-error', 'Failed to display OS notification', {
                error: String(error),
            });
            // #endregion
        }),
    );
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
