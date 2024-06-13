import { AxiosWrapper } from './wrapper';
import { Self } from './self';

export type Annotation = {
    id: number;
    user: Self;
    text: string;
    timestamp: Date;
};

export const getAnnotations = async ({ queryKey }: { queryKey: [string, string, string] }): Promise<Annotation[]> => {
    const [, courseId, materialId] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/annotations/${courseId}/${materialId}`,
    });

    return response;
};
