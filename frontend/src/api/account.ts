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

export const getUser = async (courseCode: number): Promise<User> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/self/${courseCode}`,
    });

    return response;
};
