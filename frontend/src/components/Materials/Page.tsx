import type { ColumnDef } from '@tanstack/react-table';
import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';
import { DataTable } from '../RecentChanges/DataTable';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

export type Page = {
    title: string;
    created_at: string;
    updated_at: string;
    last_edited_by: {
        display_name: string;
    };
    front_page: boolean;
};

const Page: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const pages = change.content as Page[];

    return <DataTable columns={columns} data={pages} messageOnEmpty='No pages found' />;
});
Page.displayName = 'Page';
export default Page;

const columns: ColumnDef<Page>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <Button
                    className='px-0'
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Title
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => {
            return (
                <Button
                    className='px-0'
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Created
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
        cell: ({ row }) => {
            return <div>{format(new Date(row.getValue('created_at')), 'dd/MM/yyyy')}</div>;
        },
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => {
            return (
                <Button
                    className='px-0'
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Last Edited
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
        cell: ({ row }) => {
            return <div>{format(new Date(row.getValue('updated_at')), 'dd/MM/yyyy')}</div>;
        },
    },
    {
        header: 'Edited By',
        accessorKey: 'last_edited_by.display_name',
    },
    {
        header: 'Front Page',
        accessorKey: 'front_page',
    },
];
