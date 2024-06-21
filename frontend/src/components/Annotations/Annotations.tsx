import { deleteAnnotation, getAnnotationsByChange, type Annotation } from '@/src/api/annotation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/src/components/ui/context-menu';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useCompareIdContext } from '@/src/stores/CompareIdStore/useCompareIdStore';
import { useGlobalContext } from '@/src/stores/GlobalStore/useGlobalStore';
import tailwindConfig from '@/tailwind.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Ban, GitCommitVertical, Reply, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState, type FC } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import { useShallow } from 'zustand/react/shallow';

const Annotations: FC = memo(() => {
    const { userCode } = useGlobalContext(
        useShallow((state) => ({
            userCode: state.userCode,
        }))
    );

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
        queryFn: async () => await getAnnotationsByChange(changeId),
    });

    const annotationData = useSortedAnnotations(data);
    useTextHighlighter(data);

    const queryClient = useQueryClient();
    const { mutate, status } = useMutation({ mutationFn: deleteAnnotation });
    useEffect(() => {
        if (status === 'success') queryClient.invalidateQueries({ queryKey: ['annotations', materialId, changeId] });
    }, [status, queryClient, materialId, changeId]);

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
                                {annotation.user_name}{' '}
                                <span className='text-muted-foreground'>({annotation.user_role})</span>
                            </p>
                            <p className='text-sm text-muted-foreground'>{timeAgo}</p>
                        </div>
                        <p className='text-sm'>{annotation.annotation}</p>
                    </div>
                );

                const fullConfig = resolveConfig(tailwindConfig);
                return (
                    <AlertDialog key={annotation.id}>
                        <ContextMenu>
                            <ContextMenuTrigger asChild className='w-full'>
                                <button
                                    className={`text-start hover:bg-muted w-full ${replyTo?.annotationId === annotation.id ? 'bg-muted' : ''}`}
                                    onClick={() => {
                                        if (replyTo?.annotationId === annotation.id) setReplyTo(null);
                                        else {
                                            setReplyTo({
                                                annotationId: annotation.id,
                                                userId: annotation.user_id,
                                                name: annotation.user_name,
                                            });
                                        }
                                    }}
                                    onMouseEnter={() => {
                                        if (annotation.selectionId) {
                                            const element = document.getElementById(annotation.selectionId);
                                            if (element) {
                                                // prettier-ignore
                                                {
                                                    // @ts-expect-error This is a custom color that is defined in the tailwind config.
                                                    element.style.backgroundColor = fullConfig.theme.colors.highlight.selected;
                                                }
                                            }
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (annotation.selectionId && replyTo?.annotationId !== annotation.id) {
                                            const element = document.getElementById(annotation.selectionId);
                                            if (element) {
                                                // prettier-ignore
                                                {
                                                    // @ts-expect-error This is a custom color that is defined in the tailwind config.
                                                    element.style.backgroundColor = fullConfig.theme.colors.highlight.DEFAULT;
                                                }
                                            }
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
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem
                                    className='grid grid-cols-4'
                                    onClick={() => {
                                        if (replyTo?.annotationId === annotation.id) setReplyTo(null);
                                        else {
                                            setReplyTo({
                                                annotationId: annotation.id,
                                                userId: annotation.user_id,
                                                name: annotation.user_name,
                                            });
                                        }
                                    }}
                                >
                                    {replyTo?.annotationId === annotation.id ?
                                        <Ban className='w-4 h-4 col-span-1' />
                                    :   <Reply className='w-4 h-4 col-span-1' />}
                                    <span className='col-span-3'>
                                        {replyTo?.annotationId === annotation.id ? 'Cancel Reply' : 'Reply'}
                                    </span>
                                </ContextMenuItem>
                                {/* Only show delete option if the user is the author of the annotation */}
                                {annotation.user_id === userCode && (
                                    <AlertDialogTrigger asChild>
                                        <ContextMenuItem className='grid grid-cols-4'>
                                            <Trash2 className='w-4 h-4 col-span-1' />
                                            <span className='col-span-3'>Delete</span>
                                        </ContextMenuItem>
                                    </AlertDialogTrigger>
                                )}
                            </ContextMenuContent>
                        </ContextMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the annotation and it's
                                    replies.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        // Check if the annotation is a reply. If it is, set the replyTo state to the parent annotation or null.
                                        if (annotation.parentId) {
                                            const parentAnnotation = annotationData.find(
                                                (a) => a.id === annotation.parentId
                                            );
                                            if (parentAnnotation) {
                                                setReplyTo({
                                                    annotationId: parentAnnotation.id,
                                                    userId: parentAnnotation.user_id,
                                                    name: parentAnnotation.user_name,
                                                });
                                            }
                                        } else {
                                            setReplyTo(null);
                                        }

                                        mutate(annotation.id);
                                    }}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            })}
        </div>
    );
});
Annotations.displayName = 'Annotations';
export default Annotations;

function useTextHighlighter(data: Annotation[] | undefined): void {
    const fullConfig = resolveConfig(tailwindConfig);

    useEffect(() => {
        if (!data) return;

        data.forEach((annotation) => {
            const selectionId = annotation.selectionId;
            if (!selectionId) return;

            const element = document.getElementById(selectionId);
            if (!element) return;

            // @ts-expect-error This is a custom color that is defined in the tailwind config.
            element.style.backgroundColor = fullConfig.theme.colors.highlight.DEFAULT;
        });
        // @ts-expect-error This is a custom color that is defined in the tailwind config.
    }, [data, fullConfig.theme.colors.highlight.DEFAULT]);
}

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
