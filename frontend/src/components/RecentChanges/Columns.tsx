import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import type { Change } from '@/src/api/change';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Change>[] = [
    {
        accessorKey: 'item_type',
        header: () => <div className='text-center'>Course Material</div>,
        cell: ({ row }) => {
            const itemType = row.original.item_type;
            return <div className='text-center'>{itemType}</div>;
        },
    },
    {
        accessorKey: 'change_type',
        header: () => <div className='text-center'>Type</div>,
        cell: ({ row }) => {
            const changeType = row.original.change_type;
            return <div className='text-center'>{changeType}</div>;
        },
    },
    {
        accessorKey: 'change_date',
        header: ({ column }) => {
            return (
                <Button
                    className='w-full h-full flex justify-center items-center gap-2'
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Date
                    <ArrowUpDown className='h-4 w-4' />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.original.change_date);
            return <div className='text-center'>{date.toLocaleDateString()}</div>;
        },
    },
];
