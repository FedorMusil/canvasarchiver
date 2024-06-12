import { AxiosWrapper } from './wrapper';
import { Self } from './self';

export type Annotation = {
    id: number;
    user: Self;
    text: string;
    timestamp: Date;
};

export const getAnnotations = async (changeId: number): Promise<Annotation[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/annotations/${changeId}`,
    });

    return response;
};
