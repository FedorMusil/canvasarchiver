import type { Change } from '@/src/api/change';
import { createStore } from 'zustand';
import { createContext, memo, useRef, type FC, type PropsWithChildren } from 'react';

type CompareIdProps = {
    changeId: number;
    materialId: number;
    change: Change;
};

export type CompareIdState = {
    changeChangeId: (changeId: number) => void;
    changeMaterialId: (materialId: number) => void;
    setChange: (change: Change) => void;
} & CompareIdProps;

type CompareIdStore = ReturnType<typeof createCompareIdStore>;
const createCompareIdStore = (initProps: CompareIdProps) => {
    return createStore<CompareIdState>((set) => ({
        ...initProps,
        changeChangeId: (changeId) => set({ changeId }),
        changeMaterialId: (materialId) => set({ materialId }),
        setChange: (change) => set({ change }),
    }));
};

export const CompareIdContext = createContext<CompareIdStore | null>(null);

type CompareIdStoreProviderProps = PropsWithChildren<CompareIdProps>;
const CompareIdStoreProvider: FC<CompareIdStoreProviderProps> = memo(({ children, ...props }) => {
    const storeRef = useRef<CompareIdStore>();
    if (!storeRef.current) storeRef.current = createCompareIdStore(props);

    return <CompareIdContext.Provider value={storeRef.current}>{children}</CompareIdContext.Provider>;
});
CompareIdStoreProvider.displayName = 'CompareIdStoreProvider';
export default CompareIdStoreProvider;
