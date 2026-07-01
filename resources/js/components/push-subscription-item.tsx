import { router } from '@inertiajs/react';
import { BellRing, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { sendTest } from '@/actions/App/Http/Controllers/PushSubscriptionController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { PushSubscriptionItem } from '@/types/notifications';

type Props = {
    subscription: PushSubscriptionItem;
    isCurrentDevice: boolean;
    onRemove: (endpoint: string) => Promise<boolean>;
    disabled?: boolean;
};

export default function PushSubscriptionItem({
    subscription,
    isCurrentDevice,
    onRemove,
    disabled = false,
}: Props) {
    const [sendingTest, setSendingTest] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleTestPush = () => {
        setSendingTest(true);

        router.post(
            sendTest.url(subscription.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSendingTest(false),
            },
        );
    };

    const handleRemove = async () => {
        setRemoving(true);

        const removed = await onRemove(subscription.endpoint);

        setRemoving(false);

        if (removed) {
            setDialogOpen(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <BellRing className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-medium tracking-tight">
                            {subscription.label}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset">
                            {subscription.provider}
                        </span>
                        {subscription.content_encoding && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset">
                                {subscription.content_encoding}
                            </span>
                        )}
                        {isCurrentDevice && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-primary uppercase ring-1 ring-primary/20 ring-inset">
                                This device
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Registered {subscription.created_at_diff}
                        <span className="mx-1 text-muted-foreground/50">/</span>
                        Updated {subscription.updated_at_diff}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground/80">
                        {subscription.endpoint}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-xl px-4"
                    disabled={disabled || sendingTest || removing}
                    onClick={handleTestPush}
                >
                    <BellRing className="size-4" />
                    {sendingTest ? 'Sending…' : 'Test push'}
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={disabled || sendingTest || removing}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Remove linked device</DialogTitle>
                        <DialogDescription>
                            Remove {subscription.label} from your linked
                            devices? It will stop receiving push alerts.
                            {isCurrentDevice &&
                                ' You will need to enable notifications again on this browser to re-register it.'}
                        </DialogDescription>
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleRemove}
                                disabled={removing}
                            >
                                {removing ? 'Removing…' : 'Remove device'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
