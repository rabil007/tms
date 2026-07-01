import { Link } from '@inertiajs/react';
import { Eye, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RowActionsProps = {
    showUrl: string;
    editUrl: string;
    onDelete: () => Promise<void>;
    onShareWhatsApp?: () => void;
    showLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    shareWhatsAppLabel?: string;
};

export function RowActions({
    showUrl,
    editUrl,
    onDelete,
    onShareWhatsApp,
    showLabel = 'View',
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    shareWhatsAppLabel = 'Share on WhatsApp',
}: RowActionsProps) {
    return (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {onShareWhatsApp && (
                <button
                    type="button"
                    title={shareWhatsAppLabel}
                    onClick={onShareWhatsApp}
                    className={cn(
                        'flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors',
                        'hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400',
                    )}
                >
                    <MessageCircle className="size-4" />
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
