import { Share2, X } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { Button } from '@/components/ui/button';

type BulkActionBarProps = {
    count: number;
    onClear: () => void;
    onShare: () => void;
};

export function BulkActionBar({ count, onClear, onShare }: BulkActionBarProps) {
    if (count === 0) {
        return null;
    }

    return (
        <GlassCard className="mb-4 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] font-medium text-foreground">
                {count} selected
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={onClear}>
                    <X className="size-4" />
                    Clear
                </Button>
                <Button type="button" className="h-10 rounded-xl" onClick={onShare}>
                    <Share2 className="size-4" />
                    Share {count > 1 ? `(${count})` : ''}
                </Button>
            </div>
        </GlassCard>
    );
}
