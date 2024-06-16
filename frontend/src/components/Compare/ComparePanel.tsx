import AnnotationsFrame from '../Annotations/AnnotationsFrame';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/src/components/ui/resizable';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useCompareIdContext } from '@/src/stores/CompareIdStore/useCompareIdStore';
import { useCompareWindowStore } from '@/src/stores/CompareWindowStore';
import { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';
import { memo, useCallback, useEffect, useRef, type FC, type ReactElement } from 'react';

const ComparePanel: FC = memo((): ReactElement => {
    const { openAnnotations, viewMode } = useCompareWindowStore(
        useShallow((state) => ({
            openAnnotations: state.openAnnotations,
            viewMode: state.viewMode,
        }))
    );

    const { change } = useCompareIdContext(useShallow((state) => ({ change: state.change })));

    const { handleMouseUp, handleMouseDown } = useHighlight();

    const oldContentsRef = useRef<HTMLDivElement>(null);
    const newContentsRef = useRef<HTMLDivElement>(null);

    const { setOldContentsRef, setNewContentsRef } = useAnnotationStore(
        useShallow((state) => ({
            setOldContentsRef: state.setOldContentsRef,
            setNewContentsRef: state.setNewContentsRef,
        }))
    );

    useEffect(() => {
        setOldContentsRef(oldContentsRef);
        setNewContentsRef(newContentsRef);
    }, [setOldContentsRef, setNewContentsRef]);

    return (
        <ResizablePanelGroup autoSaveId='compare-annotation' className='w-full flex-grow' direction='horizontal'>
            <ResizablePanel defaultSize={60} id='panel1' order={1}>
                <ResizablePanelGroup
                    autoSaveId='compare-panel'
                    className='w-full flex-grow'
                    direction={viewMode === 'vertical' ? 'vertical' : 'horizontal'}
                >
                    {viewMode !== 'after' && (
                        <ResizablePanel defaultSize={50} id='panel11' order={1}>
                            <div
                                className='h-full'
                                dangerouslySetInnerHTML={{ __html: change.old_contents }}
                                onMouseUp={handleMouseUp}
                                onMouseDown={handleMouseDown}
                                ref={oldContentsRef}
                            />
                        </ResizablePanel>
                    )}
                    {viewMode !== 'after' && viewMode !== 'before' && <ResizableHandle withHandle />}
                    {viewMode !== 'before' && (
                        <ResizablePanel defaultSize={50} id='panel12' order={2}>
                            <div
                                className='h-full'
                                dangerouslySetInnerHTML={{ __html: change.new_contents }}
                                onMouseUp={handleMouseUp}
                                onMouseDown={handleMouseDown}
                                ref={newContentsRef}
                            />
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

/**
 * Custom hook to handle text highlighting on mouse events.
 * @returns - An object containing handlers for mouse up and mouse down events.
 */
function useHighlight(): {
    handleMouseUp: () => void;
    handleMouseDown: () => void;
} {
    const { selectionId, setSelectionId } = useAnnotationStore((state) => ({
        selectionId: state.selectionId,
        setSelectionId: state.setSelectionId,
    }));

    const fullConfig = resolveConfig(tailwindConfig);

    /**
     * Callback function to highlight a given range of text.
     * @param range - The range of text to highlight.
     */
    const highLight = useCallback(
        (range: Range) => {
            // Extract the start and end nodes from the range
            const startNode = range.startContainer;
            const endNode = range.endContainer;

            // If either node is not present, exit the function.
            if (!startNode || !endNode) return;

            // Create a new range to highlight.
            const rangeHighlight = document.createRange();
            rangeHighlight.setStart(startNode, range.startOffset);
            rangeHighlight.setEnd(endNode, range.endOffset);

            // Create a new span element to apply the highlight.
            const highlight = document.createElement('span');
            // @ts-expect-error This is a custom color that is defined in the tailwind config.
            highlight.style.backgroundColor = fullConfig.theme.colors.highlight.selected;

            // Generate a unique ID for the highlight span
            const highlightId = uuidv4();
            highlight.id = highlightId;

            // Extract the contents of the range into the highlight span.
            highlight.appendChild(rangeHighlight.extractContents());

            // Insert the highlight span into the range.
            rangeHighlight.insertNode(highlight);

            return highlightId;
        },
        // @ts-expect-error This is a custom color that is defined in the tailwind config.
        [fullConfig.theme.colors.highlight.selected]
    );

    /**
     * Callback function to handle the mouse up event.
     * This function gets the current selection and applies the highlight.
     */
    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();

        // If there is a selection and it is not empty, apply the highlight.
        if (selection && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);

            const highlightId = highLight(range);
            if (highlightId) setSelectionId(highlightId);
        }
    }, [highLight, setSelectionId]);

    /**
     * Callback function to remove the highlight from all temporal highlighted elements.
     * A temporal highlight is a highlight that is not saved in the database.
     */
    const removeHighlight = useCallback(() => {
        if (!selectionId) return;

        // Remove all dom elements with the id 'temp-highlight'.
        const highlight = document.getElementById(selectionId);
        if (!highlight) return;

        const parent = highlight.parentElement;
        if (parent) {
            // Create a DocumentFragment to hold the children of the highlight
            const fragment = document.createDocumentFragment();
            while (highlight.firstChild) {
                // Move each child of highlight to the fragment
                fragment.appendChild(highlight.firstChild);
            }
            // Replace the highlight with its children
            parent.replaceChild(fragment, highlight);
            // Normalize the parent to merge adjacent text nodes
            parent.normalize();
        }
        setSelectionId(null);
    }, [selectionId, setSelectionId]);

    /**
     * Callback function to handle the mouse down event.
     * This function removes the highlight and clears the current selection.
     */
    const handleMouseDown = useCallback(() => {
        removeHighlight();
    }, [removeHighlight]);

    return { handleMouseUp, handleMouseDown };
}
