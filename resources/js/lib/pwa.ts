export const PWA_THEME_COLORS = {
    light: '#ffffff',
    dark: '#0f172a',
} as const;

export const APP_LAUNCHED_SESSION_KEY = 'app-launched';
export const APP_LAUNCH_COMPLETE_EVENT = 'app-launch-complete';
export const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';

export function isIosDevice(): boolean {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

export function isStandalonePwa(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasAppLaunchedThisSession(): boolean {
    return sessionStorage.getItem(APP_LAUNCHED_SESSION_KEY) === '1';
}

export function markAppLaunchedThisSession(): void {
    sessionStorage.setItem(APP_LAUNCHED_SESSION_KEY, '1');
}

export function dispatchAppLaunchComplete(): void {
    window.dispatchEvent(new CustomEvent(APP_LAUNCH_COMPLETE_EVENT));
}

export function setThemeColorMeta(color: string): void {
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', color);
}
