import { AxiosWrapper } from './wrapper';

export enum UserRole {
    OBSERVER = 'Observer',
    TA = 'TA',
    DESIGNER = 'Designer',
    TEACHER = 'Teacher',
}

export type Self = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    courseId: number;
};

export const getSelf = async ({ queryKey }: { queryKey: [string, string] }): Promise<Self> => {
    const [, userID] = queryKey;

    const response = await AxiosWrapper({
        method: 'GET',
        url: `/self/${userID}`,
    });

    return response;
};
