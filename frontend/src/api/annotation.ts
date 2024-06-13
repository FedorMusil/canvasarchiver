import { AxiosWrapper } from './wrapper';
import { User } from './account';

export type Annotation = {
    id: number;
    user: User;
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
