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
    newContentsRef: MutableRefObject<HTMLDivElement | null>;
    setNewContentsRef: (newContentsRef: MutableRefObject<HTMLDivElement | null>) => void;
};

export const useAnnotationStore = create<AnnotationStore>()((set) => ({
    replyTo: null,
    setReplyTo: (replyTo) => set({ replyTo }),

    selectionId: null,
    setSelectionId: (selectionId) => set({ selectionId }),

    oldContentsRef: { current: null },
    setOldContentsRef: (oldContentsRef) => set({ oldContentsRef }),
    newContentsRef: { current: null },
    setNewContentsRef: (newContentsRef) => set({ newContentsRef }),
}));
