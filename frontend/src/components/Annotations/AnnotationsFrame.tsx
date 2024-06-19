import AddAnnotation from './AddAnnotation';
import Annotations from './Annotations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { memo, type FC, type ReactElement } from 'react';

const AnnotationsFrame: FC = memo((): ReactElement => {
    return (
        <Card className='flex flex-col overflow-auto w-full h-full rounded-none'>
            <CardHeader>
                <CardTitle>Annotations</CardTitle>
                <CardDescription>View and add annotations to this course change</CardDescription>
            </CardHeader>
            <CardContent className='flex-grow overflow-hidden'>
                <Annotations />
            </CardContent>
            <CardFooter className='mt-auto'>
                <AddAnnotation />
            </CardFooter>
        </Card>
    );
});
AnnotationsFrame.displayName = 'AnnotationsFrame';
export default AnnotationsFrame;
