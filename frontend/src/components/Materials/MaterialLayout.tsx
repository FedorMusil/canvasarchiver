import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import type { Change } from '@/src/api/change';
import { format } from 'date-fns';
import { memo, useState, type FC, type ReactElement } from 'react';
import { Button } from '../ui/Button';

type MaterialLayoutProps = {
    change?: Change;
    children: ReactElement;
    onClick?: () => void;
    status: 'no_changes' | 'no_selection' | 'ok';
    version: 'prev' | 'current';
};

const MaterialLayout: FC<MaterialLayoutProps> = memo(({ change, children, onClick, status, version }): ReactElement => {
    if (version === 'prev' && !change) throw new Error('change is required for prev version');
    if (status !== 'ok' && version === 'current') throw new Error('status must be ok for current version');

    const [showDifference, setShowDifference] = useState<boolean>(false);

    return (
        <Card className='h-full flex flex-col'>
            <CardHeader className='flex-row flex-shrink-0 justify-between'>
                <div className='flex flex-col gap-2'>
                    <CardTitle>
                        {version === 'prev' ?
                            `Previous Version ${status === 'ok' && `(ID: ${change!.id})`}`
                        :   'Current Version'}
                    </CardTitle>
                    <CardDescription>
                        {version === 'prev' ?
                            `This is an older version of the course material. It was last active on ${format(new Date(change!.timestamp), 'PP')}`
                        :   'This is the most recent version of the course material, currently being used in the Canvas course.'
                        }
                    </CardDescription>
                </div>
                {version === 'current' && (
                    <Button
                        className='m-0'
                        onClick={() => {
                            setShowDifference((prev) => !prev);
                            onClick?.();
                        }}
                        variant='secondary'
                    >
                        {showDifference ? 'Hide' : 'Show'} difference
                    </Button>
                )}
            </CardHeader>
            <CardContent className={`flex-grow ${status !== 'ok' && 'grid place-content-center'}`}>
                {status === 'no_changes' ?
                    'No changes have been made to this course material.'
                : status === 'no_selection' ?
                    'Please select a change from the timeline to view the course material.'
                :   children}
            </CardContent>
        </Card>
    );
});
MaterialLayout.displayName = 'MaterialLayout';
export default MaterialLayout;
