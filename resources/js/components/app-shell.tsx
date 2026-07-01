import type { ReactNode } from 'react';
import AppWallpaper from '@/components/app-wallpaper';

type Props = {
    children: ReactNode;
};

export function AppShell({ children }: Props) {
    return (
        <div className="relative flex min-h-dvh w-full flex-col overflow-hidden">
            <div className="pointer-events-none fixed inset-0 z-0">
                <AppWallpaper />
            </div>
            <div className="relative z-10 flex min-h-dvh w-full flex-col">
                {children}
            </div>
        </div>
    );
}
