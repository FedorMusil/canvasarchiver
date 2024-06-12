import { AxiosWrapper } from './wrapper';

export enum UserRole {
    NONE = 'none',
    OBSERVER = 'observer',
    STUDENT = 'student',
    TA = 'ta',
    DESIGNER = 'designer',
    TEACHER = 'teacher',
}

export type Self = {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    courseId: number;
};

export const getUser = async (): Promise<Self> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/self`,
    });

    return response;
};
