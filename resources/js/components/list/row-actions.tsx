import { Link } from '@inertiajs/react';
import { Eye, Check, Pencil, Share2, Trash2 } from 'lucide-react';

export type RowActionsProps = {
    showUrl: string;
    editUrl: string;
    onDelete: () => Promise<void>;
    onShare?: () => void;
    onApprove?: () => void;
    showLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    shareLabel?: string;
    approveLabel?: string;
};

export function RowActions({
    showUrl,
    editUrl,
    onDelete,
    onShare,
    onApprove,
    showLabel = 'View',
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    shareLabel = 'Share schedule',
    approveLabel = 'Approve',
}: RowActionsProps) {
    return (
        <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
        >
            {onApprove && (
                <button
                    type="button"
                    title={approveLabel}
                    onClick={onApprove}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                    <Check className="size-4" />
                </button>
            )}
            {onShare && (
                <button
                    type="button"
                    title={shareLabel}
                    onClick={onShare}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                    <Share2 className="size-4" />
                </button>
            )}
            <Link
                href={showUrl}
                prefetch
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                title={showLabel}
            >
                <Eye className="size-4" />
            </Link>
            <Link
                href={editUrl}
                prefetch
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                title={editLabel}
            >
                <Pencil className="size-4" />
            </Link>
            <button
                type="button"
                title={deleteLabel}
                onClick={onDelete}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2 className="size-4" />
            </button>
        </div>
    );
}
