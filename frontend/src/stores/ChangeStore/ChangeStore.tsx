import { createStore } from 'zustand';
import { createContext, memo, useRef, type FC, type PropsWithChildren } from 'react';
import type { Highlighter } from '@/src/hooks/useHighlighter';

type ChangeProps = {
    curChangeId: number;
    selectedChangeId: number;
    materialId: number;
    highlighter: Highlighter;
    modifiedPanel?: 'prev' | 'cur';
};

export type ChangeState = {
    setCurChangeId: (changeId: number) => void;
    setSelectedChangeId: (changeId: number) => void;
    setMaterialId: (materialId: number) => void;
    setHighlighter: (highlighter: Highlighter) => void;
    setModifiedPanel: (panel: 'prev' | 'cur') => void;
} & ChangeProps;

type ChangeStore = ReturnType<typeof createChangeStore>;
const createChangeStore = (initProps: ChangeProps) => {
    return createStore<ChangeState>((set) => ({
        ...initProps,
        setCurChangeId: (changeId) => set({ curChangeId: changeId }),
        setSelectedChangeId: (changeId) => set({ selectedChangeId: changeId }),
        setMaterialId: (materialId) => set({ materialId }),
        setHighlighter: (highlighter) => set({ highlighter }),
        setModifiedPanel: (panel) => set({ modifiedPanel: panel }),
    }));
};

export const ChangeContext = createContext<ChangeStore | null>(null);

type ChangeStoreProviderProps = PropsWithChildren<ChangeProps>;
const ChangeStoreProvider: FC<ChangeStoreProviderProps> = memo(({ children, ...props }) => {
    const storeRef = useRef<ChangeStore>();
    if (!storeRef.current) storeRef.current = createChangeStore(props);

    return <ChangeContext.Provider value={storeRef.current}>{children}</ChangeContext.Provider>;
});
ChangeStoreProvider.displayName = 'ChangeStoreProvider';
export default ChangeStoreProvider;
