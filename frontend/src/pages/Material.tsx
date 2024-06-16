import CompareHeader from '../components/Compare/CompareHeader';
import CompareIdStoreProvider from '../stores/CompareIdStore/CompareIdStore';
import ComparePanel from '@/src/components/Compare/ComparePanel';
import TimelineDrawer from '../components/Timeline';
import { Separator } from '@/src/components/ui/separator';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getChangesByMaterial, ItemTypes, type Change } from '../api/change';
import { useEffect, useState, type FC, type ReactElement } from 'react';

const useRequiredParams = <T extends Record<string, unknown>>() => useParams() as T;
const Material: FC = (): ReactElement => {
    // Get URL params. Material ID is required and comes from the URL. Change ID is optional and comes from the query string
    const { materialId } = useRequiredParams<{ materialId: string }>();
    const queryParams = new URLSearchParams(useLocation().search);
    const changeIdParam = queryParams.get('changeId');

    // Redirect to home if the material ID is invalid.
    const navigate = useNavigate();
    useEffect(() => {
        if (+materialId < 0 || +materialId >= Object.values(ItemTypes).length) navigate('/');
    }, [materialId, navigate]);

    const {
        data: changesData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['changes', materialId],
        queryFn: getChangesByMaterial,
    });

    const [sortedChanges, setChanges] = useState<Change[]>([]);
    const [selectedChange, setSelectedChange] = useState<number | null>(changeIdParam ? +changeIdParam : null);
    useEffect(() => {
        if (changesData) {
            // Each change holds a reference to the previous change
            // So we need to sort the changes based on the old_value
            const sortedChanges = changesData.sort(
                (a, b) => new Date(a.change_date).getTime() - new Date(b.change_date).getTime()
            );
            setChanges(sortedChanges);

            if (!selectedChange) setSelectedChange(changesData[changesData.length - 1].id);
        }
    }, [changesData, selectedChange]);

    if (isLoading || selectedChange === null) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;

    return (
        <CompareIdStoreProvider
            changeId={selectedChange}
            materialId={+materialId}
            change={sortedChanges.filter((change) => change.id === selectedChange)[0]}
        >
            <div className='w-full h-full flex flex-col'>
                <CompareHeader />
                <Separator orientation='horizontal' />
                <ComparePanel />
                <TimelineDrawer changes={sortedChanges} />
            </div>
        </CompareIdStoreProvider>
    );
};
Material.displayName = 'Material';
export default Material;
