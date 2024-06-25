import type { ColumnDef } from '@tanstack/react-table';
import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';
import { DataTable } from '../RecentChanges/DataTable';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

export type Page = {
    title: string;
    creationDate: string;
    lastEditDate: string;
    lastEditedBy: string;
    isFrontPage?: boolean;
};

const Page: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const pages = change.data_object as Page[];
    return <DataTable columns={columns} data={pages} />;
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
        accessorKey: 'creationDate',
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
            return <div>{format(new Date(row.getValue('creationDate')), 'dd/MM/yyyy')}</div>;
        },
    },
    {
        accessorKey: 'lastEditDate',
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
            return <div>{format(new Date(row.getValue('lastEditDate')), 'dd/MM/yyyy')}</div>;
        },
    },
    {
        header: 'Edited By',
        accessorKey: 'lastEditedBy',
    },
    {
        header: 'Front Page',
        accessorKey: 'isFrontPage',
    },
];
