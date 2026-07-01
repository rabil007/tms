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

export type PushSubscriptionItem = {
    id: number;
    endpoint: string;
    label: string;
    provider: string;
    content_encoding: string | null;
    created_at_diff: string;
    updated_at_diff: string;
};
