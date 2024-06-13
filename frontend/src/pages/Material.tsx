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
        if (!materialId || +materialId < 0 || +materialId >= Object.values(ItemTypes).length) {
            navigate('/');
        }
    }, [materialId, navigate]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['changes', materialId!],
        queryFn: getChangesByMaterial,
    });

    const [changes, setChanges] = useState<Change[]>([]);
    useEffect(() => {
        if (data) {
            // Each change holds a reference to the previous change
            // So we need to sort the changes based on the old_value
            const sortedChanges = data.sort((a, b) => a.old_value - b.old_value);
            setChanges(sortedChanges);
        }
    }, [data]);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading changes</p>;

    return (
        <>
            <div className='flex justify-between'>
                <h1 className='text-4xl'>{Object.values(ItemTypes)[+materialId!]}</h1>
                <h2 className='text-2xl'>Annotations</h2>
            </div>
        </>
    );
};
Material.displayName = 'Material';
export default Material;
