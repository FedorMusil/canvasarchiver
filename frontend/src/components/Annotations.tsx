import { formatDistanceToNow } from 'date-fns';
import { GitCommitVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnnotationsByChange, type Annotation } from '@/src/api/annotation';
import { memo, useEffect, useState, type Dispatch, type FC, type SetStateAction } from 'react';

type AnnotationsProps = {
    changeId: string;
    materialId: string;
    setResponseTo: Dispatch<SetStateAction<{ annotationId: number; name: string } | null>>;
};

const Annotations: FC<AnnotationsProps> = memo(({ changeId, materialId, setResponseTo }) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['annotations', materialId, changeId],
        queryFn: getAnnotationsByChange,
    });

    const [annotationData, setAnnotationData] = useState<Annotation[]>([]);
    useEffect(() => {
        if (data) {
            // Before putting the annotation in the state, we sort in the following way:
            // 1. Remove all annotations that have parent from the list
            const parentAnnotations = data.filter((annotation) => annotation.parentId === null);
            // 2. Sort the annotations (with only the parents) by timestamp
            parentAnnotations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            // 3. For each parent annotation, find all the children and sort them by timestamp
            // 4. For each child annotation, finds it's sorted children and place the directly after the parent.
            const sortedAnnotations = parentAnnotations
                .map((parent) => {
                    const children = data.filter((annotation) => annotation.parentId === parent.id);
                    children.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    return [parent, ...children];
                })
                .flat();

            setAnnotationData(sortedAnnotations);
        }
    }, [data]);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error...</p>;

    return (
        <div className='w-full h-full overflow-y-auto space-y-2'>
            {annotationData.map((annotation) => {
                const child = annotation.parentId;
                const timeAgo = formatDistanceToNow(new Date(annotation.timestamp), { addSuffix: true });

                const comment = (
                    <div className='w-full'>
                        <div className='flex justify-between w-full'>
                            <p className='text-base font-bold'>
                                {annotation.user.name}{' '}
                                <span className='text-muted-foreground'>({annotation.user.role})</span>
                            </p>
                            <p className='text-sm text-muted-foreground'>{timeAgo}</p>
                        </div>
                        <p className='text-sm'>{annotation.annotation}</p>
                    </div>
                );

                return (
                    <button
                        className='text-start hover:bg-muted w-full'
                        key={annotation.id}
                        onClick={() =>
                            setResponseTo({
                                annotationId: annotation.parentId ?? annotation.id,
                                name:
                                    annotation.parentId ?
                                        annotationData.find((a) => a.id === annotation.parentId)!.user.name
                                    :   annotation.user.name,
                            })
                        }
                    >
                        {child ?
                            <div className='flex gap-2'>
                                <GitCommitVertical className='w-6 h-6 flex-shrink-0' />
                                {comment}
                            </div>
                        :   comment}
                    </button>
                );
            })}
        </div>
    );
});
Annotations.displayName = 'Annotations';
export default Annotations;
