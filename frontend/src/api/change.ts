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
    change_type: ChangeType;
    change_date: string;
    item_type: ItemTypes;
    old_value: number; // Reference to the previous change
    new_value: { [key: string]: unknown };
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
