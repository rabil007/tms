import { router } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import React from 'react';
import { toUrl } from '@/lib/utils';

export type IndexFilters = {
    q?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
    per_page?: number;
};

export type UseIndexQueryParamsOptions = {
    href: NonNullable<InertiaLinkProps['href']>;
    filters?: IndexFilters;
    extras?: Record<string, string | number | undefined>;
    defaultPerPage?: number;
    defaultSort?: string;
    allowedSorts?: string[];
    debounceMs?: number;
    reloadOnly?: readonly string[];
};

function isIndexFilters(value: unknown): value is IndexFilters {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readSort(
    filters: IndexFilters | undefined,
    defaultSort: string,
    allowedSorts?: string[],
): string {
    const sort = readString(filters?.sort) ?? defaultSort;

    if (allowedSorts && !allowedSorts.includes(sort)) {
        return defaultSort;
    }

    return sort;
}

function readDir(filters: IndexFilters | undefined): 'asc' | 'desc' {
    return filters?.dir === 'desc' ? 'desc' : 'asc';
}

function readPerPage(
    filters: IndexFilters | undefined,
    defaultPerPage: number,
): number {
    const perPage = filters?.per_page;

    return typeof perPage === 'number' && perPage > 0
        ? perPage
        : defaultPerPage;
}

export function useIndexQueryParams({
    href,
    filters: rawFilters,
    extras,
    defaultPerPage = 15,
    defaultSort = 'name',
    allowedSorts,
    debounceMs = 250,
    reloadOnly,
}: UseIndexQueryParamsOptions) {
    const filters = isIndexFilters(rawFilters) ? rawFilters : undefined;

    const [q, setQ] = React.useState(() => readString(filters?.q) ?? '');
    const [perPage, setPerPage] = React.useState(() =>
        readPerPage(filters, defaultPerPage),
    );
    const [sort, setSort] = React.useState(() =>
        readSort(filters, defaultSort, allowedSorts),
    );
    const [dir, setDir] = React.useState<'asc' | 'desc'>(() =>
        readDir(filters),
    );
    const prevQRef = React.useRef(q);
    const didInitRef = React.useRef(false);

    const filtersKey = React.useMemo(
        () =>
            JSON.stringify({
                q: filters?.q,
                sort: filters?.sort,
                dir: filters?.dir,
                per_page: filters?.per_page,
                defaultPerPage,
                defaultSort,
                allowedSorts,
            }),
        [filters, defaultPerPage, defaultSort, allowedSorts],
    );
    const [prevFiltersKey, setPrevFiltersKey] = React.useState(filtersKey);

    if (filtersKey !== prevFiltersKey && isIndexFilters(rawFilters)) {
        setPrevFiltersKey(filtersKey);
        setQ(readString(rawFilters.q) ?? '');
        setPerPage(readPerPage(rawFilters, defaultPerPage));
        setSort(readSort(rawFilters, defaultSort, allowedSorts));
        setDir(readDir(rawFilters));
    }

    const url = React.useMemo(() => toUrl(href), [href]);

    const extrasKey = React.useMemo(
        () => JSON.stringify(extras ?? {}),
        [extras],
    );
    const normalizedExtras = React.useMemo(() => {
        const parsed = JSON.parse(extrasKey) as Record<
            string,
            string | number | undefined
        >;

        return parsed;
    }, [extrasKey]);

    const params = React.useMemo(
        () => ({
            q: q || undefined,
            sort,
            dir,
            per_page: perPage,
            ...normalizedExtras,
        }),
        [q, sort, dir, perPage, normalizedExtras],
    );

    const paramsKey = React.useMemo(() => JSON.stringify(params), [params]);

    const visitOptions = React.useMemo(
        () => ({
            preserveScroll: true,
            replace: true as const,
            ...(reloadOnly ? { only: [...reloadOnly] } : {}),
        }),
        [reloadOnly],
    );

    const lastVisitedParamsKeyRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (!didInitRef.current) {
            didInitRef.current = true;
            prevQRef.current = q;
            lastVisitedParamsKeyRef.current = paramsKey;

            return;
        }

        if (lastVisitedParamsKeyRef.current === paramsKey) {
            return;
        }

        lastVisitedParamsKeyRef.current = paramsKey;

        const shouldDebounce = prevQRef.current !== q;
        prevQRef.current = q;

        if (!shouldDebounce || debounceMs <= 0) {
            router.get(url, params, visitOptions);

            return;
        }

        const t = setTimeout(() => {
            router.get(url, params, visitOptions);
        }, debounceMs);

        return () => clearTimeout(t);
    }, [q, perPage, url, debounceMs, paramsKey, params, visitOptions]);

    const toggleSort = React.useCallback(
        (nextSort: string) => {
            if (allowedSorts && !allowedSorts.includes(nextSort)) {
                return;
            }

            const nextDir =
                sort === nextSort ? (dir === 'asc' ? 'desc' : 'asc') : 'asc';

            setSort(nextSort);
            setDir(nextDir);

            router.get(
                url,
                { ...params, sort: nextSort, dir: nextDir },
                visitOptions,
            );
        },
        [url, params, sort, dir, allowedSorts, visitOptions],
    );

    return {
        q,
        setQ,
        perPage,
        setPerPage,
        sort,
        dir,
        params,
        toggleSort,
    };
}
