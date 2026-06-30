import * as React from 'react';

type Props = React.ComponentProps<'main'>;

export function AppContent({ children, ...props }: Props) {
    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8"
            {...props}
        >
            {children}
        </main>
    );
}
