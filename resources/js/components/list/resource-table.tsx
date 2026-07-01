import { flexRender } from '@tanstack/react-table';
import type { Table } from '@tanstack/react-table';
import { GlassCard } from '@/components/layout/glass-card';

export type ResourceTableProps<T> = {
    table: Table<T>;
    onRowClick: (row: T) => void;
};

export function ResourceTable<T>({ table, onRowClick }: ResourceTableProps<T>) {
    return (
        <GlassCard className="overflow-hidden">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-max text-sm">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr
                                key={hg.id}
                                className="border-b border-border/40 bg-muted/20"
                            >
                                {hg.headers.map((h) => (
                                    <th
                                        key={h.id}
                                        className="px-4 py-3.5 text-left whitespace-nowrap first:pl-5 last:pr-5 last:text-right"
                                    >
                                        {h.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  h.column.columnDef.header,
                                                  h.getContext(),
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick(row.original)}
                                className="group cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/15"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-4 py-3.5 align-middle whitespace-nowrap first:pl-5 last:pr-5 last:text-right"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
