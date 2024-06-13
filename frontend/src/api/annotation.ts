import { AxiosWrapper } from './wrapper';
import { Self } from './self';

export type Annotation = {
    id: number;
    user: Self;
    annotation: string;
    parentId: number | null;
    changeId: number;
    selectedText: string | null;
    selectionStart: number | null;
    selectionEnd: number | null;
    timestamp: Date;
};

export const getAnnotationsByChange = async ({
    queryKey,
}: {
    queryKey: [string, string, string];
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
