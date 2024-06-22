import { useShallow } from 'zustand/react/shallow';
import { memo, useEffect, useRef, type FC, type ReactElement } from 'react';
import AnnotationsFrame from '@/src/components/Annotations/AnnotationsFrame';
import { Assignment, File, MaterialLayout, Module, Page, Quiz, Section } from '@/src/components/Materials';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/src/components/ui/resizable';
import { useChangeContext } from '@/src/stores/ChangeStore/useCompareIdStore';
import { useCompareWindowStore } from '@/src/stores/CompareWindowStore';
import { ItemTypes, type Change } from '@/src/api/change';
import { useHighlight } from '@/src/hooks/useHighlighter';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';

type ComparePanelProps = { changes: Change[] };
const ComparePanel: FC<ComparePanelProps> = memo(({ changes }): ReactElement => {
    const { openAnnotations, viewMode } = useCompareWindowStore(
        useShallow((state) => ({
            openAnnotations: state.openAnnotations,
            viewMode: state.viewMode,
        }))
    );

    const { selectedChangeId, materialId } = useChangeContext(
        useShallow((state) => ({
            selectedChangeId: state.selectedChangeId,
            materialId: state.materialId,
        }))
    );

    const oldContentsRef = useRef<HTMLDivElement>(null);
    const currentContentsRef = useRef<HTMLDivElement>(null);

    const { setOldContentsRef, setCurrentContentsRef, setChanged } = useAnnotationStore(
        useShallow((state) => ({
            setOldContentsRef: state.setOldContentsRef,
            setCurrentContentsRef: state.setCurrentContentsRef,
            setChanged: state.setChanged,
        }))
    );

    useEffect(() => {
        setOldContentsRef(oldContentsRef);
        setCurrentContentsRef(currentContentsRef);
    }, [setOldContentsRef, setCurrentContentsRef]);

    const { highlight, removeHighlight } = useHighlight();

    const prevChange = changes.find((change) => change.id === selectedChangeId)!;
    const curChange = changes[changes.length - 1];

    return (
        <ResizablePanelGroup
            autoSaveId='compare-annotation'
            className='w-full flex-grow'
            direction='horizontal'
            id='compare-panel'
        >
            <ResizablePanel defaultSize={60} id='panel1' order={1}>
                <ResizablePanelGroup
                    autoSaveId='compare-panel'
                    className='w-full flex-grow'
                    direction={viewMode === 'vertical' ? 'vertical' : 'horizontal'}
                >
                    {viewMode !== 'after' && (
                        <ResizablePanel defaultSize={50} id='panel11' order={1}>
                            <MaterialLayout
                                change={prevChange}
                                status={
                                    prevChange.id === curChange.id ? 'no_changes'
                                    : curChange.id === -1 ?
                                        'no_selection'
                                    :   'ok'
                                }
                                version='prev'
                            >
                                {prevChange.html_string ?
                                    <div
                                        className='h-full'
                                        onMouseUp={() => highlight(oldContentsRef, currentContentsRef, setChanged)}
                                        onMouseDown={removeHighlight}
                                        ref={oldContentsRef}
                                        id='old-contents'
                                        dangerouslySetInnerHTML={{ __html: prevChange.html_string }}
                                    />
                                :   <div
                                        className='h-full'
                                        onMouseUp={() => highlight(oldContentsRef, currentContentsRef, setChanged)}
                                        onMouseDown={removeHighlight}
                                        ref={oldContentsRef}
                                        id='old-contents'
                                    >
                                        <RenderMaterial change={prevChange} materialId={materialId} />
                                    </div>
                                }
                            </MaterialLayout>
                        </ResizablePanel>
                    )}
                    {viewMode !== 'after' && viewMode !== 'before' && <ResizableHandle withHandle />}
                    {viewMode !== 'before' && (
                        <ResizablePanel defaultSize={50} id='panel12' order={2}>
                            <MaterialLayout status='ok' version='current'>
                                {curChange.html_string ?
                                    <div
                                        className='h-full'
                                        onMouseUp={() => highlight(oldContentsRef, currentContentsRef, setChanged)}
                                        onMouseDown={removeHighlight}
                                        ref={currentContentsRef}
                                        id='current-contents'
                                        dangerouslySetInnerHTML={{ __html: curChange.html_string }}
                                    />
                                :   <div
                                        className='h-full'
                                        onMouseUp={() => highlight(oldContentsRef, currentContentsRef, setChanged)}
                                        onMouseDown={removeHighlight}
                                        ref={currentContentsRef}
                                        id='current-contents'
                                    >
                                        <RenderMaterial change={curChange} materialId={materialId} />
                                    </div>
                                }
                            </MaterialLayout>
                        </ResizablePanel>
                    )}
                </ResizablePanelGroup>
            </ResizablePanel>
            {openAnnotations && (
                <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40} id='panel2' order={2}>
                        <AnnotationsFrame />
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>
    );
});
ComparePanel.displayName = 'ComparePanel';
export default ComparePanel;

type RenderMaterialProps = {
    change: Change;
    materialId: number;
};

const RenderMaterial: FC<RenderMaterialProps> = memo(({ change, materialId }): ReactElement => {
    const materialItemType = Object.values(ItemTypes)[materialId] as ItemTypes;
    switch (materialItemType) {
        case ItemTypes.SECTIONS:
            return <Section change={change} />;
        case ItemTypes.MODULES:
            return <Module change={change} />;
        case ItemTypes.PAGES:
            return <Page change={change} />;
        case ItemTypes.FILES:
            return <File change={change} />;
        case ItemTypes.ASSIGNMENTS:
            return <Assignment change={change} />;
        case ItemTypes.QUIZZES:
            return <Quiz change={change} />;
        default:
            return <p>Course material type not found.</p>;
    }
});
RenderMaterial.displayName = 'RenderMaterial';
