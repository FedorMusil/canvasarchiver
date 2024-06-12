import { AxiosWrapper } from './wrapper';
import { User } from './account';

export type Annotation = {
    id: number;
    user: User;
    text: string;
    selectedText: string | null;
    selectionStart: number,
    selectionEnd: number,
    timestamp: Date;
    parentId: number | null;
};

export const getAnnotations = async (changeId: number): Promise<Annotation[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/annotations/${changeId}`,
    });

    return response;
};
