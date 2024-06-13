import Annotations from '../components/Annotations';
import { Button } from '../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/src/components/ui/card';
import { Input } from '../components/ui/input';
import { postAnnotation } from '../api/annotation';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../components/ui/tooltip';
import { useGlobalContext } from '../stores/GlobalStore/useGlobalStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getChangesByMaterial, ItemTypes, type Change } from '../api/change';
import { useEffect, useState, type FC } from 'react';

export type RouteParams = {
    'material-id': string;
    'change-id'?: string;
};

const Material: FC = () => {
    const { 'material-id': materialId, 'change-id': changeId } = useParams<RouteParams>();

    const navigate = useNavigate();
    useEffect(() => {
        if (!materialId || isNaN(+materialId) || +materialId < 0 || +materialId >= Object.values(ItemTypes).length) {
            navigate('/');
        }
    }, [materialId, navigate]);

    const {
        data: changesData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['changes', materialId!],
        queryFn: getChangesByMaterial,
    });

    const { userId } = useGlobalContext((state) => ({
        userId: state.userCode,
    }));

    const [changes, setChanges] = useState<Change[]>([]);
    const [curChangeId, setCurChangeId] = useState<string | null>(changeId || null);

    const [responseTo, setResponseTo] = useState<{ annotationId: number; name: string } | null>(null);

    const { mutate, status } = useMutation({
        mutationFn: postAnnotation,
    });

    const queryClient = useQueryClient();
    useEffect(() => {
        if (status === 'success')
            queryClient.invalidateQueries({ queryKey: ['annotations', materialId!, curChangeId!] });
    }, [status, queryClient, materialId, curChangeId]);

    const AddAnnotation = (annotation: string) => {
        if (!curChangeId) return;

        if (typeof annotation !== 'string' || annotation.length === 0) return;

        mutate({
            annotation: {
                annotation,
                parentId: responseTo?.annotationId || null,
                changeId: +curChangeId,
                userId,
                selectedText: null,
                selectionStart: null,
                selectionEnd: null,
            },
        });
    };

    useEffect(() => {
        if (changesData) {
            // Each change holds a reference to the previous change
            // So we need to sort the changes based on the old_value
            const sortedChanges = changesData.sort((a, b) => a.old_value - b.old_value);
            setChanges(sortedChanges);

            if (!changeId) setCurChangeId(sortedChanges[0].id.toString());
        }
    }, [changesData, changeId]);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error...</p>;

    return (
        <div className='w-full h-full flex flex-col'>
            <h1 className='text-4xl'>{Object.values(ItemTypes)[+materialId!]}</h1>
            <div
                className='grid w-full flex-grow gap-4 py-4 overflow-hidden'
                style={{ gridTemplateColumns: '8fr 2fr', gridTemplateRows: '8fr 2fr' }}
            >
                <div className='border border-red-500 grid gap-2' style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}>
                    <div className='border border-blue-500'>Block 1.1</div>
                    <div className='border border-blue-500'>Block 1.2</div>
                </div>
                <div
                    className='border border-red-500 h-full overflow-hidden'
                    style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}
                >
                    <Card className='flex flex-col overflow-auto h-full'>
                        <CardHeader>
                            <CardTitle>Annotations</CardTitle>
                            <CardDescription>View and add annotations to this course change</CardDescription>
                        </CardHeader>
                        <CardContent className='flex-grow overflow-hidden'>
                            {curChangeId ?
                                <Annotations
                                    changeId={curChangeId}
                                    materialId={materialId!}
                                    setResponseTo={setResponseTo}
                                />
                            :   <div>Loading...</div>}
                        </CardContent>
                        <CardFooter className='mt-auto'>
                            <form
                                className='flex flex-col gap-2 w-full'
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const form = event.target as HTMLFormElement;
                                    const annotation = (form.elements[0] as HTMLInputElement).value;
                                    AddAnnotation(annotation);
                                }}
                            >
                                <Input placeholder='Add a new annotation...' />
                                <div className='flex w-full justify-between gap-2'>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p
                                                    className='text-xs text-muted-foreground h-fit hover:line-through'
                                                    onClick={() => setResponseTo(null)}
                                                >
                                                    {responseTo && `Responding to ${responseTo.name}`}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent side='bottom'>
                                                <p className='text-xs text-muted-foreground'>
                                                    Click to remove 'reply to' status
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <Button
                                        aria-disabled={status === 'pending' || status === 'error'}
                                        className='self-end'
                                        disabled={status === 'pending' || status === 'error'}
                                        type='submit'
                                    >
                                        Add Annotation
                                    </Button>
                                </div>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
                <div className='border border-red-500' style={{ gridColumn: '1 / 3', gridRow: '2 / 3' }}>
                    Block 3
                </div>
            </div>
        </div>
    );
};
Material.displayName = 'Material';
export default Material;
