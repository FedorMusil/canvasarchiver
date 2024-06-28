// --- Imports ---
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { lazy, memo, Suspense, type FC, type ReactElement } from 'react';

// --- Lazy imports ---
const AddAnnotation = lazy(() => import('./AddAnnotation'));
const Annotations = lazy(() => import('./Annotations'));

const AnnotationsFrame: FC = memo((): ReactElement => {
    return (
        <Card className='flex flex-col overflow-auto w-full h-full rounded-none'>
            <Suspense fallback={null}>
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
            </Suspense>
        </Card>
    );
});
AnnotationsFrame.displayName = 'AnnotationsFrame';
export default AnnotationsFrame;
