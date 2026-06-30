import React from 'react';

export type RowsPerPageSelectProps = {
    value: number;
    onChange: (value: number) => void;
    options?: number[];
    label?: string;
    className?: string;
};

export function RowsPerPageSelect({
    value,
    onChange,
    options = [15, 30, 50, 100],
    label = 'Rows',
    className,
}: RowsPerPageSelectProps) {
    return (
        <div className={['flex items-center gap-2', className ?? ''].join(' ')}>
            <span className="text-[13px] text-muted-foreground">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex h-11 min-w-[4.5rem] rounded-xl border border-border/60 bg-muted/40 px-3 text-base font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 sm:text-[13px]"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

