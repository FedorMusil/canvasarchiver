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
        url: `/change/${materialId}`,
    });

    return response;
};

export const getRecentChanges = async (): Promise<Change[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: '/changes/recent',
    });

    return response;
};

export type ChangeChangeContents = {course_id: number; item_id: number; change_type: ChangeType;
                                    item_type: ItemTypes; older_diff: string; diff: string};
export const changeChangeContents = async (changeContents: ChangeChangeContents): Promise<Change> => {
    const response = await AxiosWrapper({
        method: 'PUT',
        url: '/changes',
        data: changeContents,
    });

    return response;
};
