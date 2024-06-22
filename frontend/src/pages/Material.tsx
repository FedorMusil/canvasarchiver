import ChangeStoreProvider from '../stores/ChangeStore/ChangeStore';
import CompareHeader from '../components/Compare/CompareHeader';
import ComparePanel from '@/src/components/Compare/ComparePanel';
import TimelineDrawer from '../components/Timeline';
import { Separator } from '@/src/components/ui/separator';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type FC, type ReactElement } from 'react';
import { getChangesByMaterial, ItemTypes, type Change } from '../api/change';

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
        queryFn: async () => await getChangesByMaterial(materialId),
    });

    const [sortedChanges, setChanges] = useState<Change[]>([]);
    const [selectedChange, setSelectedChange] = useState<number | null>(changeIdParam ? +changeIdParam : null);
    useEffect(() => {
        if (changesData) {
            const sortedChanges = changesData.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            setChanges(sortedChanges);
            if (!selectedChange) setSelectedChange(changesData[changesData.length - 1].id);
        }
    }, [changesData, selectedChange]);

    if (isLoading || selectedChange === null) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;

    return (
        <ChangeStoreProvider selectedChangeId={selectedChange} materialId={+materialId}>
            <div className='w-full h-full flex flex-col'>
                <CompareHeader />
                <Separator orientation='horizontal' />
                <ComparePanel changes={sortedChanges} />
                <TimelineDrawer changes={sortedChanges} />
            </div>
        </ChangeStoreProvider>
    );
};
Material.displayName = 'Material';
export default Material;
