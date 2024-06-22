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
    data_object: unknown;
    html_string: string | null;
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
        url: '/changes/recent',
    });

    return response;
};

export const setHtmlString = async ({ id, htmlString }: { id: number; htmlString: string }): Promise<Change> => {
    const response = await AxiosWrapper({
        method: 'PUT',
        url: `/changes/${id}`,
        data: { htmlString },
    });

    return response;
};
