import { Button } from '@/src/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { postAnnotation } from '@/src/api/annotation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useCompareIdContext } from '@/src/stores/CompareIdStore/useCompareIdStore';
import { useForm } from 'react-hook-form';
import { useGlobalContext } from '@/src/stores/GlobalStore/useGlobalStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { minLength, object, pipe, string, trim, type InferInput } from 'valibot';
import { useCallback, useEffect, type FC, type ReactElement } from 'react';

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

    const { mutate, status } = useMutation({
        mutationFn: postAnnotation,
    });

    const queryClient = useQueryClient();
    useEffect(() => {
        if (status === 'success') queryClient.invalidateQueries({ queryKey: ['annotations', materialId, changeId] });
    }, [status, queryClient, materialId, changeId]);

    const onSubmit = useCallback(
        (data: AnnotationInput) => {
            mutate({
                annotation: {
                    annotation: data.annotation,
                    parentId: replyTo?.annotationId || null,
                    changeId,
                    userId: userCode,
                    selectedText: null,
                    selectionStart: null,
                    selectionEnd: null,
                },
            });
        },
        [changeId, mutate, replyTo?.annotationId, userCode]
    );

    return (
        <Form {...form}>
            <form className='w-full flex flex-col items-end gap-2' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name='annotation'
                    render={({ field }) => (
                        <FormItem className='w-full max-w-sm'>
                            <FormControl>
                                <Input className='' placeholder='Add a new annotation...' {...field} />
                            </FormControl>
                            {replyTo && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <FormDescription
                                                className='hover:line-through w-fit'
                                                onClick={() => setReplyTo(null)}
                                            >
                                                Replying to{' '}
                                                {replyTo.userId === Number(userCode) ? 'yourself' : replyTo.name}
                                            </FormDescription>
                                        </TooltipTrigger>
                                        <TooltipContent sideOffset={10}>
                                            <p>
                                                Click to cancel replying to{' '}
                                                {replyTo.userId === Number(userCode) ? 'yourself' : replyTo.name}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <FormMessage />
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
