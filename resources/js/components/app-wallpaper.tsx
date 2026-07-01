import React from 'react';

const LIGHT_MOBILE_GRADIENT =
    'radial-gradient(ellipse 80% 60% at 20% 15%, rgba(14,165,233,0.16) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(139,92,246,0.14) 0%, transparent 50%)';

const LIGHT_DESKTOP_GRADIENT = `
      radial-gradient(ellipse 80% 60% at 15% 20%, rgba(14,165,233,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 80% 10%, rgba(139,92,246,0.20) 0%, transparent 50%),
      radial-gradient(ellipse 70% 55% at 70% 80%, rgba(16,185,129,0.16) 0%, transparent 50%),
      radial-gradient(ellipse 50% 45% at 20% 85%, rgba(59,130,246,0.18) 0%, transparent 50%),
      radial-gradient(ellipse 40% 35% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 60%)
    `;

const DARK_MOBILE_GRADIENT =
    'radial-gradient(ellipse 80% 60% at 20% 15%, rgba(14,165,233,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(139,92,246,0.18) 0%, transparent 50%)';

const DARK_DESKTOP_GRADIENT = `
      radial-gradient(ellipse 80% 60% at 15% 20%, rgba(14,165,233,0.45) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 80% 10%, rgba(139,92,246,0.40) 0%, transparent 50%),
      radial-gradient(ellipse 70% 55% at 70% 80%, rgba(16,185,129,0.30) 0%, transparent 50%),
      radial-gradient(ellipse 50% 45% at 20% 85%, rgba(59,130,246,0.35) 0%, transparent 50%),
      radial-gradient(ellipse 40% 35% at 50% 50%, rgba(99,102,241,0.20) 0%, transparent 60%)
    `;

const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function AppWallpaper() {
    return (
        <>
            <div className="absolute inset-0 [background:var(--dashboard-background)]" />

            {/* Mobile gradients */}
            <div
                className="absolute inset-0 md:hidden dark:hidden"
                style={{ background: LIGHT_MOBILE_GRADIENT }}
            />
            <div
                className="absolute inset-0 hidden dark:block md:hidden"
                style={{ background: DARK_MOBILE_GRADIENT }}
            />

            {/* Desktop gradients */}
            <div
                className="absolute inset-0 hidden md:block dark:md:hidden"
                style={{ background: LIGHT_DESKTOP_GRADIENT }}
            />
            <div
                className="absolute inset-0 hidden dark:md:block"
                style={{ background: DARK_DESKTOP_GRADIENT }}
            />

            {/* Light overlay — soft wash to keep text readable */}
            <div className="pointer-events-none absolute inset-0 hidden [background:color-mix(in_oklch,var(--dashboard-overlay),transparent_55%)] md:block dark:md:hidden" />

            {/* Dark overlay */}
            <div
                className="pointer-events-none absolute inset-0 hidden [background:color-mix(in_oklch,var(--dashboard-overlay),transparent_70%)] dark:md:block"
                style={{ mixBlendMode: 'multiply' }}
            />

            {/* Noise texture */}
            <div
                className="absolute inset-0 hidden opacity-[0.025] md:block dark:md:hidden"
                style={{
                    backgroundImage: NOISE_TEXTURE,
                    backgroundSize: '180px 180px',
                }}
            />
            <div
                className="absolute inset-0 hidden opacity-[0.045] dark:md:block"
                style={{
                    backgroundImage: NOISE_TEXTURE,
                    backgroundSize: '180px 180px',
                }}
            />

            {/* Shimmer */}
            <div
                className="pointer-events-none absolute inset-0 hidden motion-safe:animate-[shimmer_10s_ease-in-out_infinite] md:block dark:md:hidden"
                style={{
                    background:
                        'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)',
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 hidden motion-safe:animate-[shimmer_10s_ease-in-out_infinite] dark:md:block"
                style={{
                    background:
                        'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.025) 50%, transparent 60%)',
                }}
            />
        </>
    );
}
