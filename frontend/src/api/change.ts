import { AxiosWrapper } from './wrapper';

export enum ChangeType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export enum ItemTypes {
    SECTIONS = 'Sections',
    MODULES = 'Modules',
    PAGES = 'Pages',
    FILES = 'Files',
    ASSIGNMENTS = 'Assignments',
    QUIZZES = 'Quizzes',
    RUBRICS = 'Rubrics',
}

export type Change = {
    id: number;
    old_id: number;

    change_type: ChangeType;
    item_type: ItemTypes;

    change_date: string;

    old_contents: string;
    new_contents: string;
};

export const getChangesByMaterial = async ({ queryKey }: { queryKey: [string, string] }): Promise<Change[]> => {
    const [, materialId] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/changes/material/${materialId}`,
    });

    return response;
};

export const getRecentChanges = async ({ queryKey }: { queryKey: [string, string] }): Promise<Change[]> => {
    const [, courseCode] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/changes/recent/${courseCode}`,
    });

    return response;
};

export type ChangeChangeContents = { id: number; oldContent: string; newContent: string };
export const changeChangeContents = async (changeContents: ChangeChangeContents): Promise<Change> => {
    const response = await AxiosWrapper({
        method: 'PUT',
        url: '/changes',
        data: changeContents,
    });

    return response;
};
