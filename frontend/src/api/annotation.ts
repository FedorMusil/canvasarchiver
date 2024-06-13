import { AxiosWrapper } from './wrapper';
import { Self } from './self';

export type Annotation = {
    id: number;
    user: Self;
    text: string;
    selectedText: string | null;
    selectionStart: number,
    selectionEnd: number,
    timestamp: Date;
    parentId: number | null;
};

export const getAnnotations = async ({ queryKey }: { queryKey: [string, string, string] }): Promise<Annotation[]> => {
    const [, courseId, materialId] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/annotations/${courseId}/${materialId}`,
    });

    return response;
};
