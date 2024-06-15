import { formatDistanceToNow } from 'date-fns';
import { GitCommitVertical } from 'lucide-react';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useCompareIdContext } from '@/src/stores/CompareIdStore/useCompareIdStore';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { getAnnotationsByChange, type Annotation } from '@/src/api/annotation';
import { memo, useCallback, useEffect, useState, type FC } from 'react';

const Annotations: FC = memo(() => {
    const { changeId, materialId } = useCompareIdContext(
        useShallow((state) => ({
            changeId: state.changeId,
            materialId: state.materialId,
        }))
    );

    const { replyTo, setReplyTo } = useAnnotationStore(
        useShallow((state) => ({
            replyTo: state.replyTo,
            setReplyTo: state.setReplyTo,
        }))
    );

    const { data, isLoading, isError } = useQuery({
        queryKey: ['annotations', materialId, changeId],
        queryFn: getAnnotationsByChange,
    });

    const annotationData = useSortedAnnotations(data);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error...</p>;

    return (
        <div className='w-full h-full overflow-y-auto space-y-2'>
            {annotationData.map((annotation) => {
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
                        className={`text-start hover:bg-muted w-full ${replyTo?.annotationId === annotation.id ? 'bg-muted' : ''}`}
                        key={annotation.id}
                        onClick={() => {
                            if (replyTo?.annotationId === annotation.id) setReplyTo(null);
                            else {
                                setReplyTo({
                                    annotationId: annotation.id,
                                    userId: annotation.user.id,
                                    name: annotation.user.name,
                                });
                            }
                        }}
                    >
                        {annotation.parentId ?
                            <div className='flex gap-2'>
                                <GitCommitVertical
                                    className='w-6 h-6 flex-shrink-0'
                                    style={{
                                        marginLeft: `${annotation.depth - 1}rem`,
                                    }}
                                />
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

type AnnotationData = Annotation & { depth: number };
function useSortedAnnotations(data: Annotation[] | undefined): AnnotationData[] {
    const [annotationData, setAnnotationData] = useState<AnnotationData[]>([]);

    const sortAnnotationsByTimestamp = useCallback((annotations: AnnotationData[]): AnnotationData[] => {
        return annotations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, []);

    const getChildren = useCallback(
        (parentId: number | null, data: Annotation[], depth: number = 0): AnnotationData[] => {
            const children = data.filter((annotation) => annotation.parentId === parentId);
            const sortedChildren = sortAnnotationsByTimestamp(children.map((child) => ({ ...child, depth })));
            return sortedChildren.flatMap((child) => [child, ...getChildren(child.id, data, depth + 1)]);
        },
        [sortAnnotationsByTimestamp]
    );

    useEffect(() => {
        if (data) setAnnotationData(getChildren(null, data));
    }, [data, getChildren]);

    return annotationData;
}
