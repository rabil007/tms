import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AppNotification, SharedNotifications } from '@/types/notifications';

const ROUTES = {
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
} as const;

type PageProps = {
    notifications: SharedNotifications | null;
};

export function NotificationBell() {
    const { notifications } = usePage<PageProps>().props;
    const unreadCount = notifications?.unread_count ?? 0;
    const items = notifications?.items ?? [];

    const markAsRead = React.useCallback((notification: AppNotification) => {
        if (notification.read_at) {
            return;
        }

        router.post(ROUTES.read(notification.id), {}, { preserveScroll: true });
    }, []);

    const handleNotificationClick = React.useCallback(
        (notification: AppNotification) => {
            markAsRead(notification);

            if (notification.action_url) {
                router.visit(notification.action_url);
            }
        },
        [markAsRead],
    );

    const markAllAsRead = React.useCallback(() => {
        if (unreadCount === 0) {
            return;
        }

        router.post(ROUTES.readAll, {}, { preserveScroll: true });
    }, [unreadCount]);

    if (!notifications) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-11 rounded-full"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                    <Bell className="size-5 text-foreground/80" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground ring-2 ring-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(100vw-2rem,24rem)] p-0">
                <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[12px] font-medium text-primary hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <Bell className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-foreground">No notifications</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">You&apos;re all caught up.</p>
                    </div>
                ) : (
                    <div className="max-h-[min(24rem,60vh)] overflow-y-auto py-1">
                        {items.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    'cursor-pointer items-start gap-3 rounded-none px-4 py-3 focus:bg-accent/60',
                                    !notification.read_at && 'bg-primary/5',
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p
                                            className={cn(
                                                'text-[13px] leading-snug text-foreground',
                                                !notification.read_at && 'font-semibold',
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        {!notification.read_at && (
                                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                                        {notification.created_at_diff}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {items.length > 0 && <DropdownMenuSeparator className="m-0" />}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
