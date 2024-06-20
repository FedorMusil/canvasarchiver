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
    queryKey: [string, number];
}): Promise<Annotation[]> => {
    const [, changeId] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/course/annotations/${changeId}`,
    });

    return response;
};


export type PostAnnotation = {change_id: number; change_text: string; timestamp: Date};
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
