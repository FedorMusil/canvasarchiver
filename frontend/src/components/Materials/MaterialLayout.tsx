import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import type { Change } from '@/src/api/change';
import { format } from 'date-fns';
import { memo, type FC, type ReactElement } from 'react';

type MaterialLayoutProps = {
    change?: Change;
    children: ReactElement;
    status: 'no_changes' | 'no_selection' | 'ok';
    version: 'prev' | 'current';
};

const MaterialLayout: FC<MaterialLayoutProps> = memo(({ change, children, status, version }): ReactElement => {
    if (version === 'prev' && !change) throw new Error('change is required for prev version');
    if (status !== 'ok' && version === 'current') throw new Error('status must be ok for current version');

    return (
        <Card className='h-full flex flex-col'>
            <CardHeader className='flex-shrink-0'>
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
