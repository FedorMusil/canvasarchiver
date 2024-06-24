import { deleteAnnotation, getAnnotationsByChange, type Annotation } from '@/src/api/annotation';
import { setHighlight } from '@/src/api/change';
import { getSelf } from '@/src/api/self';
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
import { useHighlight } from '@/src/hooks/useHighlighter';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useChangeContext } from '@/src/stores/ChangeStore/useCompareIdStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Ban, GitCommitVertical, Reply, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState, type FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

const Annotations: FC = memo(() => {
    const { selectedChangeId, curChangeId, materialId, highlighter } = useChangeContext(
        useShallow((state) => ({
            selectedChangeId: state.selectedChangeId,
            curChangeId: state.curChangeId,
            materialId: state.materialId,
            highlighter: state.highlighter,
        }))
    );

    const { replyTo, setReplyTo, prevRef, curRef, setSelectionId } = useAnnotationStore(
        useShallow((state) => ({
            replyTo: state.replyTo,
            setReplyTo: state.setReplyTo,
            prevRef: state.prevRef,
            curRef: state.curRef,
            setSelectionId: state.setSelectionId,
        }))
    );

    const {
        data: self,
        isLoading: selfLoading,
        isError: selfError,
    } = useQuery({
        queryKey: ['self'],
        queryFn: async () => await getSelf(),
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['annotations', materialId, selectedChangeId],
        queryFn: async () => await getAnnotationsByChange(selectedChangeId),
    });

    const annotationData = useSortedAnnotations(data);

    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: deleteAnnotation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['annotations', materialId, selectedChangeId] });
        },
    });

    const { highlightSwitchSelection, removeHighlight, removeAllHighlights, getAllHighlights } = useHighlight();
    const { mutate: changeMutate } = useMutation({
        mutationFn: setHighlight,
        onSuccess: () => {
            removeAllHighlights(highlighter);
            queryClient.invalidateQueries({ queryKey: ['changes', materialId.toString()] });
        },
    });

    if (isLoading || selfLoading) return <p>Loading...</p>;
    if (isError || selfError || !self) return <p>Error...</p>;

    return (
        <div className='w-full h-full overflow-y-auto space-y-2'>
            {annotationData.map((annotation, index) => {
                const timeAgo = formatDistanceToNow(new Date(annotation.timestamp), { addSuffix: true });

                const comment = (
                    <div className='w-full'>
                        <div className='flex justify-between w-full'>
                            <p className='text-base font-bold'>
                                {annotation.user.name}{' '}
                                <span className='text-muted-foreground'>
                                    ({annotation.user.id === self.id ? 'You' : annotation.user.role})
                                </span>
                            </p>
                            <p className='text-sm text-muted-foreground'>{timeAgo}</p>
                        </div>
                        <p className='text-sm'>{annotation.annotation}</p>
                    </div>
                );

                return (
                    <AlertDialog key={annotation.id}>
                        <ContextMenu>
                            <ContextMenuTrigger asChild className='w-full'>
                                <button
                                    className={`text-start hover:bg-muted w-full ${replyTo?.annotationId === annotation.id ? 'bg-muted' : ''} ${annotation.parentId || index === 0 ? '' : '!mt-4'}`}
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
                                    onMouseEnter={() => {
                                        if (annotation.selectionId) highlightSwitchSelection(annotation.selectionId);
                                    }}
                                    onMouseLeave={() => {
                                        if (annotation.selectionId && replyTo?.annotationId !== annotation.id) {
                                            highlightSwitchSelection(annotation.selectionId);
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
                                                userId: annotation.user.id,
                                                name: annotation.user.name,
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
                                {annotation.user.id === self.id && (
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
                                                    userId: parentAnnotation.user.id,
                                                    name: parentAnnotation.user.name,
                                                });
                                            }
                                        } else {
                                            setReplyTo(null);
                                        }

                                        let modified: boolean = false;

                                        // If the annotation (or it's children) have highlighted text, remove the highlight.
                                        annotationData.map((a) => {
                                            if (a.parentId !== annotation.id) return;
                                            if (annotation.selectionId) {
                                                removeHighlight(highlighter, annotation.selectionId);
                                                modified = true;
                                            }
                                        });
                                        if (annotation.selectionId) {
                                            removeHighlight(highlighter, annotation.selectionId);
                                            modified = true;
                                        }

                                        if (modified) {
                                            const prevHighlights = getAllHighlights(prevRef.current!, highlighter);
                                            const curHighlights = getAllHighlights(curRef.current!, highlighter);

                                            changeMutate({
                                                changeId: selectedChangeId,
                                                highlights: prevHighlights,
                                            });

                                            changeMutate({
                                                changeId: curChangeId,
                                                highlights: curHighlights,
                                            });

                                            setSelectionId(null);
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
