import { router, usePage } from '@inertiajs/react';
import { echoIsConfigured, useEchoNotification } from '@laravel/echo-react';
import { Bell } from 'lucide-react';
import React from 'react';
import { EmptyState } from '@/components/list/empty-state';
import { NotificationListSkeleton } from '@/components/loading/notification-list-skeleton';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types/auth';
import type { AppNotification, SharedNotifications } from '@/types/notifications';

const ROUTES = {
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
} as const;

type PageProps = {
    auth: Auth;
    notificationsUnreadCount: number;
    notifications: SharedNotifications | null | undefined;
};

export function NotificationBell() {
    const { auth, notificationsUnreadCount, notifications } = usePage<PageProps>().props;
    const isMobile = useIsMobile();
    const userId = auth.user?.id;
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState<AppNotification[]>(notifications?.items ?? []);
    const [unreadCount, setUnreadCount] = React.useState(notificationsUnreadCount);

    React.useEffect(() => {
        if (notifications?.items) {
            queueMicrotask(() => setItems(notifications.items));
        }
    }, [notifications?.items]);

    React.useEffect(() => {
        queueMicrotask(() => setUnreadCount(notificationsUnreadCount));
    }, [notificationsUnreadCount]);

    const markAsRead = React.useCallback((notification: AppNotification) => {
        if (notification.read_at) {
            return;
        }

        const previousItems = items;
        const previousCount = unreadCount;

        setItems((current) =>
            current.map((item) =>
                item.id === notification.id
                    ? { ...item, read_at: new Date().toISOString() }
                    : item,
            ),
        );
        setUnreadCount((current) => Math.max(0, current - 1));

        router.post(ROUTES.read(notification.id), {}, {
            preserveScroll: true,
            onError: () => {
                setItems(previousItems);
                setUnreadCount(previousCount);
            },
        });
    }, [items, unreadCount]);

    const handleNotificationClick = React.useCallback(
        (notification: AppNotification) => {
            setOpen(false);
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

        const previousItems = items;
        const previousCount = unreadCount;

        setOpen(false);
        setItems((current) =>
            current.map((item) => ({
                ...item,
                read_at: item.read_at ?? new Date().toISOString(),
            })),
        );
        setUnreadCount(0);

        router.post(ROUTES.readAll, {}, {
            preserveScroll: true,
            onError: () => {
                setItems(previousItems);
                setUnreadCount(previousCount);
            },
        });
    }, [items, unreadCount]);

    const handleOpenChange = React.useCallback((nextOpen: boolean) => {
        setOpen(nextOpen);

        if (nextOpen) {
            router.reload({ only: ['notifications', 'notificationsUnreadCount'] });
        }
    }, []);

    if (!userId) {
        return null;
    }

    const isLoading = open && notifications === undefined;
    const panelContent = (
        <NotificationPanelContent
            items={items}
            unreadCount={unreadCount}
            isLoading={isLoading}
            onMarkAllAsRead={markAllAsRead}
            onNotificationClick={handleNotificationClick}
        />
    );

    const triggerButton = (
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
    );

    return (
        <>
            {echoIsConfigured() ? <NotificationEchoListener userId={userId} /> : null}
            {isMobile ? (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative size-11 rounded-full"
                        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                        onClick={() => handleOpenChange(true)}
                    >
                        <Bell className="size-5 text-foreground/80" />
                        {unreadCount > 0 && (
                            <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground ring-2 ring-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                    <Sheet open={open} onOpenChange={handleOpenChange}>
                        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl px-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <SheetHeader className="border-b border-border/50 px-4 pb-3 text-left">
                                <SheetTitle>Notifications</SheetTitle>
                            </SheetHeader>
                            {panelContent}
                        </SheetContent>
                    </Sheet>
                </>
            ) : (
                <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
                    <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-[min(100vw-2rem,24rem)] p-0"
                        onCloseAutoFocus={(event) => event.preventDefault()}
                    >
                        {panelContent}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </>
    );
}

function NotificationPanelContent({
    items,
    unreadCount,
    isLoading,
    onMarkAllAsRead,
    onNotificationClick,
}: {
    items: AppNotification[];
    unreadCount: number;
    isLoading: boolean;
    onMarkAllAsRead: () => void;
    onNotificationClick: (notification: AppNotification) => void;
}) {
    if (isLoading) {
        return <NotificationListSkeleton />;
    }

    return (
        <>
            <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
                <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                    Notifications
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={onMarkAllAsRead}
                        className="text-[12px] font-medium text-primary hover:underline"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No notifications"
                    description="You're all caught up."
                    className="border-0 bg-transparent shadow-none"
                />
            ) : (
                <div className="max-h-[min(24rem,60vh)] overflow-y-auto py-1">
                    {items.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={cn(
                                'cursor-pointer items-start gap-3 rounded-none px-4 py-3 focus:bg-accent/60',
                                !notification.read_at && 'bg-primary/5',
                            )}
                            onClick={() => onNotificationClick(notification)}
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
        </>
    );
}

function NotificationEchoListener({ userId }: { userId: number }) {
    useEchoNotification(
        `App.Models.User.${userId}`,
        () => {
            router.reload({ only: ['notifications', 'notificationsUnreadCount'] });
        },
        undefined,
        [userId],
    );

    return null;
}
