import { Button } from '@/src/components/ui/Button';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ItemTypes, type Change } from '@/src/api/change';

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    messageOnEmpty: string;
}

export function DataTable<TData, TValue>({ columns, data, messageOnEmpty }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        initialState: {
            columnVisibility,
            sorting,
            pagination: {
                pageSize: 5,
            },
        },
    });

    const navigate = useNavigate();

    return (
        <div>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ?
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    onDoubleClick={() => {
                                        const itemType = (row.original as Change).item_type;
                                        const index = Object.values(ItemTypes).indexOf(itemType);
                                        navigate(`/${index}`);
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        :   <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    {messageOnEmpty}
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-between space-x-2 py-4'>
                <p className='text-muted-foreground text-xs'>
                    Page: {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </p>
                <div className='flex gap-2'>
                    <Button
                        className='w-24'
                        variant='outline'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        className='w-24'
                        variant='outline'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
