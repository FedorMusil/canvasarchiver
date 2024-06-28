// --- Imports ---
import ChangeStoreProvider from '../stores/ChangeStore/ChangeStore';
import { Separator } from '@/src/components/ui/separator';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useState, type FC, type ReactElement } from 'react';
import { getChangesByMaterial, ItemTypes, type Change } from '../api/change';

// --- Rangy imports ---
// @ts-expect-error - The types for rangy do not seem correct.
import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier.js';
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-textrange';

// --- Lazy imports ---
const CompareHeader = lazy(() => import('../components/Compare/CompareHeader'));
const ComparePanel = lazy(() => import('../components/Compare/ComparePanel'));
const TimelineDrawer = lazy(() => import('../components/Timeline'));

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
    const [highlighter] = useState(rangy.createHighlighter(document, 'TextRange'));

    useEffect(() => {
        console.log('Changes data:', changesData)
        if (changesData) {
            const sortedChanges = changesData.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            setChanges(sortedChanges);
            console.log('Sorted changes:', sortedChanges)

            // If there is no more than once change, no changes have been made to the material.
            // In this case, the user cannot select a previous change.
            console.log('Selected change before:', selectedChange)
            if (changesData.length <= 1) {
                console.log('Setting selected change to:', sortedChanges[sortedChanges.length - 1].id)
                setSelectedChange(sortedChanges[sortedChanges.length - 1].id);
            }
            else if (selectedChange && selectedChange === sortedChanges[sortedChanges.length - 1].id) {
                console.log('Setting selected change to:', -1)
                setSelectedChange(-1);
            }
            else if (!selectedChange) {
                console.log('Setting selected change to:', sortedChanges[sortedChanges.length - 2].id)
                setSelectedChange(sortedChanges[sortedChanges.length - 2].id);
            }
            setSelectedChange(7);
            console.log('Selected change after:', selectedChange)
        }
    }, [changesData, setSelectedChange]);

    if (isLoading || selectedChange === null) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;

    return (
        <ChangeStoreProvider
            curChangeId={sortedChanges[sortedChanges.length - 1].id}
            selectedChangeId={selectedChange}
            materialId={+materialId}
            highlighter={highlighter}
        >
            <div className='w-full h-[calc(100dvh-56px)] md:h-[calc(100dvh-80px)] flex flex-col'>
                <Suspense fallback={null}>
                    <CompareHeader />
                    <Separator orientation='horizontal' />
                    <ComparePanel changes={sortedChanges} />
                    <TimelineDrawer changes={sortedChanges} />
                </Suspense>
            </div>
        </ChangeStoreProvider>
    );
};
Material.displayName = 'Material';
export default Material;
