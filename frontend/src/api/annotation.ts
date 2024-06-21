import type { UserRole } from './self';
import { AxiosWrapper } from './wrapper';

export type Annotation = {
    id: number;
    changeId: number;
    annotation: string;
    timestamp: Date;
    parentId: number | null;
    selectionId: string | null;

    user_id: string;
    user_name: string;
    user_role: UserRole;
};

export const getAnnotationsByChange = async (changeId: number): Promise<Annotation[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/course/annotations/${changeId}`,
    });

    return response;
};

export type PostAnnotation = Omit<Annotation, 'id' | 'timestamp' | 'user_id' | 'user_name' | 'user_role'>;
export const postAnnotation = async ({ annotation }: { annotation: PostAnnotation }): Promise<Annotation> => {
    const response = await AxiosWrapper({
        method: 'POST',
        url: '/annotations',
        data: annotation,
    });

    return response;
};

export const deleteAnnotation = async (annotationId: number): Promise<void> => {
    await AxiosWrapper({
        method: 'DELETE',
        url: `/annotations/${annotationId}`,
    });
};
