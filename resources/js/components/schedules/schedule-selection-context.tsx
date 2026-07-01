import type { RowSelectionState } from '@tanstack/react-table';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

type ScheduleSelectionContextValue = {
    rowSelection: RowSelectionState;
    setRowSelected: (id: number, selected: boolean) => void;
    setAllOnPageSelected: (selected: boolean) => void;
    scheduleIdsOnPage: number[];
};

const ScheduleSelectionContext =
    React.createContext<ScheduleSelectionContextValue | null>(null);

function useScheduleSelection(): ScheduleSelectionContextValue {
    const value = React.useContext(ScheduleSelectionContext);

    if (!value) {
        throw new Error(
            'useScheduleSelection must be used within ScheduleSelectionProvider',
        );
    }

    return value;
}

export function ScheduleSelectionProvider({
    rowSelection,
    setRowSelected,
    setAllOnPageSelected,
    scheduleIdsOnPage,
    children,
}: ScheduleSelectionContextValue & { children: React.ReactNode }) {
    const value = React.useMemo(
        () => ({
            rowSelection,
            setRowSelected,
            setAllOnPageSelected,
            scheduleIdsOnPage,
        }),
        [rowSelection, setRowSelected, setAllOnPageSelected, scheduleIdsOnPage],
    );

    return (
        <ScheduleSelectionContext.Provider value={value}>
            {children}
        </ScheduleSelectionContext.Provider>
    );
}

export function ScheduleSelectAllCheckbox() {
    const { rowSelection, setAllOnPageSelected, scheduleIdsOnPage } =
        useScheduleSelection();

    const allSelected =
        scheduleIdsOnPage.length > 0 &&
        scheduleIdsOnPage.every((id) => rowSelection[String(id)]);
    const someSelected =
        scheduleIdsOnPage.some((id) => rowSelection[String(id)]) &&
        !allSelected;
    const checked = allSelected ? true : someSelected ? 'indeterminate' : false;

    return (
        <Checkbox
            checked={checked}
            onCheckedChange={(value) => setAllOnPageSelected(value === true)}
            aria-label="Select all on page"
            onClick={(event) => event.stopPropagation()}
        />
    );
}

export function ScheduleSelectRowCheckbox({
    id,
    label,
}: {
    id: number;
    label: string;
}) {
    const { rowSelection, setRowSelected } = useScheduleSelection();
    const checked = !!rowSelection[String(id)];

    return (
        <div onClick={(event) => event.stopPropagation()}>
            <Checkbox
                checked={checked}
                onCheckedChange={(value) => setRowSelected(id, value === true)}
                aria-label={`Select ${label}`}
            />
        </div>
    );
}
