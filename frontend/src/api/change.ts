import { AxiosWrapper } from './wrapper';

export enum ChangeType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export enum ItemTypes {
    ASSIGNMENTS = 'Assignments',
    PAGES = 'Pages',
    FILES = 'Files',
    QUIZZES = 'Quizzes',
    MODULES = 'Modules',
    SECTIONS = 'Sections',
}

export type Change = {
    id: number;
    change_type: ChangeType;
    item_type: ItemTypes;
    old_value: { [key: string]: unknown };
    new_value: { [key: string]: unknown };
};

export const getChanges = async (courseCode: number): Promise<Change[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/changes/${courseCode}`,
    });

    return response;
};
