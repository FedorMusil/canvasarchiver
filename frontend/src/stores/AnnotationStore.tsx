import { create } from 'zustand';

type ReplyTo = { annotationId: number; userId: number; name: string } | null;
type AnnotationStore = {
    replyTo: ReplyTo | null;
    setReplyTo: (replyTo: ReplyTo | null) => void;
};

export const useAnnotationStore = create<AnnotationStore>()((set) => ({
    replyTo: null,
    setReplyTo: (replyTo) => set({ replyTo }),
}));
