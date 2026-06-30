import { Check, ChevronDown, Search } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type CountryPhoneOption = {
    id: number;
    name: string;
    iso2: string;
    dial_code: string;
};

type PhoneInputProps = {
    countries: CountryPhoneOption[];
    countryId: string;
    phone: string;
    onCountryChange: (countryId: string) => void;
    onPhoneChange: (phone: string) => void;
    countryError?: string;
    phoneError?: string;
    phoneId?: string;
};

export function parsePhoneNumber(
    full: string,
    countries: CountryPhoneOption[],
): { countryId: string; phone: string } {
    const normalized = full.startsWith('+') ? full : `+${full.replace(/^\+/, '')}`;
    const sorted = [...countries].sort((a, b) => b.dial_code.length - a.dial_code.length);

    for (const country of sorted) {
        if (normalized.startsWith(country.dial_code)) {
            return {
                countryId: String(country.id),
                phone: normalized.slice(country.dial_code.length),
            };
        }
    }

    return { countryId: '', phone: normalized.replace(/^\+/, '') };
}

export function defaultCountryId(countries: CountryPhoneOption[]): string {
    const uae = countries.find((country) => country.iso2 === 'AE');

    return String(uae?.id ?? countries[0]?.id ?? '');
}

export function PhoneInput({
    countries,
    countryId,
    phone,
    onCountryChange,
    onPhoneChange,
    countryError,
    phoneError,
    phoneId = 'crew_phone',
}: PhoneInputProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const selected = countries.find((country) => String(country.id) === countryId);
    const hasError = !!(countryError || phoneError);

    const filtered = countries.filter((country) => {
        const haystack = `${country.name} ${country.iso2} ${country.dial_code}`.toLowerCase();

        return haystack.includes(query.toLowerCase());
    });

    React.useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            <div
                className={cn(
                    'flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-border/60 bg-muted/40 shadow-xs transition-all',
                    'focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20',
                    hasError && 'border-destructive/60 focus-within:border-destructive/60 focus-within:ring-destructive/20',
                )}
            >
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="flex shrink-0 items-center gap-1.5 border-r border-border/50 px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted/60"
                    aria-label="Select country code"
                >
                    <span className="font-mono tracking-wide">{selected?.dial_code ?? '+--'}</span>
                    <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
                </button>

                <input
                    id={phoneId}
                    name={phoneId}
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, ''))}
                    className="min-w-0 flex-1 bg-transparent px-4 font-mono text-base tracking-wide text-foreground outline-none placeholder:text-muted-foreground sm:text-[14px]"
                    placeholder="501234567"
                    autoComplete="tel-national"
                    aria-invalid={hasError}
                />
            </div>

            {open && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg">
                    <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-3 py-2.5">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search country or code…"
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-56 overflow-y-auto py-1">
                        {filtered.length > 0 ? (
                            filtered.map((country) => (
                                <button
                                    key={country.id}
                                    type="button"
                                    onClick={() => {
                                        onCountryChange(String(country.id));
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                                >
                                    <span className="truncate text-foreground">{country.name}</span>
                                    <span className="flex shrink-0 items-center gap-2">
                                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                            {country.iso2}
                                        </span>
                                        <span className="font-mono text-[13px] font-medium text-foreground">
                                            {country.dial_code}
                                        </span>
                                        {String(country.id) === countryId && (
                                            <Check className="size-4 text-primary" />
                                        )}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No countries found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
