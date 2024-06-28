import { ItemTypes, type Change } from '@/src/api/change';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/src/components/ui/resizable';
import { useHighlight } from '@/src/hooks/useHighlighter';
import { useAnnotationStore, useChangeContext, useCompareWindowStore } from '@/src/stores';
import { lazy, memo, Suspense, useEffect, useRef, useState, type FC, type ReactElement } from 'react';
import { visualDomDiff } from 'visual-dom-diff';
import { useShallow } from 'zustand/react/shallow';

// --- Lazy imports ---
const Assignment = lazy(() => import('@/src/components/Materials/Assignment'));
const File = lazy(() => import('@/src/components/Materials/File'));
const Module = lazy(() => import('@/src/components/Materials/Module'));
const MaterialLayout = lazy(() => import('@/src/components/Materials/MaterialLayout'));
const Page = lazy(() => import('@/src/components/Materials/Page'));
const Quiz = lazy(() => import('@/src/components/Materials/Quiz'));
const Section = lazy(() => import('@/src/components/Materials/Section'));
const AnnotationsFrame = lazy(() => import('@/src/components/Annotations/AnnotationsFrame'));

type ComparePanelProps = { changes: Change[] };
const ComparePanel: FC<ComparePanelProps> = memo(({ changes }): ReactElement => {
    const { openAnnotations, viewMode } = useCompareWindowStore(
        useShallow((state) => ({
            openAnnotations: state.openAnnotations,
            viewMode: state.viewMode,
        }))
    );

    const { materialId, highlighter, setModifiedPanel } = useChangeContext(
        useShallow((state) => ({
            materialId: state.materialId,
            highlighter: state.highlighter,
            setModifiedPanel: state.setModifiedPanel,
        }))
    );

    let prevChange: Change | undefined = changes[changes.length - 3];
    let curChange: Change | undefined = undefined;
    if (changes.length > 0) curChange = changes[changes.length - 1];

    const { setPrevRef, setCurRef } = useAnnotationStore(
        useShallow((state) => ({
            setPrevRef: state.setPrevRef,
            setCurRef: state.setCurRef,
        }))
    );

    const prevRef = useRef<HTMLDivElement>(null);
    const curRef = useRef<HTMLDivElement>(null);

    const [showDiff, setShowDiff] = useState<boolean>(false);
    const [diffNode, setDiffNode] = useState<string>('');

    const { highlight, removeHighlight, setHighlights, removeAllHighlights } = useHighlight();
    const changeCurrentContentsRef = () => {
        removeAllHighlights(highlighter);
        setShowDiff((prev) => !prev);
    };

    const [mounted, setMounted] = useState<boolean>(false);
    useEffect(() => {
        if (prevRef.current) setPrevRef(prevRef);
        if (curRef.current) setCurRef(curRef);

        if (prevRef.current && curRef.current) {
            const diffNode: DocumentFragment = visualDomDiff(prevRef.current, curRef.current);
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(diffNode!);
            setDiffNode(tempDiv.innerHTML);
            console.log('tempDiv:', tempDiv.innerHTML)
            console.log('DiffNode:', diffNode);
        }
    }, [setPrevRef, setCurRef, viewMode, prevChange, mounted]);

    useEffect(() => {
        if (!showDiff && prevChange && curChange) {
            if (prevChange.highlights) setHighlights(prevChange.highlights, highlighter);
            if (curChange.highlights) setHighlights(curChange.highlights, highlighter);
        }
        // I don't want to run this effect on all dependencies, since then the comments will be removed with any action.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevChange, curChange, showDiff]);

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
                            <Suspense fallback={null}>
                                <MaterialLayout
                                    change={prevChange}
                                    onClick={() => {}}
                                    status={
                                        prevChange && curChange ?
                                            prevChange.id === curChange.id ?
                                                'no_changes'
                                            : curChange.id === -1 ?
                                                'no_selection'
                                            :   'ok'
                                        :   'no_changes'
                                    }
                                    version='prev'
                                    setMounted={setMounted}
                                >
                                    {prevChange && (
                                        <div
                                            className='h-full'
                                            onMouseUp={() => highlight(highlighter)}
                                            onMouseDown={() => {
                                                setModifiedPanel('prev');
                                                removeHighlight(highlighter);
                                            }}
                                            id='old-contents'
                                            ref={prevRef}
                                        >
                                            <RenderMaterial change={prevChange} materialId={materialId} />
                                        </div>
                                    )}
                                </MaterialLayout>
                            </Suspense>
                        </ResizablePanel>
                    )}
                    {viewMode !== 'after' && viewMode !== 'before' && <ResizableHandle withHandle />}
                    {viewMode !== 'before' && (
                        <ResizablePanel defaultSize={50} id='panel12' order={2}>
                            <Suspense fallback={null}>
                                <MaterialLayout
                                    change={curChange}
                                    hideButton={viewMode === 'after'}
                                    onClick={changeCurrentContentsRef}
                                    status='ok'
                                    version='current'
                                    setMounted={setMounted}
                                >
                                    {curChange &&
                                        (showDiff ?
                                            <div
                                                className='h-full [&_div]:!bg-card [&_span]:!text-text [&_div]:!text-foreground'
                                                dangerouslySetInnerHTML={{ __html: diffNode }}
                                            />
                                        :   <div
                                                className='h-full'
                                                onMouseUp={() => highlight(highlighter)}
                                                onMouseDown={() => {
                                                    setModifiedPanel('cur');
                                                    removeHighlight(highlighter);
                                                }}
                                                id='current-contents'
                                                ref={curRef}
                                            >
                                                <RenderMaterial change={curChange} materialId={materialId} />
                                            </div>)}
                                </MaterialLayout>
                            </Suspense>
                        </ResizablePanel>
                    )}
                </ResizablePanelGroup>
            </ResizablePanel>
            {(prevChange || curChange) && openAnnotations && (
                <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40} id='panel2' order={2}>
                        <Suspense fallback={null}>
                            <AnnotationsFrame />
                        </Suspense>
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