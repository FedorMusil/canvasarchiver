import type { Change } from '@/src/api/change';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { format } from 'date-fns';
import { memo, useEffect, useState, type FC, type ReactElement } from 'react';
import { Button } from '../ui/Button';

type MaterialLayoutProps = {
    change?: Change;
    children?: ReactElement;
    hideButton?: boolean;
    onClick: () => void;
    status: 'no_changes' | 'no_selection' | 'ok';
    version: 'prev' | 'current';
    setMounted: (mounted: boolean) => void;
};

const MaterialLayout: FC<MaterialLayoutProps> = memo(
    ({ change, children, hideButton, onClick, status, version, setMounted }): ReactElement => {
        if (status !== 'ok' && version === 'current') throw new Error('status must be ok for current version');

        const [showDifference, setShowDifference] = useState<boolean>(false);
        useEffect(() => {
            setMounted(true);
        }, [setMounted]);

        return (
            <Card className='h-full flex flex-col overflow-auto'>
                {change && (
                    <CardHeader className='flex-row flex-shrink-0 justify-between gap-4'>
                        <div className='flex flex-col gap-2'>
                            <CardTitle>
                                {version === 'prev' ?
                                    `Previous Version ${status === 'ok' && `(ID: ${change.id})`}`
                                :   'Current Version'}
                            </CardTitle>
                            <CardDescription className='max-w-[600px] text-justify'>
                                {version === 'prev' ?
                                    `This is an older version of the course material. It was last in use on ${format(new Date(change.timestamp), 'PPpp')}.`
                                :   `This is the most recent version of the course material, currently being used in the Canvas course. It was created ${format(new Date(change.timestamp), 'PPpp')}.`
                                }
                            </CardDescription>
                        </div>
                        {!hideButton && (
                            <Button
                                className='m-0 w-40'
                                onClick={() => {
                                    setShowDifference((prev) => !prev);
                                    onClick?.();
                                }}
                                variant='secondary'
                            >
                                {version === 'prev' ?
                                    'Restore this version'
                                :   `${showDifference ? 'Hide' : 'Show'} changes`}
                            </Button>
                        )}
                    </CardHeader>
                )}
                <CardContent className={`flex-grow ${(!change || status !== 'ok') && 'grid place-content-center'}`}>
                    {!change || status === 'no_changes' ?
                        'No changes have been made to this course material.'
                    : status === 'no_selection' ?
                        'Please select a change from the timeline to view the course material.'
                    :   children}
                </CardContent>
            </Card>
        );
    }
);
MaterialLayout.displayName = 'MaterialLayout';
export default MaterialLayout;