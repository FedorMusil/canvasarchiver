import { AxiosWrapper } from './wrapper';

export enum UserRole {
    NONE = 'none',
    OBSERVER = 'observer',
    STUDENT = 'student',
    TA = 'ta',
    DESIGNER = 'designer',
    TEACHER = 'teacher',
}

export type User = {
    id: number;
    email: string;
    name: string;
    role: UserRole;
};

export const getUser = async ({ queryKey }: { queryKey: [string, number] }): Promise<User> => {
    const [, courseCode] = queryKey;
    console.log('courseCode', courseCode);
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/self/${courseCode}`,
    });
    console.log('response', response);

    return response;
};
