import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <>
            <div className="sticky top-0 z-50 border-b border-border/60 bg-background/80 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                <div className="mx-auto flex h-14 items-center px-4 sm:h-16 sm:px-6 md:max-w-7xl">
                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex min-h-11 min-w-11 items-center space-x-2 rounded-lg active:opacity-80"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <NotificationBell />
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-11 rounded-full p-1"
                                >
                                    <Avatar className="size-9 overflow-hidden rounded-full sm:size-8">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                onCloseAutoFocus={(event) =>
                                    event.preventDefault()
                                }
                            >
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 border-b border-border/60 bg-background/80 backdrop-blur-2xl sm:top-[calc(4rem+env(safe-area-inset-top))] dark:border-white/10 dark:bg-white/5">
                    <div className="mx-auto flex h-11 w-full items-center justify-start overflow-x-auto px-4 text-muted-foreground sm:h-12 sm:px-6 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
