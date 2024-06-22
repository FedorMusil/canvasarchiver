// --- Imports ---
import { useShallow } from 'zustand/react/shallow';
import { useCallback, useState, type RefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { useCompareWindowStore } from '../stores/CompareWindowStore';

// --- Rangy imports ---
// @ts-expect-error - The types for rangy do not seem correct.
import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier.js';
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-textrange';

export function useHighlight(): {
    /**
     * Highlights the selected text within the specified contents.
     * @param oldContentsRef The ref to the old content container.
     * @param currentContentsRef The ref to the current content container.
     */
    highlight: (oldContentsRef: RefObject<HTMLDivElement>, currentContentsRef: RefObject<HTMLDivElement>) => void;

    /**
     * Removes the highlight from the current selection.
     */
    removeHighlight: () => void;

    /**
     * Switches the selection of the current highlight.
     * @param id The id of the highlight to switch. If not provided, the current selection is used.
     */
    highlightSwitchSelection: (id?: string) => void;
} {
    const { selectionId, setSelectionId, setOldContentsRef, setCurrentContentsRef } = useAnnotationStore(
        useShallow((state) => ({
            selectionId: state.selectionId,
            setSelectionId: state.setSelectionId,

            setOldContentsRef: state.setOldContentsRef,
            setCurrentContentsRef: state.setCurrentContentsRef,
        }))
    );

    const { setOpenAnnotations } = useCompareWindowStore(
        useShallow((state) => ({ setOpenAnnotations: state.setOpenAnnotations }))
    );

    const container = document.getElementById('compare-panel');
    const [highlighter] = useState(rangy.createHighlighter(container, 'TextRange'));
    const classApplier = useCallback((id: string) => {
        return rangy.createClassApplier('highlight-selected', {
            elementAttributes: { 'data-group-id': id },
            normalize: false,
            useExistingElements: false,
        });
    }, []);

    function highlight(oldContentsRef: RefObject<HTMLDivElement>, currentContentsRef: RefObject<HTMLDivElement>) {
        const selection = window.getSelection();

        // If there is a selection and it is not empty, apply the highlight.
        if (selection && selection.toString().length > 0) {
            const id = uuidv4();
            highlighter.addClassApplier(classApplier(id));
            highlighter.highlightSelection('highlight-selected');

            setSelectionId(id);

            // Check if the selection is in the old or current contents and set the corresponding ref.
            if (oldContentsRef.current && oldContentsRef.current.contains(selection.anchorNode)) {
                setOldContentsRef(oldContentsRef);
            } else if (currentContentsRef.current && currentContentsRef.current.contains(selection.anchorNode)) {
                setCurrentContentsRef(currentContentsRef);
            }

            // To increase accessibility, open the annotations panel when a highlight is made.
            setOpenAnnotations(true);

            // Clear the selection after highlighting.
            selection.removeAllRanges();
        }
    }

    function removeHighlight() {
        if (!selectionId) return;

        const highlightElements = document.querySelectorAll(`[data-group-id="${selectionId}"]`);
        if (highlightElements) {
            const parentElements = Array.from(highlightElements).map((el) => el.parentElement);

            const highlight = highlighter.getHighlightForElement(highlightElements[0]);
            if (highlight) {
                highlighter.removeHighlights([highlight]);

                parentElements.forEach((el) => el?.normalize());
            }
        }

        setSelectionId(null);
        setOldContentsRef({ current: null });
        setCurrentContentsRef({ current: null });
    }

    function highlightSwitchSelection(id?: string) {
        const highlightElements = document.querySelectorAll(`[data-group-id="${id ?? selectionId}"]`);
        highlightElements.forEach((el) => {
            if (el.classList.contains('highlight-selected')) {
                el.classList.remove('highlight-selected');
                el.classList.add('highlight-unselected');
            } else if (el.classList.contains('highlight-unselected')) {
                el.classList.remove('highlight-unselected');
                el.classList.add('highlight-selected');
            }
        });
    }

    return {
        highlight,
        removeHighlight,
        highlightSwitchSelection,
    };
}
