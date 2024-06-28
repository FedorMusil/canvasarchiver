import type { ColumnDef } from '@tanstack/react-table';
import type { MaterialInputProps } from './material.types';
import { memo, useState, type FC, type ReactElement } from 'react';
import { Button } from '../ui/Button';
import { ArrowUpDown, Folder, FolderDown } from 'lucide-react';
import { DataTable } from '../RecentChanges/DataTable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';

enum visibility_level {
    NONE = 'none',
    INHERIT = 'inherit',
    COURSE = 'course',
    INSTITUTION = 'institution',
    PUBLIC = 'public',
}

export type File = {
    id: number;
    uuid: string;
    folder_id: number;
    display_name: string;
    filename: string;
    content_type: string;
    url: string;
    size: number;
    created_at: string;
    updated_at: string;
    unlock_at: string;
    locked: boolean;
    hidden: boolean;
    lock_at: string;
    hidden_for_user: boolean;
    visibility_level: visibility_level;
    thumbnail_url: string | null;
    modified_at: string;
    mime_class: string;
    media_entry_id: string;
    locked_for_user: boolean;
    lock_info: string | null;
    lock_explanation: string | null;
    preview_url: string | null;
};

export type Folder = {
    context_type: string;
    context_id: number;
    files_count: number;
    position: number;
    updated_at: string;
    folders_url: string;
    files_url: string;
    full_name: string;
    lock_at: string;
    id: number;
    folders_count: number;
    name: string;
    parent_folder_id?: number;
    created_at: string;
    unlock_at: string | null;
    hidden: boolean;
    hidden_for_user: boolean;
    locked: boolean;
    locked_for_user: boolean;
    for_submissions: boolean;
};

export type FileFolder = {
    file: File[];
    folder: Folder[];
};

const File: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const data = change.content as FileFolder;

    // Create a map where each folder id is mapped to all the files in that folder
    const filesByFolderId = data.file.reduce(
        (acc, file) => {
            if (!acc[file.folder_id]) acc[file.folder_id] = [];
            acc[file.folder_id].push(file);
            return acc;
        },
        {} as Record<number, File[]>
    );

    // Create a map where each folder id is mapped to all the subfolders in that folder
    const foldersByParentFolderId = data.folder.reduce(
        (acc, folder) => {
            if (!acc[folder.parent_folder_id ?? 0]) acc[folder.parent_folder_id ?? 0] = [];
            acc[folder.parent_folder_id ?? 0].push(folder);
            return acc;
        },
        {} as Record<number, Folder[]>
    );

    const [selectedFolder, setSelectedFolder] = useState<Folder>(data.folder[0]);

    return (
        <div className='w-full flex'>
            <div className='w-[200px] h-full px-2'>
                <h4 className='font-semibold mb-4'>Folders</h4>
                {data.folder.map((folder) => (
                    <FolderRender
                        key={folder.id}
                        folder={folder}
                        foldersByParentFolderId={foldersByParentFolderId}
                        setSelectedFolder={setSelectedFolder}
                        children={foldersByParentFolderId[folder.id]}
                    />
                ))}
            </div>
            <div className='h-full px-2'>
                <h4 className='font-semibold mb-4'>Files</h4>
                <DataTable
                    columns={columns}
                    data={filesByFolderId[selectedFolder.id]}
                    messageOnEmpty='This folder has no files'
                />
            </div>
        </div>
    );
});
File.displayName = 'File';
export default File;

type FolderRenderProps = {
    folder: Folder;
    foldersByParentFolderId: Record<number, Folder[]>;
    setSelectedFolder: (folder: Folder) => void;
    children?: Folder[];
};

const FolderRender: FC<FolderRenderProps> = ({
    folder,
    foldersByParentFolderId,
    setSelectedFolder,
    children,
}): ReactElement => {
    if (children) {
        return (
            <Accordion className='w-full' type='single' collapsible>
                <AccordionItem className='w-full border-none' value={folder.id.toString()} key={folder.id}>
                    <AccordionTrigger className='font-normal text-sm hover:bg-secondary justify-start gap-1 w-full flex-nowrap overflow-x-hidden'>
                        <FolderDown className='mr-2 h-4 w-4 flex-shrink-0' />
                        <span className='flex-shrink overflow-hidden whitespace-nowrap text-ellipsis'>
                            {folder.name}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent>
                        {children.map((child) => (
                            <FolderRender
                                key={child.id}
                                folder={child}
                                foldersByParentFolderId={foldersByParentFolderId}
                                setSelectedFolder={setSelectedFolder}
                                children={foldersByParentFolderId[child.id]}
                            />
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    } else {
        return (
            <Button
                className='px-0 py-4 font-normal w-full justify-start'
                onClick={() => setSelectedFolder(folder)}
                variant='ghost'
            >
                <Folder className='mr-2 h-4 w-4' />
                <span className='flex-shrink overflow-hidden whitespace-nowrap text-ellipsis'>{folder.name}</span>
            </Button>
        );
    }
};

const columns: ColumnDef<File>[] = [
    {
        accessorKey: 'display_name',
        header: ({ column }) => {
            return (
                <Button
                    className='px-0'
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Name
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
                    Creation Date
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
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
                    Last Updated
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
    },
    {
        accessorKey: 'visibility_level',
        header: 'Visibility',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
];
