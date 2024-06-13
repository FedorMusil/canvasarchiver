import { getAnnotationsByChange } from '../api/annotation';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
        isLoading: loadingChanges,
        isError: errorChanges,
    } = useQuery({
        queryKey: ['changes', materialId!],
        queryFn: getChangesByMaterial,
    });

    const [changes, setChanges] = useState<Change[]>([]);

    const {
        data: annotationData,
        isLoading: loadingAnnotations,
        isError: errorAnnotations,
    } = useQuery({
        queryKey: [
            'annotations',
            materialId!,
            changeId ? changeId
            : changes.length ? changes[0].id.toString()
            : '',
        ],
        queryFn: getAnnotationsByChange,
        enabled: !!changeId || !!changes.length,
    });

    useEffect(() => {
        if (changesData) {
            // Each change holds a reference to the previous change
            // So we need to sort the changes based on the old_value
            const sortedChanges = changesData.sort((a, b) => a.old_value - b.old_value);
            setChanges(sortedChanges);
        }
    }, [changesData]);

    if (loadingChanges || loadingAnnotations) return <p>Loading...</p>;
    if (errorChanges || errorAnnotations) return <p>Error loading changes</p>;

    return (
        <div className='w-full h-[calc(100dvh-56px)] md:h-[calc(100dvh-80px)] flex flex-col'>
            <div className='grid w-full' style={{ gridTemplateColumns: '8fr 2fr', gridTemplateRows: '8fr 2fr' }}>
                <h1 className='text-4xl'>{Object.values(ItemTypes)[+materialId!]}</h1>
                <h2 className='text-2xl text-center'>Annotations</h2>
            </div>
            <div
                className='grid w-full flex-grow gap-4'
                style={{ gridTemplateColumns: '8fr 2fr', gridTemplateRows: '8fr 2fr' }}
            >
                <div className='border border-red-500 grid gap-2' style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}>
                    <div className='border border-blue-500'>Block 1.1</div>
                    <div className='border border-blue-500'>Block 1.2</div>
                </div>
                <div className='border border-red-500' style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
                    Block 2
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
