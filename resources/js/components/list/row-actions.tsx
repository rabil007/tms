import { Link } from '@inertiajs/react';
import { Eye, Pencil, Share2, Trash2 } from 'lucide-react';

export type RowActionsProps = {
    showUrl: string;
    editUrl: string;
    onDelete: () => Promise<void>;
    onShare?: () => void;
    showLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    shareLabel?: string;
};

export function RowActions({
    showUrl,
    editUrl,
    onDelete,
    onShare,
    showLabel = 'View',
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    shareLabel = 'Share schedule',
}: RowActionsProps) {
    return (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                title={showLabel}
            >
                <Eye className="size-4" />
            </Link>
            <Link
                href={editUrl}
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
