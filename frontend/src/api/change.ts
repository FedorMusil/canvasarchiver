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
    timestamp: string;
    diff: unknown;
};

export const getChangesByMaterial = async (materialId: string): Promise<Change[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/course/changes/${materialId}`,
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

export const changeChangeContents = async (changeContents: Change): Promise<Change> => {
    const response = await AxiosWrapper({
        method: 'PUT',
        url: '/changes',
        data: changeContents,
    });

    return response;
};
