import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export type RowActionsProps = {
    showUrl: string;
    editUrl: string;
    onDelete: () => Promise<void>;
    showLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
};

export function RowActions({
    showUrl,
    editUrl,
    onDelete,
    showLabel = 'View',
    editLabel = 'Edit',
    deleteLabel = 'Delete',
}: RowActionsProps) {
    return (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
