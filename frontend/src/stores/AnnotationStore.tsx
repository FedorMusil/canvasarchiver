import { create } from 'zustand';
import type { MutableRefObject } from 'react';

type ReplyTo = { annotationId: number; userId: string; name: string } | null;
type AnnotationStore = {
    replyTo: ReplyTo | null;
    setReplyTo: (replyTo: ReplyTo | null) => void;

    selectionId: string | null;
    setSelectionId: (selectionId: string | null) => void;

    oldContentsRef: MutableRefObject<HTMLDivElement | null>;
    setOldContentsRef: (oldContentsRef: MutableRefObject<HTMLDivElement | null>) => void;
    currentContentsRef: MutableRefObject<HTMLDivElement | null>;
    setCurrentContentsRef: (currentContentsRef: MutableRefObject<HTMLDivElement | null>) => void;
    changed: 'old' | 'current' | null;
    setChanged: (changed: 'old' | 'current' | null) => void;
};

export const useAnnotationStore = create<AnnotationStore>()((set) => ({
    replyTo: null,
    setReplyTo: (replyTo) => set({ replyTo }),

    selectionId: null,
    setSelectionId: (selectionId) => set({ selectionId }),

    oldContentsRef: { current: null },
    setOldContentsRef: (oldContentsRef) => set({ oldContentsRef }),
    currentContentsRef: { current: null },
    setCurrentContentsRef: (currentContentsRef) => set({ currentContentsRef }),
    changed: null,
    setChanged: (changed) => set({ changed }),
}));
