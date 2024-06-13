import { getAnnotationsByChange } from '@/src/api/annotation';
import { useQuery } from '@tanstack/react-query';
import { memo, type FC } from 'react';

type AnnotationsProps = {
    changeId: string;
    materialId: string;
};

const Annotations: FC<AnnotationsProps> = memo(({ changeId, materialId }) => {
    const {
        data: annotationData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['annotations', materialId, changeId],
        queryFn: getAnnotationsByChange,
    });

    if (isLoading) return <p>Loading...</p>;
    if (isError || !annotationData) return <p>Error...</p>;

    return (
        <div className='w-full h-full overflow-y-auto'>
            {annotationData.map((annotation) => (
                <div key={annotation.id}>
                    <p>{annotation.annotation}</p>
                </div>
            ))}
            {annotationData.map((annotation) => (
                <div key={annotation.id}>
                    <p>{annotation.annotation}</p>
                </div>
            ))}
            {annotationData.map((annotation) => (
                <div key={annotation.id}>
                    <p>{annotation.annotation}</p>
                </div>
            ))}
            {annotationData.map((annotation) => (
                <div key={annotation.id}>
                    <p>{annotation.annotation}</p>
                </div>
            ))}
            {annotationData.map((annotation) => (
                <div key={annotation.id}>
                    <p>{annotation.annotation}</p>
                </div>
            ))}
        </div>
    );
});
Annotations.displayName = 'Annotations';
export default Annotations;
