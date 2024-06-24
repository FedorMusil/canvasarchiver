import type { RefObject } from 'react';
import { create } from 'zustand';

type ReplyTo = { annotationId: number; userId: string; name: string } | null;
type AnnotationStore = {
    replyTo: ReplyTo | null;
    setReplyTo: (replyTo: ReplyTo | null) => void;

    selectionId: string | null;
    setSelectionId: (selectionId: string | null) => void;

    prevRef: RefObject<HTMLDivElement>;
    curRef: RefObject<HTMLDivElement>;
    setPrevRef: (ref: RefObject<HTMLDivElement>) => void;
    setCurRef: (ref: RefObject<HTMLDivElement>) => void;
};

export const useAnnotationStore = create<AnnotationStore>()((set) => ({
    replyTo: null,
    setReplyTo: (replyTo) => set({ replyTo }),

    selectionId: null,
    setSelectionId: (selectionId) => set({ selectionId }),

    prevRef: { current: null },
    curRef: { current: null },
    setPrevRef: (ref) => set({ prevRef: ref }),
    setCurRef: (ref) => set({ curRef: ref }),
}));
