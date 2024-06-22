import { AxiosWrapper } from './wrapper';

export enum UserRole {
    OBSERVER = 'Observer',
    TA = 'TA',
    DESIGNER = 'Designer',
    TEACHER = 'Teacher',
}

export type Self = {
    id: string;
    name: string;
    role: UserRole;
};

export const getSelf = async (): Promise<Self> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: '/self',
    });

    return response;
};
