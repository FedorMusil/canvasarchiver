import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CompareWindowStore = {
    viewMode: 'horizontal' | 'vertical' | 'before' | 'after';
    setViewMode: (viewMode: 'horizontal' | 'vertical' | 'before' | 'after') => void;

    openAnnotations: boolean;
    setOpenAnnotations: (openAnnotations: boolean) => void;
};

export const useCompareWindowStore = create<CompareWindowStore>()(
    persist(
        (set) => ({
            viewMode: 'vertical',
            setViewMode: (viewMode) => set({ viewMode }),

            openAnnotations: false,
            setOpenAnnotations: (openAnnotations) => set({ openAnnotations }),
        }),
        {
            partialize: (state) => ({ viewMode: state.viewMode, openAnnotations: state.openAnnotations }),
            name: 'viewMode',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
