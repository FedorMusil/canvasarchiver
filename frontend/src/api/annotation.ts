import { AxiosWrapper } from './wrapper';
import type { Self } from './self';

export type Annotation = {
    id: number;
    user: Self;
    changeId: number;
    annotation: string;
    timestamp: string;
    parentId: number | null;
    selectionId: string | null;
};

export const getAnnotationsByChange = async (changeId: number): Promise<Annotation[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/course/annotations/${changeId}`,
    });

    return response;
};

export type PostAnnotation = Omit<Annotation, 'id' | 'user' | 'timestamp'>;
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
