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
}

export type Change = {
    id: number;
    old_id: number;
    change_type: ChangeType;
    item_type: ItemTypes;

    timestamp: string;
    data_object: unknown;

    highlights?: string;
};

export const getChangesByMaterial = async (materialId: string): Promise<Change[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/change/${materialId}`,
    });

    return response;
};

export const getRecentChanges = async (): Promise<Change[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: '/change/recent',
    });

    return response;
};

export const setHighlight = async ({
    changeId,
    highlights,
}: {
    changeId: number;
    highlights: string;
}): Promise<void> => {
    await AxiosWrapper({
        method: 'PUT',
        url: `/change/${changeId}/highlight`,
        data: { highlights },
    });
};
