import Annotations from '../components/Annotations';
import { addWeeks, differenceInWeeks, format, max, min, subWeeks } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '../components/ui/input';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { postAnnotation } from '../api/annotation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/src/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useGlobalContext } from '../stores/GlobalStore/useGlobalStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import {
    Legend,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    type TooltipProps,
} from 'recharts';
import { ChangeType, getChangesByMaterial, ItemTypes, type Change } from '../api/change';

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

    const typeToColor = useCallback((type: string) => {
        switch (type) {
            case ChangeType.CREATE:
                return '#6f4e7c';
            case ChangeType.DELETE:
                return '#0b84a5';
            case ChangeType.UPDATE:
                return '#f6c85f';
            default:
                return '#9dd866';
        }
    }, []);

    const formatXAxis = useCallback((tickItem: number) => {
        return format(new Date(tickItem), 'yyyy-MM-dd');
    }, []);

    const timeLineData = useMemo(() => {
        if (!changes.length) return [];

        return changes.map((change) => ({
            changeId: change.id,
            date: new Date(change.change_date).getTime(),
            fill: typeToColor(change.change_type),
            height: 2.5,
        }));
    }, [changes, typeToColor]);

    const { tickCount, earliestDate, latestDate } = useMemo(() => {
        if (!changes.length) return { tickCount: 0, earliestDate: 0, latestDate: 0 };

        // The earliestDate and latestDate are buffered such that the first and last ticks are not on the edge of the chart.
        const timestamps = changes.map((change) => new Date(change.change_date));
        const earliestDate = subWeeks(new Date(min(timestamps)), 1).getTime();
        const latestDate = addWeeks(new Date(max(timestamps)), 1).getTime();
        const tickCount = differenceInWeeks(latestDate, earliestDate);

        return { tickCount, earliestDate, latestDate };
    }, [changes]);

    const customTooltip = useCallback(({ active, payload }: TooltipProps<ValueType, NameType>) => {
        if (!active || !payload) return null;

        const date = new Date(payload[0].payload.date);
        const formattedDate = format(date, 'yyyy-MM-dd');

        return (
            <div className='m-0 z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'>
                <p className='text-sm'>Date: {formattedDate}</p>
            </div>
        );
    }, []);

    const { theme } = useTheme();

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error...</p>;

    const cardBgColor = theme === 'light' ? 'hsl(0 0% 100%)' : 'hsl(24 9.8% 10%)';
    const textColor = theme === 'light' ? 'black' : 'white';

    // TODO: Change with actual difference.
    const diffBeforeHTML = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        background-color: ${cardBgColor};
                    }

                    h1 {
                        color: ${textColor};
                    }
                </style>
            </head>
            <body>
                <h1>This is a placeholder for the before view.</h1>
            </body>
        </html>
    `;

    const diffAfterHTML = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        background-color: ${cardBgColor};
                    }

                    h1 {
                        color: ${textColor};
                    }
                </style>
            </head>
            <body>
                <h1>This is a placeholder for the after view.</h1>
            </body>
        </html>
    `;

    return (
        <div className='w-full h-full flex flex-col'>
            <h1 className='text-4xl'>{Object.values(ItemTypes)[+materialId!]}</h1>
            <div className='w-full flex-grow py-4 overflow-hidden'>
                <ResizablePanelGroup direction='vertical'>
                    <ResizablePanel defaultSize={75}>
                        <ResizablePanelGroup direction='horizontal'>
                            <ResizablePanel defaultSize={75}>
                                <div className='border h-full'>
                                    <ResizablePanelGroup direction='vertical'>
                                        <ResizablePanel defaultSize={50}>
                                            <iframe className='w-full h-full' srcDoc={diffBeforeHTML} title='before' />
                                        </ResizablePanel>
                                        <ResizableHandle withHandle />
                                        <ResizablePanel defaultSize={50}>
                                            <iframe className='w-full h-full' srcDoc={diffAfterHTML} title='after' />
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={25}>
                                <div className='border h-full overflow-hidden'>
                                    <Card className='flex flex-col overflow-auto h-full'>
                                        <CardHeader>
                                            <CardTitle>Annotations</CardTitle>
                                            <CardDescription>
                                                View and add annotations to this course change
                                            </CardDescription>
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
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25}>
                        <Card className='h-full'>
                            <CardContent className='h-full w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <ScatterChart
                                        data={timeLineData}
                                        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                                    >
                                        <XAxis
                                            dataKey='date'
                                            domain={[earliestDate, latestDate]}
                                            strokeWidth={1}
                                            tickCount={tickCount}
                                            tickFormatter={formatXAxis}
                                            tickLine={{ stroke: theme === 'light' ? 'black' : 'white' }}
                                            type='number'
                                        />
                                        <YAxis dataKey='height' domain={[0, 5]} hide type='number' />
                                        <RechartsTooltip content={customTooltip} />
                                        <Legend
                                            wrapperStyle={{ userSelect: 'none' }}
                                            payload={[
                                                {
                                                    value: 'Create',
                                                    type: 'square',
                                                    color: typeToColor(ChangeType.CREATE),
                                                },
                                                {
                                                    value: 'Delete',
                                                    type: 'square',
                                                    color: typeToColor(ChangeType.DELETE),
                                                },
                                                {
                                                    value: 'Update',
                                                    type: 'square',
                                                    color: typeToColor(ChangeType.UPDATE),
                                                },
                                            ]}
                                        />
                                        <Scatter
                                            onDoubleClick={(data) => {
                                                setCurChangeId(data.changeId.toString());
                                                navigate(`/${materialId}/${data.changeId}`);
                                            }}
                                            name='Changes'
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
};
Material.displayName = 'Material';
export default Material;
