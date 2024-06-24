import { postAnnotation } from '@/src/api/annotation';
import { setHighlight } from '@/src/api/change';
import { Button } from '@/src/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { useHighlight } from '@/src/hooks/useHighlighter';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useChangeContext } from '@/src/stores/ChangeStore/useCompareIdStore';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FC, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { minLength, object, pipe, string, trim, type InferInput } from 'valibot';
import { useShallow } from 'zustand/react/shallow';

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

    const { selectedChangeId, materialId, curChangeId, highlighter, modifiedPanel } = useChangeContext(
        useShallow((state) => ({
            selectedChangeId: state.selectedChangeId,
            materialId: state.materialId,
            curChangeId: state.curChangeId,
            highlighter: state.highlighter,
            modifiedPanel: state.modifiedPanel,
        }))
    );

    const { replyTo, setReplyTo, selectionId, setSelectionId, prevRef, curRef } = useAnnotationStore(
        useShallow((state) => ({
            replyTo: state.replyTo,
            setReplyTo: state.setReplyTo,
            selectionId: state.selectionId,
            setSelectionId: state.setSelectionId,
            prevRef: state.prevRef,
            curRef: state.curRef,
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

    const { getAllHighlights, removeAllHighlights } = useHighlight();

    const { mutate: changeMutate } = useMutation({
        mutationFn: setHighlight,
        onSuccess: () => {
            removeAllHighlights(highlighter);
            queryClient.invalidateQueries({ queryKey: ['changes', materialId.toString()] });
        },
    });

    const onSubmit = (data: AnnotationInput) => {
        // @ts-expect-error - It works, so I don't care.
        if (selectionId && highlighter.getHighlightForElement(document.querySelector(`.highlight-${selectionId}`))) {
            const subtree = modifiedPanel === 'prev' ? prevRef.current! : curRef.current!;
            const highlights = getAllHighlights(subtree, highlighter);

            changeMutate({
                changeId: modifiedPanel === 'prev' ? selectedChangeId : curChangeId,
                highlights,
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

        setReplyTo(null);
    };

    return (
        <Form {...form}>
            <form className='w-full flex flex-col items-end gap-2' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name='annotation'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <div className='w-full flex items-center justify-end gap-2'>
                                <FormControl>
                                    <Input
                                        className='!m-0 flex-grow max-w-xs'
                                        placeholder={
                                            replyTo ? `Replying to ${replyTo.name} ...` : 'Add a new annotation ...'
                                        }
                                        id='annotation-input'
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage className='w-fit ml-auto' />
                        </FormItem>
                    )}
                />
                <Button className='w-full max-w-40' type='submit'>
                    Add annotation
                </Button>
            </form>
        </Form>
    );
};
AddAnnotation.displayName = 'AddAnnotation';
export default AddAnnotation;
