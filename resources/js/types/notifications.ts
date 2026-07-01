export type AppNotification = {
    id: string;
    title: string;
    message: string;
    action_url: string | null;
    read_at: string | null;
    created_at_diff: string;
};

export type SharedNotifications = {
    items: AppNotification[];
};
