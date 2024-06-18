import { AxiosWrapper } from './wrapper';
import type { Self } from './self';

export type Annotation = {
    id: number;
    user: Self;
    annotation: string;
    parentId: number | null;
    changeId: number;
    timestamp: Date;
    selectionId: string | null;
};

export const getAnnotationsByChange = async ({
    queryKey,
}: {
    queryKey: [string, number, number];
}): Promise<Annotation[]> => {
    const [, courseId, materialId] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/annotations/${courseId}/${materialId}`,
    });

    return response;
};

export type PostAnnotation = Omit<Annotation, 'id' | 'user' | 'timestamp'> & { userId: string };
export const postAnnotation = async ({ annotation }: { annotation: PostAnnotation }): Promise<Annotation> => {
    const response = await AxiosWrapper({
        method: 'POST',
        url: '/annotations',
        data: annotation,
    });

    return response;
};

export const deleteAnnotation = async ({ annotationId }: { annotationId: number }): Promise<void> => {
    await AxiosWrapper({
        method: 'DELETE',
        url: `/annotations/${annotationId}`,
    });
};
