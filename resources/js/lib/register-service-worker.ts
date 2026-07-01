export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !window.isSecureContext
    ) {
        return null;
    }

    try {
        const existing = await navigator.serviceWorker.getRegistration('/');

        if (existing) {
            return existing;
        }

        return navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch {
        return null;
    }
}
