import { AxiosWrapper } from './wrapper';

export enum UserRole {
    TA = 'TA',
    TEACHER = 'TEACHER',
}

export type User = {
    id: number;
    email: string;
    name: string;
    role: UserRole;
};

export const getUser = async ({ queryKey }: { queryKey: [string, number] }): Promise<User> => {
    const [, courseCode] = queryKey;

    const response = await AxiosWrapper({
        method: 'GET',
        url: `/self/${courseCode}`,
    });

    return response;
};
