import TooltipWrapper from '../TooltipWrapper';
import { Button } from '@/src/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/src/components/ui/form';
import { Highlighter, MessageSquareReply } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { postAnnotation } from '@/src/api/annotation';
import { setHtmlString } from '@/src/api/change';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useChangeContext } from '@/src/stores/ChangeStore/useCompareIdStore';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { minLength, object, pipe, string, trim, type InferInput } from 'valibot';
import { useCallback, type FC, type ReactElement } from 'react';
import { useHighlight } from '@/src/hooks/useHighlighter';

const annotationSchema = object({
    annotation: pipe(
        string('Please enter a valid annotation'),
        trim(),
        minLength(1, 'Annotation must be at least 1 character long')
    ),
});

type AnnotationInput = InferInput<typeof annotationSchema>;
const AddAnnotation: FC = (): ReactElement => {
    const form = useForm<AnnotationInput>({
        resolver: valibotResolver(annotationSchema),
        defaultValues: {
            annotation: '',
        },
    });

    const { selectedChangeId, materialId } = useChangeContext(
        useShallow((state) => ({
            selectedChangeId: state.selectedChangeId,
            materialId: state.materialId,
        }))
    );

    const { replyTo, setReplyTo, selectionId, setSelectionId, oldContentsRef, currentContentsRef } = useAnnotationStore(
        useShallow((state) => ({
            replyTo: state.replyTo,
            setReplyTo: state.setReplyTo,
            selectionId: state.selectionId,
            setSelectionId: state.setSelectionId,
            oldContentsRef: state.oldContentsRef,
            currentContentsRef: state.currentContentsRef,
        }))
    );

    const queryClient = useQueryClient();

    const { mutate: annotationMutate } = useMutation({
        mutationFn: postAnnotation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['annotations', materialId, selectedChangeId] });
            form.reset();
        },
    });

    const { mutate: changeMutate } = useMutation({
        mutationFn: setHtmlString,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['changes', materialId.toString()] });
        },
    });

    const { highlightSwitchSelection } = useHighlight();

    const onSubmit = (data: AnnotationInput) => {
        if (selectionId) {
            highlightSwitchSelection();

            changeMutate({
                id: selectedChangeId,
                htmlString:
                    oldContentsRef.current ? oldContentsRef.current.innerHTML : currentContentsRef.current!.innerHTML,
            });

            setSelectionId(null);
        }

        annotationMutate({
            annotation: {
                changeId: selectedChangeId,
                annotation: data.annotation,
                parentId: replyTo?.annotationId || null,
                selectionId,
            },
        });
    };

    const removeHighlight = useCallback(() => {
        if (selectionId) {
            const element = document.getElementById(selectionId);
            if (element) element.style.backgroundColor = '';
            setSelectionId(null);
        }
    }, [selectionId, setSelectionId]);

    return (
        <Form {...form}>
            <form className='w-full flex flex-col items-end gap-2' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name='annotation'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <div className='w-full flex items-center justify-end gap-2'>
                                {replyTo && (
                                    <TooltipWrapper
                                        tooltip={`You are replying to ${replyTo.name}. Click to remove the reply status.`}
                                    >
                                        <MessageSquareReply
                                            className='w-6 h-6 flex-shrink-0 hover:cursor-pointer'
                                            onClick={() => setReplyTo(null)}
                                        />
                                    </TooltipWrapper>
                                )}
                                {selectionId && (
                                    <TooltipWrapper
                                        tooltip={`You're annotation will be linked to the selected text. Click to remove the link.`}
                                    >
                                        <Highlighter
                                            className='w-6 h-6 !m-0 flex-shrink-0 hover:cursor-pointer'
                                            onClick={() => removeHighlight()}
                                        />
                                    </TooltipWrapper>
                                )}
                                <FormControl>
                                    <Input
                                        className='!m-0 flex-grow max-w-xs'
                                        placeholder='Add a new annotation...'
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage className='w-fit ml-auto' />
                        </FormItem>
                    )}
                />
                <Button className='w-full max-w-40' type='submit'>
                    Add Annotation
                </Button>
            </form>
        </Form>
    );
};
AddAnnotation.displayName = 'AddAnnotation';
export default AddAnnotation;
