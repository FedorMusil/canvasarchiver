import { useAnnotationStore } from '@/src/stores/AnnotationStore';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { useCompareWindowStore } from '../stores/CompareWindowStore';

// --- Rangy imports ---
// @ts-expect-error - The types for rangy do not seem correct.
import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier.js';

export type Highlighter = {
    /** Highlights the current selection with the given class name. */
    highlightSelection: (className: string, options?: object) => void;
    /** Unhighlights the current selection. */
    unhighlightSelection: (selection?: Selection) => void;
    /** Removes all highlights. */
    removeAllHighlights: () => void;
    /** Serializes the highlights. Can later be deserialized by deserialize. */
    serialize: (selection?: Selection) => string;
    /** Deserializes serialized highlights. */
    deserialize: (serializedSelection: string) => void;
    /** Gets the highlight for the given element. */
    getHighlightForElement: (element: Element) => object;
    /** Adds a class applier to the highlighter. */
    addClassApplier: (className: string, options?: object) => void;
    /** Removes a singular highlight. */
    removeHighlights: (highlights: object[]) => void;
};

export function useHighlight() {
    const { selectionId, setSelectionId } = useAnnotationStore(
        useShallow((state) => ({
            selectionId: state.selectionId,
            setSelectionId: state.setSelectionId,
        }))
    );

    const { setOpenAnnotations } = useCompareWindowStore(
        useShallow((state) => ({ setOpenAnnotations: state.setOpenAnnotations }))
    );

    /**
     * This function highlights the current selection.
     * @param highlighter - The rangy highlighter object to use.
     */
    function highlight(highlighter: Highlighter) {
        const selection = window.getSelection();

        // If there is a selection and it is not empty, apply the highlight.
        if (selection && selection.toString().length > 0) {
            const id = uuidv4();

            const classApplier = rangy.createClassApplier(`highlight-${id}`, {
                normalize: false,
                useExistingElements: false,
                onElementCreate: (el: HTMLElement) => {
                    el.classList.add('highlight-unselected');
                },
            });

            highlighter.addClassApplier(classApplier);
            highlighter.highlightSelection(`highlight-${id}`);

            setSelectionId(id);
            setOpenAnnotations(true);

            highlightSwitchSelection(id);

            // Clear the selection after highlighting.
            selection.removeAllRanges();
        }
    }

    /**
     * This function removes a singular highlight.
     * @param highlighter The rangy highlighter object to use.
     * @param id The id of the highlight to remove. If not provided, the current selection id will be used.
     */
    function removeHighlight(highlighter: Highlighter, id?: string) {
        const effectiveId = id ?? selectionId;
        if (!effectiveId) return;

        const highlightElements = document.querySelectorAll(`.highlight-${effectiveId}`);
        if (highlightElements.length > 0) {
            const parentElements = Array.from(highlightElements).map((el) => el.parentElement);
            const highlight = highlighter.getHighlightForElement(highlightElements[0]);

            if (highlight) {
                highlighter.removeHighlights([highlight]);

                highlightElements.forEach((el) => {
                    // Move children of the highlight element to its parent before removing the highlight element
                    while (el.firstChild) {
                        el.parentElement?.insertBefore(el.firstChild, el);
                    }
                    el.remove();
                });

                parentElements.forEach((el) => {
                    if (el && el.firstChild) {
                        el.normalize();
                    }
                });

                setSelectionId(null);
            }
        }
    }

    /**
     * This function removes all highlights.
     * @param highlighter The rangy highlighter object to use.
     */
    function removeAllHighlights(highlighter: Highlighter) {
        highlighter.removeAllHighlights();
    }

    /**
     * This function gets all highlights (serialized) in a subtree.
     * @param subtree The subtree to get highlights from.
     * @param highlighter The rangy highlighter object to use.
     */
    function getAllHighlights(subtree: Node, highlighter: Highlighter): string {
        const documentHighlights = highlighter.serialize();

        // Figure out which highlights are in the subtree
        const highlightsIds = documentHighlights.match(/highlight-[0-9a-fA-F-]+/g) || [];

        const subtreeHighlights = highlightsIds.reduce<string[]>((acc, highlight) => {
            const highlightElement = document.querySelector(`.${highlight}`);
            if (highlightElement && subtree.contains(highlightElement)) acc.push(highlight);
            return acc;
        }, []);

        const highlightArray = documentHighlights.split('|');
        for (let i = 1; i < highlightArray.length; i++) {
            const elementContainsHighlight = subtreeHighlights.some((subtreeHighlight) =>
                highlightArray[i].includes(subtreeHighlight)
            );
            if (!elementContainsHighlight) {
                highlightArray.splice(i, 1);
                i--;
            }
        }

        return highlightArray.join('|');
    }

    /**
     * This function deserializes serialized highlights.
     * @param highlights The serialized highlights to set.
     * @param highlighter The rangy highlighter object to use.
     */
    function setHighlights(highlights: string, highlighter: Highlighter) {
        highlighter.deserialize(highlights);
    }

    /**
     * This function highlights or unhighlights the current selection.
     * @param id The id of the selection to switch. If not provided, the current selection id will be used.
     */
    function highlightSwitchSelection(id?: string) {
        const highlightElements = document.querySelectorAll(`.highlight-${id ?? selectionId}`);

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
        removeAllHighlights,
        removeHighlight,
        getAllHighlights,
        setHighlights,
        highlightSwitchSelection,
    };
}
