import React from 'react';

export type PaginationLink = { url: string | null; label: string; active: boolean };

export type PaginationBarProps = {
    links: PaginationLink[];
    onVisit: (url: string) => void;
    left?: React.ReactNode;
};

function isPrevNextLink(label: string): boolean {
    const text = label.replace(/<[^>]*>/g, '').trim().toLowerCase();

    return text.includes('previous') || text.includes('next') || text.includes('«') || text.includes('»');
}

export function PaginationBar({
    links,
    onVisit,
    left,
}: PaginationBarProps) {
    const navLinks = links.filter((l) => isPrevNextLink(l.label));

    return (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0">{left}</div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:hidden">
                    {navLinks.map((l, idx) => (
                        <button
                            key={`mobile-${l.label}-${idx}`}
                            type="button"
                            disabled={!l.url || l.active}
                            onClick={() => l.url && onVisit(l.url)}
                            className={[
                                'h-11 min-w-11 px-4 rounded-xl border text-[13px] font-semibold transition-colors touch-manipulation',
                                l.active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/60 bg-muted/40 text-muted-foreground active:bg-muted hover:text-foreground hover:border-border',
                                !l.url ? 'opacity-50 cursor-not-allowed' : '',
                            ].join(' ')}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
                <div className="hidden flex-wrap items-center gap-2 sm:flex">
                    {links.map((l, idx) => (
                        <button
                            key={`${l.label}-${idx}`}
                            type="button"
                            disabled={!l.url || l.active}
                            onClick={() => l.url && onVisit(l.url)}
                            className={[
                                'h-11 min-w-11 px-4 rounded-xl border text-[13px] font-semibold transition-colors',
                                l.active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground hover:border-border',
                                !l.url ? 'opacity-50 cursor-not-allowed' : '',
                            ].join(' ')}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
